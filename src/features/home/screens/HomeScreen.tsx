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
import useAdmin from '../hooks/useAdmin';
import AdminDashboard from '../components/AdminDashboard';
import StudentDashboard from '../components/StudentDashboard';
import RewardsManager from '../components/RewardsManager';
import PeriodWheel from '../components/PeriodWheel';

export const HomeScreen: React.FC = () => {
  const {
    user,
    handleLogout,
    toggleLanguage,
    currentLanguage,
    t,
  } = useHome();

  const adminState = useAdmin();
  const [activeSection, setActiveSection] = useState<'menu' | 'students' | 'rewards' | 'wheel'>('menu');

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'teacher':
        return theme.colors.primary;
      case 'tutor':
        return theme.colors.secondary;
      default:
        return '#8b5cf6';
    }
  };

  const renderActiveSection = () => {
    if (!user) return null;

    if (activeSection === 'students') {
      if (user.role === 'tutor' || user.role === 'teacher') {
        return <AdminDashboard onBack={() => setActiveSection('menu')} adminState={adminState} />;
      }
      return <StudentDashboard onBack={() => setActiveSection('menu')} />;
    }

    if (activeSection === 'rewards') {
      if (user.role === 'tutor' || user.role === 'teacher') {
        return (
          <RewardsManager
            students={adminState.students}
            onAddRule={adminState.handleAddRule}
            onDeleteRule={adminState.handleDeleteRule}
            onBack={() => setActiveSection('menu')}
          />
        );
      }

      const matchStudent = adminState.allStudents.find((s) => s.username === user.username);
      const studentRules = matchStudent ? matchStudent.subjectRules : [];

      return (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => setActiveSection('menu')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
            <Text style={styles.backButtonText}>{t('common.backBtn')}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>{t('student.activeRules')}</Text>
          <Text style={styles.subtitle}>{t('rewards.subtitle')}</Text>

          <View style={styles.rulesContainer}>
            {studentRules.length > 0 ? (
              studentRules.map((rule) => (
                <View key={rule.id} style={styles.ruleItem}>
                  <Ionicons name="gift-outline" size={20} color={theme.colors.secondary} />
                  <Text style={styles.ruleText}>
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
              <Text style={styles.emptyText}>{t('rewards.noRules')}</Text>
            )}
          </View>
        </ScrollView>
      );
    }

    if (activeSection === 'wheel') {
      return <PeriodWheel onBack={() => setActiveSection('menu')} />;
    }

    return (
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.menuHub}>
          <Text style={styles.hubTitle}>{t('home.title')}</Text>
          <Text style={styles.hubSubtitle}>{t('home.subtitle')}</Text>

          <TouchableOpacity
            onPress={() => setActiveSection('students')}
            style={styles.menuCard}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
              <Ionicons name="people-outline" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.menuCardContent}>
              <Text style={styles.menuCardTitle}>
                {user.role === 'teacher'
                  ? t('home.menuRegisterTeacher')
                  : user.role === 'tutor'
                  ? t('home.menuRegisterTutor')
                  : t('student.qrTitle')}
              </Text>
              <Text style={styles.menuCardDesc}>{t('home.menuRegisterDesc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.border} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveSection('rewards')}
            style={styles.menuCard}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: 'rgba(13, 148, 136, 0.1)' }]}>
              <Ionicons name="ribbon-outline" size={24} color={theme.colors.secondary} />
            </View>
            <View style={styles.menuCardContent}>
              <Text style={styles.menuCardTitle}>{t('home.menuRewards')}</Text>
              <Text style={styles.menuCardDesc}>{t('home.menuRewardsDesc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.border} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveSection('wheel')}
            style={styles.menuCard}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.1)' }]}>
              <Ionicons name="aperture-outline" size={24} color="#8b5cf6" />
            </View>
            <View style={styles.menuCardContent}>
              <Text style={styles.menuCardTitle}>{t('home.menuWheel')}</Text>
              <Text style={styles.menuCardDesc}>{t('home.menuWheelDesc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.border} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeLabel}>{t('common.loading').slice(0, -3)}</Text>
            <View style={styles.userInfoHeader}>
              <Text style={styles.welcomeText}>{user?.fullName}</Text>
              {user && (
                <View
                  style={[
                    styles.roleBadge,
                    { backgroundColor: getRoleColor(user.role) + '20' },
                  ]}
                >
                  <Text style={[styles.roleText, { color: getRoleColor(user.role) }]}>
                    {user.role === 'teacher'
                      ? 'DOCENTE'
                      : user.role === 'tutor'
                      ? 'TUTOR'
                      : 'ALUMNO'}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={toggleLanguage} style={styles.iconButton}>
              <Ionicons name="globe-outline" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              style={[styles.iconButton, styles.logoutButton]}
            >
              <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {renderActiveSection()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  welcomeLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
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
    color: theme.colors.text,
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
    backgroundColor: theme.colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutButton: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  menuHub: {
    gap: theme.spacing.md,
  },
  hubTitle: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontSize: 22,
    marginBottom: 2,
  },
  hubSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.sm,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
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
    color: theme.colors.text,
    fontSize: 16,
    marginBottom: 2,
  },
  menuCardDesc: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: 4,
  },
  backButtonText: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    fontSize: 24,
    marginBottom: 4,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 18,
  },
  rulesContainer: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  ruleText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    lineHeight: 18,
    flex: 1,
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});
export default HomeScreen;
