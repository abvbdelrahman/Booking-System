import { Body, Controller, Get, Post, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import type { Request } from 'express';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { AuthGuard as CustomAuthGuard } from 'src/common/Guards/auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
  @Post('login')
  async login(@Body() Body: { email: string; password: string }) {
    return this.authService.login(Body.email, Body.password);
  }

  @Post('logout')
  @ApiBearerAuth('access-token')
  @UseGuards(CustomAuthGuard)
  async logout() {
    return this.authService.logout();
  }

  @Get('google')
  @UseGuards(PassportAuthGuard('google'))
  async googleAuth() {
    // بيروح يعمل Redirect لجوجل
  }

  @Get('google/callback')
  @UseGuards(PassportAuthGuard('google'))
  googleAuthRedirect(@Req() req) {
    return this.authService.generateJwt(req.user);
  }

  // --- Facebook ---
  @Get('facebook')
  @UseGuards(PassportAuthGuard('facebook'))
  async facebookAuth() {
    // بيروح يعمل Redirect لفيسبوك
  }

  @Get('facebook/callback')
  @UseGuards(PassportAuthGuard('facebook'))
  facebookAuthRedirect(@Req() req) {
    return this.authService.generateJwt(req.user);
  }
}
