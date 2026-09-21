import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../config/theme';
import useHome from '../hooks/useHome';
import useAdmin from '../../students/hooks/useAdmin';
import { useTheme } from '../../../context/ThemeContext';
import AdminDashboard from '../../students/screens/AdminDashboard';
import StudentDashboard from '../../students/screens/StudentDashboard';
import RewardsManager from '../../rewards/screens/RewardsManager';
import PeriodWheel from '../../wheel/screens/PeriodWheel';
import ProfileScreen from '../../profile/screens/ProfileScreen';
import PeriodsSubjectsScreen from '../../periods/screens/PeriodsSubjectsScreen';
import BottomTabBar, { TabType } from '../../../components/BottomTabBar';

export const HomeScreen: React.FC = () => {
  const {
    user,
    handleLogout,
    toggleLanguage,
    t,
  } = useHome();

  const { isDark, toggleTheme, colors } = useTheme();
  const adminState = useAdmin();

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [activeSection, setActiveSection] = useState<'menu' | 'students' | 'periods'>('menu');

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'teacher':
        return colors.primary;
      case 'tutor':
        return colors.secondary;
      default:
        return '#8b5cf6';
    }
  };

  const renderTabContent = () => {
    if (!user) return null;

    if (activeTab === 'profile') {
      return (
        <ProfileScreen
          onActivateTeacherPremium={adminState.handleActivatePremium}
        />
      );
    }

    if (activeTab === 'rewards') {
      if (user.role === 'tutor' || user.role === 'teacher') {
        return (
          <RewardsManager
            students={adminState.students}
            onAddRule={adminState.handleAddRule}
            onDeleteRule={adminState.handleDeleteRule}
            onBack={() => setActiveTab('home')}
          />
        );
      }

      const matchStudent = adminState.allStudents.find((s) => s.username === user.username);
      const studentRules = matchStudent ? matchStudent.subjectRules : [];

      return (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text }]}>{t('student.activeRules')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('rewards.subtitle')}</Text>

          <View style={[styles.rulesContainer, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
            {studentRules.length > 0 ? (
              studentRules.map((rule) => (
                <View key={rule.id} style={[styles.ruleItem, { borderBottomColor: colors.border }]}>
                  <Ionicons name="gift-outline" size={20} color={colors.secondary} />
                  <Text style={[styles.ruleText, { color: colors.text }]}>
                    {t('rewards.rulePlaceholder', {
                      subject: rule.subject,
                      condition: rule.condition === 'greater' ? '>' : '<',
                      value: rule.value,
                      reward: rule.rewardValue,
                    })}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('rewards.noRules')}</Text>
            )}
          </View>
        </ScrollView>
      );
    }

    if (activeTab === 'wheel') {
      return <PeriodWheel onBack={() => setActiveTab('home')} />;
    }

    // Default: 'home' tab
    if (activeSection === 'students') {
      if (user.role === 'tutor' || user.role === 'teacher') {
        return <AdminDashboard onBack={() => setActiveSection('menu')} adminState={adminState} />;
      }
      return <StudentDashboard onBack={() => setActiveSection('menu')} />;
    }

    if (activeSection === 'periods') {
      return <PeriodsSubjectsScreen onBack={() => setActiveSection('menu')} />;
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.menuHub}>
          <Text style={[styles.hubTitle, { color: colors.text }]}>{t('home.title')}</Text>
          <Text style={[styles.hubSubtitle, { color: colors.textSecondary }]}>{t('home.subtitle')}</Text>

          {(user.role === 'teacher' || user.role === 'tutor') && (
            <TouchableOpacity
              onPress={() => setActiveSection('periods')}
              style={[styles.menuCard, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconBox, { backgroundColor: colors.secondary + '20' }]}>
                <Ionicons name="calendar-outline" size={24} color={colors.secondary} />
              </View>
              <View style={styles.menuCardContent}>
                <Text style={[styles.menuCardTitle, { color: colors.text }]}>Gestión de Períodos y Materias</Text>
                <Text style={[styles.menuCardDesc, { color: colors.textSecondary }]}>Crea períodos lectivos, materias y asigna reglas de recompensas y castigos por calificaciones.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setActiveSection('students')}
            style={[styles.menuCard, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="people-outline" size={24} color={colors.primary} />
            </View>
            <View style={styles.menuCardContent}>
              <Text style={[styles.menuCardTitle, { color: colors.text }]}>
                {user.role === 'teacher'
                  ? t('home.menuRegisterTeacher')
                  : user.role === 'tutor'
                  ? t('home.menuRegisterTutor')
                  : t('student.qrTitle')}
              </Text>
              <Text style={[styles.menuCardDesc, { color: colors.textSecondary }]}>{t('home.menuRegisterDesc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('rewards')}
            style={[styles.menuCard, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: colors.secondary + '20' }]}>
              <Ionicons name="ribbon-outline" size={24} color={colors.secondary} />
            </View>
            <View style={styles.menuCardContent}>
              <Text style={[styles.menuCardTitle, { color: colors.text }]}>{t('home.menuRewards')}</Text>
              <Text style={[styles.menuCardDesc, { color: colors.textSecondary }]}>{t('home.menuRewardsDesc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('wheel')}
            style={[styles.menuCard, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
              <Ionicons name="aperture-outline" size={24} color="#8b5cf6" />
            </View>
            <View style={styles.menuCardContent}>
              <Text style={[styles.menuCardTitle, { color: colors.text }]}>{t('home.menuWheel')}</Text>
              <Text style={[styles.menuCardDesc, { color: colors.textSecondary }]}>{t('home.menuWheelDesc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.container}>
        {activeTab !== 'profile' && (
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.welcomeLabel, { color: colors.textSecondary }]}>{t('common.loading').slice(0, -3)}</Text>
              <View style={styles.userInfoHeader}>
                <Text style={[styles.welcomeText, { color: colors.text }]}>{user?.fullName}</Text>
                {user && (
                  <View
                    style={[
                      styles.roleBadge,
                      { backgroundColor: getRoleColor(user.role) + '20' },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                        {user.role === 'teacher'
                          ? user.isPremium ? 'DOCENTE PREMIUM' : 'DOCENTE'
                          : user.role === 'tutor'
                          ? 'TUTOR'
                          : 'ALUMNO'}
                      </Text>
                      {user.role === 'teacher' && user.isPremium && (
                        <Ionicons name="star" size={12} color={getRoleColor(user.role)} />
                      )}
                    </View>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={toggleTheme} style={[styles.iconButton, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]} activeOpacity={0.7}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleLanguage} style={[styles.iconButton, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]} activeOpacity={0.7}>
                <Ionicons name="globe-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={[styles.iconButton, styles.logoutButton, { backgroundColor: colors.cardTranslucent }]}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.bodyContent}>
          {renderTabContent()}
        </View>

        {/* Bottom Tab Bar */}
        <BottomTabBar activeTab={activeTab} onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'home') setActiveSection('menu');
        }} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  bodyContent: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    marginBottom: theme.spacing.md,
  },
  welcomeLabel: {
    ...theme.typography.caption,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 8,
  },
  welcomeText: {
    ...theme.typography.h2,
    fontSize: 18,
  },
  roleBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.roundness.sm,
  },
  roleText: {
    ...theme.typography.caption,
    fontWeight: '700',
    fontSize: 9,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
    borderWidth: 1,
    elevation: 1,
  },
  logoutButton: {
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  menuHub: {
    gap: theme.spacing.md,
  },
  hubTitle: {
    ...theme.typography.h1,
    fontSize: 22,
    marginBottom: 2,
  },
  hubSubtitle: {
    ...theme.typography.caption,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  menuIconBox: {
    width: 48,
    height: 48,
    borderRadius: theme.roundness.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  menuCardContent: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  menuCardTitle: {
    ...theme.typography.bodySemibold,
    fontSize: 16,
    marginBottom: 2,
  },
  menuCardDesc: {
    ...theme.typography.caption,
    fontSize: 11,
    lineHeight: 16,
  },
  title: {
    ...theme.typography.h1,
    fontSize: 24,
    marginBottom: 4,
  },
  subtitle: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.lg,
    lineHeight: 18,
  },
  rulesContainer: {
    borderWidth: 1.5,
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    gap: theme.spacing.sm,
  },
  ruleText: {
    ...theme.typography.caption,
    lineHeight: 18,
    flex: 1,
  },
  emptyText: {
    ...theme.typography.caption,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});

export default HomeScreen;
