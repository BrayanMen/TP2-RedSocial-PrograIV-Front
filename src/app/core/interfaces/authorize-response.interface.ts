export interface IAuthorizeResponse {
  valid: boolean;
  user: {
    sub: string;
    username: string;
    email: string;
    role: string;
  };
}
