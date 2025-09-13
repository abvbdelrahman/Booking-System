import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/strategies/decorators/user.decorator';
import { AuthGuard } from 'src/auth/strategies/Guards/auth.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
@UseInterceptors(CacheInterceptor) // cache لكل الريكويست
@ApiTags('payments')
@ApiBearerAuth('access-token')
@Controller('payments')
export class PaymentsController {
  private stripe: Stripe;

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.get<string>('STRIPE_SECRET_KEY')!);
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(+id, updatePaymentDto);
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(+id);
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Post('checkout/:bookingId')
  async createCheckoutSession(
    @Param('bookingId') bookingId: string,
    @Body()
    body: {
      successUrl: string;
      cancelUrl: string;
    },
  ) {
    return this.paymentsService.createCheckoutSession(
      +bookingId,
      body.successUrl,
      body.cancelUrl,
    );
  }

  @Post('webhook')
  async handleWebhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body as Buffer,
        sig!,
        this.config.get<string>('STRIPE_WEBHOOK_SECRET')!,
      );
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    await this.paymentsService.handleWebhook(event);

    res.json({ received: true });
  }
}
