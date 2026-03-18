import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentTenant, CurrentUser } from '../../common/decorators/tenant.decorator';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  InviteUserDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new church (creates tenant + admin user)' })
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto);
    return { success: true, data };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto, @CurrentTenant() tenant: any) {
    const data = await this.authService.login(dto, tenant.id);
    return { success: true, data };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    const data = await this.authService.refresh(dto);
    return { success: true, data };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (revoke refresh token)' })
  async logout(@Body() dto: RefreshTokenDto) {
    const data = await this.authService.logout(dto.refreshToken);
    return { success: true, data };
  }

  @Post('invite')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('PASTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Invite a new user to the church' })
  async invite(
    @Body() dto: InviteUserDto,
    @CurrentTenant() tenant: any,
    @CurrentUser() user: any,
  ) {
    const data = await this.authService.inviteUser(dto, tenant.id, user.sub);
    return { success: true, data };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change current user password' })
  async changePassword(@Body() dto: ChangePasswordDto, @CurrentUser() user: any) {
    const data = await this.authService.changePassword(dto, user.sub);
    return { success: true, data };
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    const data = await this.authService.getProfile(user.sub);
    return { success: true, data };
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile (first name, last name)' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: { firstName?: string; lastName?: string },
  ) {
    const data = await this.authService.updateProfile(user.sub, dto);
    return { success: true, data };
  }

  @Get('tenant')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current tenant (church) settings' })
  async getTenant(@CurrentTenant() tenant: any) {
    const data = await this.authService.getTenant(tenant.id);
    return { success: true, data };
  }

  @Patch('tenant')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('PASTOR', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tenant (church) settings' })
  async updateTenant(
    @CurrentTenant() tenant: any,
    @Body() dto: { name?: string; currency?: string; timezone?: string },
  ) {
    const data = await this.authService.updateTenant(tenant.id, dto);
    return { success: true, data };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset link' })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @CurrentTenant() tenant: any) {
    const data = await this.authService.forgotPassword(dto.email, tenant?.id);
    return { success: true, data };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token from email' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const data = await this.authService.resetPassword(dto.token, dto.password);
    return { success: true, data };
  }
}
