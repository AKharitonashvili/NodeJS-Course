import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { ConfigService } from '@nestjs/config';
import { UserRepositoryService } from '../../../common/repositories/user-repository/user-repository.service';
import { VinylRepositoryService } from '../../../common/repositories/vinyl-repository/vinyl-repository.service';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Stripe from 'stripe';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { Vinyl } from '../../vinyl/entities/vinyl.entity';
import { User } from '../../users/entities/user.entity';

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    paymentIntents: {
      create: jest.fn(),
    },
  }));
});

describe('PaymentService', () => {
  let service: PaymentService;
  let userRepository: UserRepositoryService;
  let vinylRepository: VinylRepositoryService;
  let eventEmitter: EventEmitter2;
  let stripeMock: jest.Mocked<Stripe>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test_stripe_key'),
          },
        },
        {
          provide: UserRepositoryService,
          useValue: {
            updatePurchasedVinyls: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: VinylRepositoryService,
          useValue: {
            findVinylById: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    userRepository = module.get<UserRepositoryService>(UserRepositoryService);
    vinylRepository = module.get<VinylRepositoryService>(
      VinylRepositoryService,
    );
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    stripeMock = new Stripe('test_stripe_key', {
      apiVersion: '2024-09-30.acacia',
    }) as jest.Mocked<Stripe>;

    service['stripe'] = stripeMock;
  });

  it('should handle a successful purchase', async () => {
    const userId = 1;
    const vinylId = 1;
    const createPaymentDto: CreatePaymentDto = { vinylId, count: 2 };

    const vinyl: Vinyl = {
      id: vinylId,
      price: 20,
      name: 'Sample Vinyl',
    } as Vinyl;

    const user: User = {
      id: userId,
      email: 'user@example.com',
    } as User;

    const paymentIntent = { id: 'pi_12345' };

    jest.spyOn(vinylRepository, 'findVinylById').mockResolvedValue(vinyl);
    jest
      .spyOn(userRepository, 'updatePurchasedVinyls')
      .mockResolvedValue(void 0);
    jest.spyOn(userRepository, 'findById').mockResolvedValue(user);
    (stripeMock.paymentIntents.create as jest.Mock).mockResolvedValue(
      paymentIntent as Stripe.Response<Stripe.PaymentIntent>,
    );

    const result = await service.handlePurchase(userId, createPaymentDto);

    expect(result).toEqual({
      message: 'Vinyl purchased successfully',
      paymentIntentId: paymentIntent.id,
    });
    expect(vinylRepository.findVinylById).toHaveBeenCalledWith(vinylId);
    expect(userRepository.updatePurchasedVinyls).toHaveBeenCalledWith(
      userId,
      vinylId,
      createPaymentDto.count,
    );
    expect(userRepository.findById).toHaveBeenCalledWith(userId);
    expect(eventEmitter.emit).toHaveBeenCalledWith('vinyl.purchased', {
      user,
      vinylName: vinyl.name,
      count: createPaymentDto.count,
      totalPrice: 40,
    });
  });

  it('should throw NotFoundException if vinyl is not found', async () => {
    const userId = 1;
    const createPaymentDto: CreatePaymentDto = { vinylId: 1, count: 2 };

    jest.spyOn(vinylRepository, 'findVinylById').mockResolvedValue(null);

    await expect(
      service.handlePurchase(userId, createPaymentDto),
    ).rejects.toThrow(NotFoundException);
    expect(vinylRepository.findVinylById).toHaveBeenCalledWith(
      createPaymentDto.vinylId,
    );
  });
});
