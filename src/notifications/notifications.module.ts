import { Module } from '@nestjs/common';
import { EmailService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { EmailProducerService } from './producer.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [BullModule.registerQueue({ name: 'email' })], // هنا مهم

  providers: [EmailService, EmailProducerService],
  controllers: [NotificationsController],
  exports: [EmailService, EmailProducerService],
})
export class NotificationsModule {}
