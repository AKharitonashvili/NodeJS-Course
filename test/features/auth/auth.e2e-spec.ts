import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../../src/app.module';
import { AuthService } from '../../../src/features/auth/services/auth.service';

jest.mock('@nestjs/passport', () => ({
  ...jest.requireActual('@nestjs/passport'),
  AuthGuard: (strategy: string) => {
    return class MockAuthGuard {
      canActivate(context) {
        const req = context.switchToHttp().getRequest();
        if (strategy === 'google') {
          req.user = {
            email: 'test@test.com',
            firstName: 'Test',
            lastName: 'User',
            id: 1,
            isAdmin: false,
          };
        }
        return true;
      }
    };
  },
}));

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/google (GET) should redirect to Google', async () => {
    const response = await supertest(app.getHttpServer()).get('/auth/google');
    expect(response.status).toBe(200);
  });

  it('/auth/google/callback (GET) should login and return JWT', async () => {
    const response = await supertest(app.getHttpServer()).get(
      '/auth/google/callback',
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.message).toBe('Login successful');
  });

  it('/auth/logout (GET) should log out the user', async () => {
    const accessToken = authService.generateJwt({
      email: 'test@test.com',
      id: 4,
      isAdmin: false,
    });

    const response = await supertest(app.getHttpServer())
      .get('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Logged out successfully');
  });

  it('/auth/active-users (GET) should return a list of active users', async () => {
    const accessToken = authService.generateJwt({
      email: 'test@test.com',
      id: 4,
      isAdmin: false,
    });

    const response = await supertest(app.getHttpServer())
      .get('/auth/active-users')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
