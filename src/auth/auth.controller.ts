import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/strategies/Guards/auth.guard';

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
  @UseGuards(AuthGuard)
  async logout(@Req() req: Request) {
    const userId = (req as any)?.user?.sub as number;
    return this.authService.logout(userId);
  }
}
