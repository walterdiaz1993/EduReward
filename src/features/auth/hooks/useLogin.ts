import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../store/AuthContext';

export const useLogin = () => {
  const { login: contextLogin, signUp: contextSignUp } = useAuth();
  const { t, i18n } = useTranslation();
  
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [role, setRole] = useState<'student' | 'tutor' | 'teacher'>('tutor');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setValidationError(null);
  };

  const handleSubmit = async (): Promise<boolean> => {
    setValidationError(null);

    // En registro: email, password, fullName, username son obligatorios
    // En login: email (que puede ser email o username) y password son obligatorios
    if (
      !email.trim() || 
      !password.trim() || 
      (isSignUpMode && (!fullName.trim() || !username.trim()))
    ) {
      setValidationError(t('login.errorEmptyFields') || 'Campos vacíos');
      return false;
    }

    if (password.length < 6) {
      setValidationError(t('login.errorLength') || 'Password mínimo 6 caracteres');
      return false;
    }

    setIsLoading(true);
    try {
      if (isSignUpMode) {
        const success = await contextSignUp(email, password, fullName, username, role);
        if (!success) {
          setValidationError('Error en el registro');
          return false;
        }
      } else {
        const success = await contextLogin(email, password);
        if (!success) {
          setValidationError(t('login.errorInvalid') || 'Credenciales inválidas');
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error(err);
      setValidationError('Error de conexión');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyPasswordReset = async (recoverUser: string, newPass: string) => {
    if (!recoverUser.trim() || newPass.length < 6) {
      setValidationError('Ingresa el username y una contraseña de min. 6 caracteres');
      return false;
    }
    setIsLoading(true);
    setValidationError(null);
    try {
      const { supabaseAdmin, supabase } = require('../../../lib/supabase');
      if (!supabaseAdmin) {
        setValidationError('Falta configurar EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY en .env');
        return false;
      }

      // Buscar el ID en la tabla profiles (usamos Admin para saltar cualquier bloqueo RLS)
      const isEmail = recoverUser.includes('@');
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq(isEmail ? 'email' : 'username', isEmail ? recoverUser.toLowerCase() : recoverUser.toLowerCase())
        .single();
        
      if (error || !data) {
        setValidationError(`No se encontró el username "${recoverUser}" en la tabla profiles`);
        return false;
      }

      // Usar API Admin para forzar el cambio
      const { error: resetError } = await supabaseAdmin.auth.admin.updateUserById(data.id, {
        password: newPass
      });

      if (resetError) {
        setValidationError(resetError.message);
        return false;
      }

      return true;
    } catch (e: any) {
      setValidationError('Error: ' + e.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    username,
    setUsername,
    password,
    setPassword,
    fullName,
    setFullName,
    role,
    setRole,
    isSignUpMode,
    toggleMode,
    isLoading,
    validationError,
    handleSubmit,
    toggleLanguage,
    currentLanguage: i18n.language,
    handleEmergencyPasswordReset,
    setValidationError,
    t,
  };
};
export default useLogin;
