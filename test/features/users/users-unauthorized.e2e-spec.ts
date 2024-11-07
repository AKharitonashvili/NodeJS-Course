import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import supertest from 'supertest';
import { AppModule } from '../../../src/app.module';
import { UsersService } from '../../../src/features/users/services/users.service';
import { JwtService } from '@nestjs/jwt';

describe('UsersController unauthorized (e2e)', () => {
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

  it('/users/profile (GET) should return 401 for unauthorized request', async () => {
    const response = await supertest(app.getHttpServer()).get('/users/profile');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('/users/profile (PATCH) should return 401 for unauthorized request', async () => {
    const updateProfileDto = { firstName: 'Updated', lastName: 'User' };
    const response = await supertest(app.getHttpServer())
      .patch('/users/profile')
      .send(updateProfileDto);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('/users/set-admin (PATCH) should return 404 for unauthorized request', async () => {
    const updateAdminDto = { email: 'admin@example.com' };
    const response = await supertest(app.getHttpServer())
      .patch('/users/set-admin')
      .send(updateAdminDto);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe(`Unauthorized`);
  });
});
