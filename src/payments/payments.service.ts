import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/notifications/notifications.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const { bookingId, status, amount } = createPaymentDto;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, service: true, payment: true },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.payment && booking.payment.status === 'SUCCESS') {
      throw new Error('Booking is already paid');
    }

    const payment = await this.prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: { amount, status: status ?? 'PENDING' },
      create: {
        bookingId,
        amount,
        status: status ?? 'PENDING',
      },
    });

    try {
      await this.emailService.sendMail({
        to: booking.user.email,
        subject: 'Payment Confirmation',
        html: `<h1>Payment Confirmed</h1>`,
      });
    } catch (error: any) {}

    return payment;
  }

  async createCheckoutSession(
    bookingId: number,
    successUrl: string,
    cancelUrl: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true, service: true, payment: true },
    });

    if (!booking) throw new Error('Booking not found');

    if (booking.payment && booking.payment.status === 'SUCCESS') {
      throw new Error('Booking is already paid');
    }

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: booking.user.email ?? undefined,
      client_reference_id: booking.id.toString(),
      line_items: [
        {
          price_data: {
            currency: 'egp',
            product_data: {
              name: booking.service.name,
              description: booking.service.description ?? '',
            },
            unit_amount: Math.round(booking.service.price * 100),
          },
          quantity: 1,
        },
      ],
    };

    const session = await this.stripe.checkout.sessions.create(params);

    await this.prisma.payment.upsert({
      where: { bookingId: booking.id },
      update: {
        amount: booking.service.price,
        status: 'PENDING',
        stripeSessionId: session.id,
      },
      create: {
        bookingId: booking.id,
        amount: booking.service.price,
        status: 'PENDING',
        stripeSessionId: session.id,
      },
    });

    return session;
  }

  async findAll() {
    return this.prisma.payment.findMany({
      include: { booking: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: { booking: true },
    });
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return this.prisma.payment.update({
      where: { id },
      data: updatePaymentDto,
    });
  }

  async remove(id: number) {
    return this.prisma.payment.delete({ where: { id } });
  }

  async handleWebhook(event: Stripe.Event) {
    const updateSuccess = async (session: Stripe.Checkout.Session) => {
      const bookingId = session.client_reference_id
        ? Number(session.client_reference_id)
        : undefined;

      const bySession = await this.prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: 'SUCCESS' },
      });

      if (bySession.count === 0 && bookingId) {
        const byBooking = await this.prisma.payment.updateMany({
          where: { bookingId },
          data: { status: 'SUCCESS', stripeSessionId: session.id },
        });
      }

      if (session.customer_email) {
        try {
          await this.emailService.sendMail({
            to: session.customer_email,
            subject: 'Payment Successful',
            html: `
              <h1>Thank you for your payment!</h1>
              <p>Your booking has been confirmed successfully.</p>
            `,
          });
        } catch (error: any) {}
      }
    };

    const updateFailed = async (session: Stripe.Checkout.Session) => {
      const bookingId = session.client_reference_id
        ? Number(session.client_reference_id)
        : undefined;

      const bySession = await this.prisma.payment.updateMany({
        where: { stripeSessionId: session.id },
        data: { status: 'FAILED' },
      });
      if (bySession.count === 0 && bookingId) {
        const byBooking = await this.prisma.payment.updateMany({
          where: { bookingId },
          data: { status: 'FAILED', stripeSessionId: session.id },
        });
      }
    };

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await updateSuccess(session);
    }

    if (event.type === 'checkout.session.async_payment_succeeded') {
      const session = event.data.object as Stripe.Checkout.Session;
      await updateSuccess(session);
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      await updateFailed(session);
    }

    if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await updateFailed(session);
    }
  }
}
