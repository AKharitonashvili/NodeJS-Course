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

describe('LogsController (e2e) - Admin Access', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let accessToken: string;
  const mockAdminId = 1;

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

  it('/logs (GET) should retrieve all system logs for admin user', async () => {
    const response = await supertest(app.getHttpServer())
      .get('/logs')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
