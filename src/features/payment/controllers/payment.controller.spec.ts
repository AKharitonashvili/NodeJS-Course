import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from '../services/payment.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { CreatePaymentDto } from '../dtos/create-payment.dto';

describe('PaymentController', () => {
  let controller: PaymentController;
  let paymentService: PaymentService;

  const mockPaymentService = {
    handlePurchase: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<PaymentController>(PaymentController);
    paymentService = module.get<PaymentService>(PaymentService);
  });

  it('should throw a BadRequestException if payment details are invalid', async () => {
    const userId = 1;
    const invalidPaymentDto: CreatePaymentDto = { vinylId: 1, count: -1 };

    const validationPipe = new ValidationPipe();

    await expect(
      validationPipe
        .transform(invalidPaymentDto, {
          type: 'body',
          metatype: CreatePaymentDto,
        })
        .then(() => controller.purchaseVinyl(invalidPaymentDto, userId)),
    ).rejects.toThrow(BadRequestException);

    expect(mockPaymentService.handlePurchase).not.toHaveBeenCalled();
  });
});
