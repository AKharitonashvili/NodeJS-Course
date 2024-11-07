import { Injectable, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { UserRepositoryService } from '../../../common/repositories/user-repository/user-repository.service';
import { VinylRepositoryService } from '../../../common/repositories/vinyl-repository/vinyl-repository.service';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventEnum } from '../../../common/enums/event.enum';

@Injectable()
export class PaymentService {
  private stripe: Stripe;

  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepositoryService,
    private readonly vinylRepository: VinylRepositoryService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY'),
      { apiVersion: '2024-09-30.acacia' },
    );
  }

  async handlePurchase(userId: number, createPaymentDto: CreatePaymentDto) {
    const { vinylId, count } = createPaymentDto;

    const vinyl = await this.vinylRepository.findVinylById(vinylId);
    if (!vinyl) {
      throw new NotFoundException('Vinyl not found.');
    }

    const totalPrice = vinyl.price * count;
    await this.userRepository.updatePurchasedVinyls(userId, vinylId, count);
    const user = await this.userRepository.findById(userId);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: totalPrice * 100,
      currency: 'USD',
      payment_method: 'pm_card_visa',
      confirm: true,
      description: `Payment for vinyl ${vinyl.name}`,
      metadata: { vinylId, userId },
      receipt_email: user.email,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
    });

    this.eventEmitter.emit(EventEnum.VINYL_PURCHASED, {
      user,
      vinylName: vinyl.name,
      count,
      totalPrice,
    });

    return {
      message: 'Vinyl purchased successfully',
      paymentIntentId: paymentIntent.id,
    };
  }
}
