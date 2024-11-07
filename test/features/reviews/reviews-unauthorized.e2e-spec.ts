import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('ReviewsController (e2e) - Unauthorized Access', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/reviews (PUT) should not allow creating or updating a review without authentication', async () => {
    const response = await supertest(app.getHttpServer())
      .put('/reviews')
      .send({ vinylId: 42, rating: 7, comment: 'Bad album!' });
    expect(response.status).toBe(401);
  });

  it('/reviews/:vinylId (GET) should not allow fetching reviews without authentication', async () => {
    const response = await supertest(app.getHttpServer()).get('/reviews/42');
    expect(response.status).toBe(401);
  });

  it('/reviews/:vinylId (DELETE) should not allow deleting a review without admin rights', async () => {
    const response = await supertest(app.getHttpServer()).delete('/reviews/42');
    expect(response.status).toBe(404);
  });
});
