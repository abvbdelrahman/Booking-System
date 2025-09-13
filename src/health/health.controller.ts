import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { EmailProducerService } from 'src/notifications/producer.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaService,
    private readonly emailProducerService: EmailProducerService, // هنا المشكلة

  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      async () => {
        await this.prisma.$queryRaw`SELECT 1`; // Ping DB
        return { prisma: { status: 'up' } };
      },
    ]);
  }
}
