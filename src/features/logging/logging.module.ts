import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsController } from './controller/logs.controller';
import { Log } from './entities/log.entity';
import { LogSubscriber } from './subscriber/log.subscriber';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([Log])],
  controllers: [LogsController],
  providers: [LogSubscriber],
  exports: [TypeOrmModule],
})
export class LoggingModule {}
