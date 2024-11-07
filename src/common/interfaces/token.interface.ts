export interface DecodedToken {
  sub: number;
  email: string;
  isAdmin: boolean;
}

export interface JwtPayload {
  sub: number;
  email: string;
}
