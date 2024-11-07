import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserID } from '../../../common/decorators/user-id.decorator';
import { createVinyMock } from '../mocks/payments.mocks';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('purchase-vinyl')
  @ApiOperation({ summary: 'Purchase a vinyl record' })
  @ApiResponse({
    status: 201,
    description: 'Vinyl purchased successfully',
    schema: {
      example: {
        message: 'Vinyl purchased successfully',
        paymentIntentId: 'pi_1J2m3X2eZvKYlo2C4ZT5bW2y',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payment details provided',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid payment details provided',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized, token missing or invalid',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiBody({
    description: 'Data to update a vinyl record',
    schema: {
      example: createVinyMock,
    },
  })
  async purchaseVinyl(
    @Body() createPaymentDto: CreatePaymentDto,
    @UserID() userId: number,
  ) {
    return this.paymentService.handlePurchase(userId, createPaymentDto);
  }
}
