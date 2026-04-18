import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from '../../common/database/database.service';
import { UserRole, TenantPlan } from '../../types/prisma-enums';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  InviteUserDto,
  ChangePasswordDto,
} from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ─── Register (creates tenant + admin user) ───────────────
  async register(dto: RegisterDto) {
    // Check if subdomain is taken
    const existing = await this.db.tenant.findUnique({
      where: { subdomain: dto.subdomain },
    });
    if (existing) {
      throw new ConflictException('Subdomain is already taken');
    }

    // Check if email is already used
    const existingUser = await this.db.user.findFirst({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Create tenant + user in a transaction
    const result = await this.db.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: dto.churchName,
          subdomain: dto.subdomain.toLowerCase(),
          plan: TenantPlan.FREE,
          status: 'TRIAL',
          currency: 'GHS',
          timezone: 'Africa/Accra',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          settings: {
            brandColor: '#2E75B6',
            welcomeMessage: `Welcome to ${dto.churchName}!`,
          },
        },
      });

      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: dto.email.toLowerCase(),
          passwordHash,
          role: UserRole.PASTOR,
          firstName: dto.firstName,
          lastName: dto.lastName,
          isActive: true,
        },
      });

      return { tenant, user };
    });

    // Generate tokens
    const tokens = await this.generateTokens(result.user.id, result.tenant.id, result.user.role);

    // Store refresh token
    await this.storeRefreshToken(result.user.id, tokens.refreshToken);

    return {
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        subdomain: result.tenant.subdomain,
      },
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
      },
      ...tokens,
    };
  }

  // ─── Login ────────────────────────────────────────────────
  async login(dto: LoginDto) {
    const user = await this.db.user.findFirst({
      where: {
        email: dto.email.toLowerCase(),
        isActive: true,
      },
      include: {
        tenant: {
          select: { id: true, name: true, subdomain: true, status: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.tenant.status === 'SUSPENDED') {
      throw new UnauthorizedException('This church account has been suspended');
    }

    if (user.tenant.status === 'CANCELLED') {
      throw new UnauthorizedException('This church account has been cancelled');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    await this.db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.tenantId, user.role);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        subdomain: user.tenant.subdomain,
      },
      ...tokens,
    };
  }

  // ─── Refresh Token ────────────────────────────────────────
  async refresh(dto: RefreshTokenDto) {
    const storedToken = await this.db.refreshToken.findUnique({
      where: { token: dto.refreshToken },
      include: {
        user: {
          select: { id: true, tenantId: true, role: true, isActive: true },
        },
      },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!storedToken.user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    // Revoke the old refresh token (rotation)
    await this.db.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    const tokens = await this.generateTokens(
      storedToken.user.id,
      storedToken.user.tenantId,
      storedToken.user.role,
    );
    await this.storeRefreshToken(storedToken.user.id, tokens.refreshToken);

    return tokens;
  }

  // ─── Invite User ──────────────────────────────────────────
  async inviteUser(dto: InviteUserDto, tenantId: string, invitedByUserId: string) {
    const existing = await this.db.user.findFirst({
      where: { email: dto.email.toLowerCase(), tenantId },
    });
    if (existing) {
      throw new ConflictException('User with this email already exists in this church');
    }

    // Generate a temporary password (user must change on first login)
    const tempPassword = uuidv4().slice(0, 12);
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const user = await this.db.user.create({
      data: {
        tenantId,
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        isActive: true,
      },
    });

    // Log the action
    await this.db.auditLog.create({
      data: {
        tenantId,
        userId: invitedByUserId,
        action: 'INVITE_USER',
        entity: 'user',
        entityId: user.id,
        changes: { email: dto.email, role: dto.role },
      },
    });

    // TODO: Send invitation email with temporary password
    // For now, return the temp password (in production, email it)
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      temporaryPassword: tempPassword, // Remove this in production — send via email
    };
  }

  // ─── Change Password ─────────────────────────────────────
  async changePassword(dto: ChangePasswordDto, userId: string) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isValid) throw new BadRequestException('Current password is incorrect');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.db.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke all refresh tokens (force re-login everywhere)
    await this.db.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Password changed successfully' };
  }

  // ─── Logout (revoke refresh token) ────────────────────────
  async logout(refreshToken: string) {
    await this.db.refreshToken.updateMany({
      where: { token: refreshToken, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'Logged out successfully' };
  }

  // ─── Get Current User Profile ─────────────────────────────
  async getProfile(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        phone: true,
        lastLoginAt: true,
        twoFactorEnabled: true,
        createdAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            plan: true,
            currency: true,
            timezone: true,
            logoUrl: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ─── Update User Profile ──────────────────────────────────
  async updateProfile(userId: string, dto: { firstName?: string; lastName?: string }) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.db.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
      },
    });

    return updated;
  }

  // ─── Get Tenant Settings ──────────────────────────────────
  async getTenant(tenantId: string) {
    const tenant = await this.db.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        subdomain: true,
        currency: true,
        timezone: true,
        logoUrl: true,
        plan: true,
        status: true,
      },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    return tenant;
  }

  // ─── Update Tenant Settings ───────────────────────────────
  async updateTenant(tenantId: string, dto: { name?: string; currency?: string; timezone?: string }) {
    const tenant = await this.db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const updated = await this.db.tenant.update({
      where: { id: tenantId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.currency !== undefined && { currency: dto.currency as any }),
        ...(dto.timezone !== undefined && { timezone: dto.timezone }),
      },
      select: {
        id: true,
        name: true,
        subdomain: true,
        currency: true,
        timezone: true,
        logoUrl: true,
      },
    });

    return updated;
  }

  // ─── Forgot Password ───────────────────────────────────────
  async forgotPassword(email: string, tenantId?: string) {
    // Find user - if tenantId provided, scope to tenant; otherwise find any match
    const where: any = { email: email.toLowerCase(), isActive: true };
    if (tenantId) where.tenantId = tenantId;

    const user = await this.db.user.findFirst({ where });

    // Always return success to prevent email enumeration
    if (!user) {
      return { message: 'If an account exists with that email, a reset link has been sent.' };
    }

    // Generate a secure reset token
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store hashed token on user
    await this.db.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash,
        resetTokenExpiresAt,
      } as any,
    });

    // TODO: Send email with reset link
    // In production, use Resend/SendGrid/etc. to send:
    // https://yourapp.qahal.app/auth/reset-password?token={resetToken}
    //
    // For now, log to console so you can test locally:
    const resetUrl = `http://localhost:3000/auth/reset-password?token=${resetToken}`;
    console.log('─── PASSWORD RESET LINK ───');
    console.log(`User: ${user.email}`);
    console.log(`URL: ${resetUrl}`);
    console.log('───────────────────────────');

    return { message: 'If an account exists with that email, a reset link has been sent.' };
  }

  // ─── Reset Password (with token from email) ──────────────
  async resetPassword(token: string, newPassword: string) {
    const crypto = await import('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching non-expired token
    const user = await this.db.user.findFirst({
      where: {
        resetTokenHash: tokenHash,
        resetTokenExpiresAt: { gt: new Date() },
        isActive: true,
      } as any,
    });

    if (!user) {
      throw new BadRequestException('Reset link is invalid or has expired. Please request a new one.');
    }

    // Hash new password and clear reset token
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetTokenHash: null,
        resetTokenExpiresAt: null,
      } as any,
    });

    // Revoke all refresh tokens (force re-login everywhere)
    await this.db.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Password has been reset successfully. You can now sign in.' };
  }

  // ─── Private Helpers ──────────────────────────────────────
  private async generateTokens(userId: string, tenantId: string, role: string) {
    const payload = { sub: userId, tenantId, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: this.config.get<string>('JWT_EXPIRY') || '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRY') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.db.refreshToken.create({
      data: { userId, token, expiresAt },
    });

    // Clean up old expired tokens for this user
    await this.db.refreshToken.deleteMany({
      where: {
        userId,
        OR: [
          { expiresAt: { lt: new Date() } },
          { revokedAt: { not: null } },
        ],
      },
    });
  }
}
