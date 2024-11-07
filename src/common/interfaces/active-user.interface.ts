export interface ActiveUser {
  userId: number;
  email: string;
  isAdmin: boolean;
  loggedInAt: Date;
}
