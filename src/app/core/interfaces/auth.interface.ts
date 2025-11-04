import { IUser } from './user.interface';

export interface IAuthResponse {
  token?: string;
  refreshToken?: string;
  user: IUser;
  expiresIn: number;
}
