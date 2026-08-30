export interface LoginCredentials {
  username: string;
  passwordHash: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  error?: string;
}
