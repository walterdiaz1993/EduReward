import { delay } from '../../../mocks/userMock';
import { LoginCredentials, LoginResponse } from '../types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    await delay(1200);

    const { username, passwordHash } = credentials;
    
    if (!username || !passwordHash) {
      return {
        success: false,
        error: 'fields_empty',
      };
    }

    if (passwordHash.length < 4) {
      return {
        success: false,
        error: 'password_too_short',
      };
    }

    return {
      success: true,
      token: `mock_jwt_token_${Date.now()}_${username}`,
    };
  },
};
export default authService;
