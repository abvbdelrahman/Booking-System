import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/notifications/notifications.service';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(createBookingDto: CreateBookingDto) {
    const { userId, serviceId } = createBookingDto;
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });
    const booking = await this.prisma.booking.create({
      data: { userId, serviceId },
    });

    try {
      if (user && service) {
        await this.emailService.sendMail({
          to: user.email,
          subject: 'Booking Confirmation',
          html: `<h1>Booking Confirmed</h1>`,
        });
      }
    } catch (error: any) {
      console.error(
        'Failed to send booking confirmation email:',
        error?.message ?? error,
      );
    }
    return booking;
  }
  async findAll() {
    const bookings = await this.prisma.booking.findMany({
      include: { user: true, service: true },
    });
    return bookings;
  }

  async findOne(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { user: true, service: true },
    });
    return booking;
  }
  async update(id: number, updateBookingDto: UpdateBookingDto) {
    const { userId, serviceId } = updateBookingDto;

    const existingBooking = await this.prisma.booking.findUnique({
      where: { id },
    });
    if (!existingBooking) {
      throw new Error(`Booking with ID ${id} not found`);
    }

    if (userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
    }

    if (serviceId) {
      const service = await this.prisma.service.findUnique({
        where: { id: serviceId },
      });
      if (!service) {
        throw new Error(`Service with ID ${serviceId} not found`);
      }
    }

    const allowedFields = ['userId', 'serviceId', 'date', 'status'];
    const data = Object.fromEntries(
      Object.entries(updateBookingDto).filter(
        ([key, value]) => allowedFields.includes(key) && value !== undefined,
      ),
    );

    const updatedBooking = await this.prisma.booking.update({
      where: { id },
      data,
      include: { user: true, service: true },
    });

    try {
      await this.emailService.sendMail({
        to: updatedBooking.user.email,
        subject: 'Booking Updated',
        html: `
        <h1>Your booking has been updated</h1>
        <p>Service: ${updatedBooking.service.name}</p>
        <p>Date: ${Date.now()}</p>
        <p>Status: ${updatedBooking.status}</p>
      `,
      });
    } catch (error: any) {
      console.error('Failed to send update email:', error.message);
    }

    return updatedBooking;
  }

  async remove(id: number) {
    const existingBooking = await this.prisma.booking.findUnique({
      where: { id },
    });
    if (!existingBooking) {
      throw new Error(`Booking with ID ${id} not found`);
    }
    await this.prisma.booking.delete({ where: { id } });
    return `This action removes a #${id} booking`;
  }
}
