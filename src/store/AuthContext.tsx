import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { MockUser } from '../mocks/userMock';
import { useAppDispatch, useAppSelector } from './hooks';
import { setUser, setLoading, updateProfile, logoutUser } from './slices/authSlice';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, fullName: string, username: string, role: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<MockUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id);
      } else {
        dispatch(logoutUser());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data && !error) {
      dispatch(setUser({
        id: data.id,
        username: data.username,
        fullName: data.full_name,
        email: data.email,
        role: data.role as any,
        points: data.points,
        studentIds: data.student_ids || [],
        isPremium: data.is_premium || false,
      }));
    } else {
      // Si no existe el profile, cerramos sesion o lo manejamos
      dispatch(logoutUser());
    }
  };

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    dispatch(setLoading(true));
    try {
      let targetEmail = emailOrUsername.trim().toLowerCase();

      // Si no tiene '@', asumimos que es un username y buscamos su email en profiles
      if (!targetEmail.includes('@')) {
        // Intentar usar supabaseAdmin si existe para saltar RLS en desarrollo
        let clientToUse = supabase;
        try {
          const { supabaseAdmin } = require('../lib/supabase');
          if (supabaseAdmin) clientToUse = supabaseAdmin;
        } catch (e) {}

        const { data, error } = await clientToUse
          .from('profiles')
          .select('email')
          .eq('username', targetEmail)
          .single();
          
        if (error || !data?.email) {
          console.error("Username no encontrado en profiles al intentar iniciar sesión:", error);
          return false;
        }
        targetEmail = data.email;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error(error);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signUp = async (email: string, password: string, fullName: string, username: string, role: string): Promise<boolean> => {
    dispatch(setLoading(true));
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: data.user.id,
            email: email,
            username: username,
            full_name: fullName,
            role: role,
            points: 0,
            is_premium: false
          }
        ]);
        if (profileError) throw profileError;
        
        // Fetch manually to update Redux right away
        await fetchProfile(data.user.id);
      }
      return true;
    } catch (error: any) {
      console.error(error);
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async (): Promise<void> => {
    dispatch(setLoading(true));
    await supabase.auth.signOut();
    dispatch(logoutUser());
  };

  const updateUser = (updatedUser: Partial<MockUser>) => {
    dispatch(updateProfile(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, signUp, logout, updateUser }}>
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
