import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  controllers: [AuthController],
  imports: [
    PassportModule.register({ session: false }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret', // حط قيمة في .env
      signOptions: { expiresIn: '1h' },
    }),
    PrismaModule,
    NotificationsModule,
  ],
  providers: [AuthService, GoogleStrategy, FacebookStrategy],
  exports: [AuthService],
})
export class AuthModule {}
