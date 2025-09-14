import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { AuthGuard } from 'src/common/Guards/auth.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Roles } from 'src/common/decorators/user.decorator';

@UseInterceptors(CacheInterceptor) // cache لكل الريكويست
@ApiTags('reports')
@ApiBearerAuth('access-token')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @UseGuards(AuthGuard)
  @Roles(['USER'])
  @Post()
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportsService.update(+id, updateReportDto);
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportsService.remove(+id);
  }
}
