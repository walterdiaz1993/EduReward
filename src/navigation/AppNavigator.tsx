import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../store/AuthContext';
import LoginScreen from '../features/auth/screens/LoginScreen';
import HomeScreen from '../features/home/screens/HomeScreen';
import PeriodsSubjectsScreen from '../features/periods/screens/PeriodsSubjectsScreen';
import AdminDashboard from '../features/students/screens/AdminDashboard';
import StudentDashboard from '../features/students/screens/StudentDashboard';
import StudentRewardsScreen from '../features/students/screens/StudentRewardsScreen';
import RewardsManager from '../features/rewards/screens/RewardsManager';
import PeriodWheel from '../features/wheel/screens/PeriodWheel';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import { BottomTabBar, TabType } from '../components/BottomTabBar';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  home: undefined;
  rewards: undefined;
  wheel: undefined;
  profile: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  PeriodsSubjects: undefined;
  AdminDashboard: undefined;
  StudentDashboard: undefined;
  StudentRewards: undefined;
  RewardsManager: undefined; // In case we want to navigate directly
  PeriodWheel: undefined; // In case we want to navigate directly
  Profile: undefined; // In case we want to navigate directly
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={({ navigation, state }) => {
        const activeRoute = state.routes[state.index].name as TabType;
        return (
          <BottomTabBar
            activeTab={activeRoute}
            onTabChange={(tab) => {
              navigation.navigate(tab);
            }}
          />
        );
      }}
    >
      <Tab.Screen name="home" component={HomeScreen} />
      <Tab.Screen 
        name="rewards" 
        component={(user?.role === 'teacher' || user?.role === 'tutor') ? RewardsManager : PeriodWheel} 
      />
      <Tab.Screen name="wheel" component={PeriodWheel} />
      <Tab.Screen name="profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AppStack.Navigator 
          screenOptions={{ 
            headerShown: true,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerTitleStyle: { fontWeight: '600' },
            headerShadowVisible: false,
          }}
        >
          <AppStack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <AppStack.Screen name="PeriodsSubjects" component={PeriodsSubjectsScreen} options={{ title: t('periods.manageTitle', 'Gestión de Períodos') }} />
          <AppStack.Screen name="AdminDashboard" component={AdminDashboard} options={{ title: t('admin.title', 'Configuración de Hijos') }} />
          <AppStack.Screen name="StudentDashboard" component={StudentDashboard} options={{ title: t('student.title', 'Mi QR y Notas') }} />
          <AppStack.Screen name="StudentRewards" component={StudentRewardsScreen} options={{ title: t('home.menuRewardsStudent', 'Mis Premios') }} />
          <AppStack.Screen name="RewardsManager" component={RewardsManager} options={{ title: t('rewards.managerTitle', 'Gestión de Premios') }} />
          <AppStack.Screen name="PeriodWheel" component={PeriodWheel} options={{ title: t('home.menuWheel', 'Ruleta de Premios') }} />
          <AppStack.Screen name="Profile" component={ProfileScreen} options={{ title: t('profile.title', 'Perfil') }} />
        </AppStack.Navigator>
      ) : (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
          <AuthStack.Screen name="Login" component={LoginScreen} />
        </AuthStack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
