import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/Guards/auth.guard';
import { EmailService } from './notifications.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { EmailProducerService } from './producer.service';
import { Roles } from 'src/common/decorators/user.decorator';

@ApiTags('notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly emailService: EmailService,
    private emailProducer: EmailProducerService,
  ) {}

  @Post()
  async send(
    @Body() body: { email: string; subject: string; message: string },
  ) {
    await this.emailProducer.sendEmail(body.email, body.subject, body.message);
    return { status: 'Email job added to queue' };
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Post('send')
  async sendEmail(@Body() body: any) {
    const html = `
      <p>You have a new contact request</p>
      <h3>Contact Details</h3>
      <ul>  
        <li>Name: ${body.name}</li>
        <li>Company: ${body.company}</li>
        <li>Email: ${body.email}</li>
        <li>Phone: ${body.phone}</li>
      </ul>
      <h3>Message</h3>
      <p>${body.message}</p>
    `;
    await this.emailService.sendMail({
      to: body.recipientEmail,
      subject: 'New Contact Request',
      html,
    });
    return { message: 'Email sent' };
  }
}
