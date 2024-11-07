import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/features/users/services/users.service';
import { JwtService } from '@nestjs/jwt';

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

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let jwtService: JwtService;
  let accessToken: string;
  const mockUserId = 4;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    usersService = moduleFixture.get<UsersService>(UsersService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    accessToken = jwtService.sign({ sub: mockUserId });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users/profile (GET) should return the user profile', async () => {
    jest.spyOn(usersService, 'findById').mockResolvedValueOnce({
      id: mockUserId,
      email: 'test@test.com',
      firstName: 'Test',
      lastName: 'User',
      isAdmin: false,
    } as any);

    const response = await supertest(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email', 'test@test.com');
  });

  it('/users/profile (PATCH) should update the user profile', async () => {
    const updateProfileDto = { firstName: 'Updated', lastName: 'User' };

    jest
      .spyOn(usersService, 'updateProfile')
      .mockResolvedValueOnce({ ...updateProfileDto, id: mockUserId } as any);

    const response = await supertest(app.getHttpServer())
      .patch('/users/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateProfileDto);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('firstName', 'Updated');
  });
});
