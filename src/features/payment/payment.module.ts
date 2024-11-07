import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './controllers/payment.controller';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [CommonModule],
  providers: [PaymentService],
  controllers: [PaymentController],
})
export class PaymentModule {}
