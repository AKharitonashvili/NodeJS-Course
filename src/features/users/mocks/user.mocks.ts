import { ActiveUser } from '../../../common/interfaces/active-user.interface';
import { UpdateAdminDto } from '../dtos/update-admin.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { User } from '../entities/user.entity';

export const updateProfileMock: UpdateProfileDto = {
  firstName: 'John',
  lastName: 'Doe',
  birthDate: '1990-01-01',
  avatar: '',
};

export const updateAdminMock: UpdateAdminDto = {
  email: 'example@example.com',
};

export const userMock: User = {
  id: 1,
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  birthDate: '1990-01-01',
  avatar: '',
  isAdmin: false,
  reviews: [],
  purchasedVinyls: [],
};

export const mockActiveUser: ActiveUser = {
  userId: 1,
  email: 'test@example.com',
  isAdmin: false,
  loggedInAt: new Date(),
};
