import { UserRole } from "./user.interface";

export interface IRegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  bio?: string;
  role?: string;
}

export interface ICreateUserByAdmin {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  bio?: string;
  role: UserRole;
}
