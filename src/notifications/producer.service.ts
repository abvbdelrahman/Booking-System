import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class EmailProducerService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendEmail(email: string, subject: string, body: string) {
    await this.emailQueue.add('send-email', {
      email,
      subject,
      body,
    });
  }
}
