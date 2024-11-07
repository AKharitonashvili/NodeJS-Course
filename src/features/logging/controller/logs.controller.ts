import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from '../entities/log.entity';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { SortBy } from '../../../common/enums/query.enum';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Logs')
@ApiBearerAuth()
@Controller('logs')
@UseGuards(AdminGuard)
export class LogsController {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all system logs' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved system logs',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, only admins can access logs',
  })
  async getAllLogs() {
    return this.logRepository.find({ order: { timestamp: SortBy.DESC } });
  }
}
