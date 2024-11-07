import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../../src/app.module';
import { JwtService } from '@nestjs/jwt';

describe('PaymentController Unauthorized (e2e) - Authorized User', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/payments/purchase-vinyl (POST) should return 401 if no token is provided', async () => {
    const paymentData = {
      count: 1,
      vinylId: 1,
    };

    const response = await supertest(app.getHttpServer())
      .post('/payments/purchase-vinyl')
      .send(paymentData);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'Unauthorized');
  });
});
