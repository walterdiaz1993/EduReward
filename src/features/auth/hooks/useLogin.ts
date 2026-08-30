import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../store/AuthContext';
import { authService } from '../services/authService';

export const useLogin = () => {
  const { login: contextLogin } = useAuth();
  const { t, i18n } = useTranslation();
  
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleLogin = async (): Promise<boolean> => {
    setValidationError(null);

    if (!username.trim() || !password.trim()) {
      setValidationError(t('login.errorEmptyFields'));
      return false;
    }

    if (password.length < 4) {
      setValidationError(t('login.errorLength'));
      return false;
    }

    setIsLoading(true);
    try {
      const result = await authService.login({
        username,
        passwordHash: password,
      });

      if (!result.success) {
        if (result.error === 'fields_empty') {
          setValidationError(t('login.errorEmptyFields'));
        } else if (result.error === 'password_too_short') {
          setValidationError(t('login.errorLength'));
        } else {
          setValidationError(t('login.errorInvalid'));
        }
        return false;
      }

      const success = await contextLogin(username, password);
      if (!success) {
        setValidationError(t('login.errorInvalid'));
        return false;
      }

      return true;
    } catch (err) {
      console.error(err);
      setValidationError(t('login.errorInvalid'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    isLoading,
    validationError,
    handleLogin,
    toggleLanguage,
    currentLanguage: i18n.language,
    t,
  };
};
export default useLogin;
