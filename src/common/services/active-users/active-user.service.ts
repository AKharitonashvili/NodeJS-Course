import { Injectable } from '@nestjs/common';
import { ActiveUser } from '../../interfaces/active-user.interface';

@Injectable()
export class ActiveUsersService {
  private activeUsers: ActiveUser[] = [];

  addUser(user: ActiveUser) {
    this.activeUsers.push(user);
  }

  removeUser(userId: number) {
    this.activeUsers = this.activeUsers.filter(
      (user) => user.userId !== userId,
    );
  }

  getAllUsers(): ActiveUser[] {
    return this.activeUsers;
  }

  findUserById(userId: number): ActiveUser | undefined {
    return this.activeUsers.find((user) => user.userId === userId);
  }
}
