import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/features/users/services/users.service';
import { JwtService } from '@nestjs/jwt';

jest.mock('../../../src/common/guards/admin.guard', () => ({
  AdminGuard: class MockAdminGuard {
    canActivate() {
      return true;
    }
  },
}));

jest.mock('@nestjs/passport', () => ({
  ...jest.requireActual('@nestjs/passport'),
  AuthGuard: (strategy: string) => {
    return class MockAuthGuard {
      canActivate(context) {
        const req = context.switchToHttp().getRequest();
        req.user = {
          email: 'admin@test.com',
          firstName: 'Test',
          lastName: 'User',
          id: 2,
          isAdmin: true,
        };
        return true;
      }
    };
  },
}));

describe('UsersController Admin (e2e)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let jwtService: JwtService;
  let accessToken: string;
  const mockUserId = 2;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    usersService = moduleFixture.get<UsersService>(UsersService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    accessToken = jwtService.sign({ sub: mockUserId, isAdmin: true });

    jest.spyOn(usersService, 'findByEmail').mockResolvedValue({
      id: 2,
      email: 'admin@test.com',
      firstName: 'Test',
      lastName: 'User',
      isAdmin: true,
    } as any);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users/set-admin (PATCH) should set a user as admin', async () => {
    const updateAdminDto = { email: 'test@example.com' };

    jest.spyOn(usersService, 'updateAdminStatus').mockResolvedValueOnce({
      id: 2,
      email: updateAdminDto.email,
      isAdmin: true,
    } as any);

    const response = await supertest(app.getHttpServer())
      .patch('/users/set-admin')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(updateAdminDto);

    expect(response.status).toBe(200);
    expect(response.body.message).toContain(updateAdminDto.email);
    expect(response.body.user.isAdmin).toBe(true);
  });
});
