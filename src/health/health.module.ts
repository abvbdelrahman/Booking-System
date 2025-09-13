import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [TerminusModule, NotificationsModule], // 👈 هنا
  controllers: [HealthController],
})
export class HealthModule {}
