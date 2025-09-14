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
import { ServicesService } from './services.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AuthGuard } from 'src/common/Guards/auth.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Roles } from 'src/common/decorators/user.decorator';
@UseInterceptors(CacheInterceptor) // cache لكل الريكويست
@ApiTags('services')
@ApiBearerAuth('access-token')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Post()
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @Get()
  async findAll() {
    return await this.servicesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.servicesService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    return await this.servicesService.update(+id, updateServiceDto);
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.servicesService.remove(+id);
  }
}
