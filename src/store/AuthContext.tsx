import React, { createContext, useState, useContext, ReactNode } from 'react';
import { MockUser, MOCK_USERS, delay } from '../mocks/userMock';

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
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await delay(1000);

      const cleanedUsername = username.trim().toLowerCase();

      if (MOCK_USERS[cleanedUsername]) {
        const mockUser = MOCK_USERS[cleanedUsername];
        setUser({
          id: mockUser.id,
          username: mockUser.username,
          fullName: mockUser.fullName,
          email: mockUser.email,
          role: mockUser.role,
          points: mockUser.points,
          studentIds: mockUser.studentIds || [],
          isPremium: mockUser.isPremium || false,
        });
        return true;
      } else {
        setUser({
          id: `usr_${Date.now()}`,
          username: username.trim(),
          fullName: username.charAt(0).toUpperCase() + username.slice(1),
          email: `${username.trim().toLowerCase()}@edureward.dev`,
          role: 'tutor',
          points: 0,
          studentIds: [],
          isPremium: false,
        });
        return true;
      }
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    await delay(500);
    setUser(null);
    setIsLoading(false);
  };

  const updateUser = (updatedUser: Partial<MockUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
  };

  const isAuthenticated = user !== null;

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
