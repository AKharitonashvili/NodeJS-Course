import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../../src/app.module';
import { JwtService } from '@nestjs/jwt';

jest.mock('../../../src/common/guards/admin.guard', () => ({
  AdminGuard: class MockAdminGuard {
    canActivate() {
      return true;
    }
  },
}));

jest.mock('../../../src/common/guards/jwt-auth.guard', () => ({
  JwtAuthGuard: class MockJwtAuthGuard {
    canActivate() {
      return true;
    }
  },
}));

describe('ReviewsController (e2e) - Admin Access', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let accessToken: string;
  const mockAdminId = 2;
  let reviewId: number;
  let vinylId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    accessToken = jwtService.sign({ sub: mockAdminId, isAdmin: true });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/reviews (PUT) should create or update a review with valid input', async () => {
    const response = await supertest(app.getHttpServer())
      .put('/reviews')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ vinylId: 2, rating: 7, comment: 'Updated review!' });

    expect(response.status).toBe(200);
    vinylId = response.body.vinyl.id;

    expect(response.body).toHaveProperty('comment', 'Updated review!');
  });

  it('/reviews/:vinylId (DELETE) should delete a review with admin rights', async () => {
    const reviewsRes = await supertest(app.getHttpServer())
      .get(`/reviews/${vinylId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    reviewId = reviewsRes.body[0].id;

    const response = await supertest(app.getHttpServer())
      .delete(`/reviews/${vinylId}/${reviewId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Review deleted successfully');
  });
});
