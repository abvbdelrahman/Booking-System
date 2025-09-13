import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async create(createReportDto: CreateReportDto) {
    const report = await this.prisma.report.create({ data: createReportDto });

    return report;
  }

  async findAll() {
    return this.prisma.report.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        booking: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new Error('Report not found');
    }
    return report;
  }

  async update(id: number, updateReportDto: UpdateReportDto) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new Error('Report not found');
    }
    const updatedReport = this.prisma.report.update({
      where: { id },
      data: updateReportDto,
    });
    return updatedReport;
  }

  async remove(id: number) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new Error('Report not found');
    }
    return this.prisma.report.delete({ where: { id } });
  }
}
