import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../../src/features/users/services/users.service';

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

describe('VinylController (e2e) - Admin Access', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let accessToken: string;
  let usersService: UsersService;
  const mockAdminId = 2;
  let vinylId;
  let reviewId;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    usersService = moduleFixture.get<UsersService>(UsersService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    accessToken = jwtService.sign({ sub: mockAdminId, isAdmin: true });

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

  it('/vinyls (POST) should create a vinyl record with admin rights', async () => {
    const response = await supertest(app.getHttpServer())
      .post('/vinyls')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Admin Vinyl',
        authorName: 'Admin Artist',
        description: 'Admin Description',
        price: 30,
      });

    expect(response.status).toBe(201);
    vinylId = response.body.id;
    expect(response.body).toHaveProperty('id');
  });

  it('/vinyls/:id (PATCH) should update a vinyl record with admin rights', async () => {
    const response = await supertest(app.getHttpServer())
      .patch(`/vinyls/${vinylId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Updated Admin Vinyl' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name', 'Updated Admin Vinyl');
  });

  it('/vinyls/:id (DELETE) should delete a vinyl record with admin rights', async () => {
    const response = await supertest(app.getHttpServer())
      .delete(`/vinyls/${vinylId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Vinyl deleted successfully');
  });
});
