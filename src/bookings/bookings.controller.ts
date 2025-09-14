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
import { BookingsService } from './bookings.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { AuthGuard } from 'src/common/Guards/auth.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/user.decorator';
@UseInterceptors(CacheInterceptor) // cache لكل الريكويست
@ApiTags('bookings')
@ApiBearerAuth('access-token')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @UseGuards(AuthGuard)
  @Roles(['USER'])
  @Post()
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser() currentUser: any,
  ) {
    const userId = (currentUser?.id ?? currentUser?.sub) as number;
    if (!userId) {
      throw new Error('Unauthorized: missing user context');
    }
    return this.bookingsService.create({ ...createBookingDto, userId });
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Get()
  async findAll() {
    return await this.bookingsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.bookingsService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @CurrentUser() currentUser: any,
  ) {
    const userId = (currentUser?.id ?? currentUser?.sub) as number;
    return await this.bookingsService.update(+id, {
      ...updateBookingDto,
      userId,
    });
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.bookingsService.remove(+id);
  }
}
