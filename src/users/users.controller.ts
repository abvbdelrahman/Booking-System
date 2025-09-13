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
import { UsersService } from './users.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from 'src/auth/strategies/decorators/user.decorator';
import { AuthGuard } from 'src/auth/strategies/Guards/auth.guard';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
@UseInterceptors(CacheInterceptor) // cache لكل الريكويست
@ApiTags('users')
@ApiBearerAuth('access-token')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('cache-test')
  @CacheKey('my-test-key') // اسم الكاش
  @CacheTTL(30) // TTL = 30 ثانية
  async cacheTest() {
    console.log('🎯 Executing cacheTest handler (بدون كاش)');
    return { value: 'hello world', time: new Date().toISOString() };
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Post()
  create() {
    return this.usersService.create();
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Roles(['USER', 'ADMIN'])
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Roles(['ADMIN'])
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.usersService.remove(+id);
  }
}
