export interface IApiResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  success: boolean;
  error?: string | string[];
}