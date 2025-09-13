import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}
  async create(createServiceDto: CreateServiceDto) {
    const { name, description, price, available } = createServiceDto;
    const service = await this.prisma.service.create({
      data: { name, description, price, available },
    });
    return service;
  }

  async findAll() {
    const services = await this.prisma.service.findMany({
      include: { bookings: true },
    });
    return services;
  }

  async findOne(id: number) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      select: {
        bookings: true,
        name: true,
        description: true,
        price: true,
        available: true,
      },
    });
    return service;
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    const { name, description, price, available } = updateServiceDto;

    const existingService = await this.prisma.service.findUnique({
      where: { id },
    });
    if (!existingService) {
      throw new Error('Service not found');
    }

    const updatedService = await this.prisma.service.update({
      where: { id },
      data: { name, description, price, available },
    });

    return updatedService;
  }

  async remove(id: number) {
    const existingService = await this.prisma.service.findUnique({
      where: { id },
    });
    if (!existingService) {
      throw new Error('Service not found');
    }
    await this.prisma.service.delete({ where: { id } });
    return `this action removes a #${id} service`;
  }
}
