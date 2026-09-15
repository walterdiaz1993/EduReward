import React, { createContext, useContext, ReactNode } from 'react';
import { MockUser, MOCK_USERS, delay } from '../mocks/userMock';
import { useAppDispatch, useAppSelector } from './hooks';
import { setUser, setLoading, updateProfile, logoutUser } from './slices/authSlice';

interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<MockUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  const login = async (username: string, password: string): Promise<boolean> => {
    dispatch(setLoading(true));
    try {
      await delay(1000);

      const cleanedUsername = username.trim().toLowerCase();

      if (MOCK_USERS[cleanedUsername]) {
        const mockUser = MOCK_USERS[cleanedUsername];
        dispatch(
          setUser({
            id: mockUser.id,
            username: mockUser.username,
            fullName: mockUser.fullName,
            email: mockUser.email,
            role: mockUser.role,
            points: mockUser.points,
            studentIds: mockUser.studentIds || [],
            isPremium: mockUser.isPremium || false,
          })
        );
        return true;
      } else {
        dispatch(
          setUser({
            id: `usr_${Date.now()}`,
            username: username.trim(),
            fullName: username.charAt(0).toUpperCase() + username.slice(1),
            email: `${username.trim().toLowerCase()}@edureward.dev`,
            role: 'tutor',
            points: 0,
            studentIds: [],
            isPremium: false,
          })
        );
        return true;
      }
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async (): Promise<void> => {
    dispatch(setLoading(true));
    await delay(500);
    dispatch(logoutUser());
  };

  const updateUser = (updatedUser: Partial<MockUser>) => {
    dispatch(updateProfile(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
