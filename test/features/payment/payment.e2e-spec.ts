import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../../src/app.module';
import { JwtService } from '@nestjs/jwt';

jest.mock('../../../src/common/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: class MockJwtAuthGuard {
    canActivate() {
      return true;
    }
  },
}));

describe('PaymentController (e2e) - Authorized User', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let accessToken: string;
  const mockUserId = 1;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    accessToken = jwtService.sign({ sub: mockUserId });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/payments/purchase-vinyl (POST) should allow authorized user to purchase a vinyl', async () => {
    const paymentData = {
      count: 1,
      vinylId: 40,
    };

    const response = await supertest(app.getHttpServer())
      .post('/payments/purchase-vinyl')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(paymentData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty(
      'message',
      'Vinyl purchased successfully',
    );
    expect(response.body).toHaveProperty('paymentIntentId');
  });

  it('/payments/purchase-vinyl (POST) should return 400 for invalid payment details', async () => {
    const invalidPaymentData = {
      count: 0,
      vinylId: 40,
    };

    const response = await supertest(app.getHttpServer())
      .post('/payments/purchase-vinyl')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(invalidPaymentData);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error', 'Bad Request');
  });
});
