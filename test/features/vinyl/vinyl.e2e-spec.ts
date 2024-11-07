import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { SortBy } from '../../../src/common/enums/query.enum';

describe('VinylController (e2e) - Authorized User', () => {
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

  it('/vinyls (GET) should get all vinyl records with authentication', async () => {
    const response = await supertest(app.getHttpServer())
      .get('/vinyls')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('/vinyls (GET) should get vinyl records with query parameters', async () => {
    const response = await supertest(app.getHttpServer())
      .get('/vinyls')
      .query({
        page: 1,
        limit: 10,
        sortBy: 'price',
        sortOrder: SortBy.ASC,
        name: 'Sample Vinyl',
        authorName: 'Sample Author',
      })
      .set('Authorization', `Bearer ${accessToken}`);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
