import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../../src/app.module';

describe('VinylController (e2e) - Unauthorized Access', () => {
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

  it('/vinyls (POST) should not allow creating a vinyl record without admin rights', async () => {
    const response = await supertest(app.getHttpServer())
      .post('/vinyls')
      .send({ name: 'Test Vinyl', authorName: 'Test Artist', price: 20 });
    expect(response.status).toBe(401);
  });

  it('/vinyls/:id (PATCH) should not allow updating a vinyl record without admin rights', async () => {
    const response = await supertest(app.getHttpServer())
      .patch('/vinyls/1')
      .send({ name: 'Updated Vinyl' });
    expect(response.status).toBe(401);
  });

  it('/vinyls/:id (DELETE) should not allow deleting a vinyl record without admin rights', async () => {
    const response = await supertest(app.getHttpServer()).delete('/vinyls/1');
    expect(response.status).toBe(401);
  });
});
