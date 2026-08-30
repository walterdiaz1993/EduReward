import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../store/AuthContext';
import { MOCK_REWARDS, MockReward, delay } from '../../../mocks/userMock';

export const useHome = () => {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  
  const [rewards, setRewards] = useState<MockReward[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      await delay(800);
      setRewards(MOCK_REWARDS);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await delay(1000);
      setRewards(MOCK_REWARDS);
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleLogout = async () => {
    await logout();
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    user,
    rewards,
    isLoading,
    isRefreshing,
    handleRefresh,
    handleLogout,
    toggleLanguage,
    currentLanguage: i18n.language,
    t,
  };
};
export default useHome;
