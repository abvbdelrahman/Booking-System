import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  controllers: [AuthController],
  imports: [PrismaModule, NotificationsModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
