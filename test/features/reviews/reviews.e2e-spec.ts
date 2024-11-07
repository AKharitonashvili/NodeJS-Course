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

describe('ReviewsController (e2e) - Authorized User Access', () => {
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

  it('/reviews (PUT) should create or update a review with valid input', async () => {
    const response = await supertest(app.getHttpServer())
      .put('/reviews')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ vinylId: 42, rating: 7, comment: 'Updated review!' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('comment', 'Updated review!');
  });

  it('/reviews/:vinylId (GET) should fetch reviews for a specific vinyl', async () => {
    const response = await supertest(app.getHttpServer())
      .get('/reviews/42')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
