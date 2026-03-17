import {
  Controller,
  Post,
  Get,
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
}
