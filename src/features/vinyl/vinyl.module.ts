import { Module, ValidationPipe } from '@nestjs/common';
import { VinylService } from './services/vinyl.service';
import { VinylController } from './controllers/vinyl.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vinyl } from './entities/vinyl.entity';
import { APP_PIPE } from '@nestjs/core';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [CommonModule, TypeOrmModule.forFeature([Vinyl])],
  providers: [
    VinylService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
  controllers: [VinylController],
})
export class VinylModule {}
