import React, { useState, useEffect } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../config/theme';
import useStudent from '../hooks/useStudent';
import { StudentWithGrades } from '../../../mocks/userMock';
import { useAuth } from '../../../store/AuthContext';
import { useAdmin } from '../hooks/useAdmin';
import { useTranslation } from 'react-i18next';

interface PeriodWheelProps {
  onBack: () => void;
}

export const PeriodWheel: React.FC<PeriodWheelProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { students } = useAdmin();
  
  const [selectedStudent, setSelectedStudent] = useState<StudentWithGrades | null>(null);

  const {
    studentData,
    activeWheel,
    spinResult,
    isSpinning,
    spin,
    getInterpolatedRotation,
    goldOptions,
    consequenceOptions,
  } = useStudent();

  useEffect(() => {
    if (user) {
      if (user.role === 'student' && studentData) {
        setSelectedStudent(studentData);
      } else if (students.length > 0 && !selectedStudent) {
        setSelectedStudent(students[0]);
      }
    }
  }, [user, studentData, students]);

  const isAdmin = user?.role === 'tutor' || user?.role === 'teacher';

  const currentStudent = isAdmin ? selectedStudent : studentData;

  const getAverageColor = (avg: number) => {
    if (avg >= 90) return theme.colors.success;
    if (avg < 70) return theme.colors.error;
    return theme.colors.primary;
  };

  const getActiveWheelType = (student: StudentWithGrades | null) => {
    if (!student || student.grades.length === 0) return 'locked';
    const avg = student.average;
    if (avg >= 90) return 'gold';
    if (avg < 70) return 'consequences';
    return 'locked';
  };

  const currentWheel = getActiveWheelType(currentStudent);

  const getWheelTitle = (wheel: string) => {
    if (wheel === 'gold') return t('student.wheelGold');
    if (wheel === 'consequences') return t('student.wheelConsequences');
    return t('student.wheelLocked');
  };

  const getWheelColor = (wheel: string) => {
    if (wheel === 'gold') return theme.colors.secondary;
    if (wheel === 'consequences') return theme.colors.error;
    return theme.colors.textSecondary;
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
        <Text style={styles.backButtonText}>{t('common.backBtn')}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{t('home.menuWheel')}</Text>
      <Text style={styles.subtitle}>{t('home.menuWheelDesc')}</Text>

      {isAdmin && (
        <View style={styles.selectorWrapper}>
          <Text style={styles.label}>{t('admin.selectStudent')}</Text>
          <View style={styles.studentSelector}>
            {students.map((student) => (
              <TouchableOpacity
                key={student.id}
                onPress={() => setSelectedStudent(student)}
                style={[
                  styles.studentTab,
                  selectedStudent?.id === student.id ? styles.studentTabActive : {},
                ]}
              >
                <Text
                  style={[
                    styles.studentTabText,
                    selectedStudent?.id === student.id ? styles.studentTabTextActive : {},
                  ]}
                >
                  {student.fullName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {currentStudent && (
        <View style={styles.wheelCard}>
          <Text style={styles.wheelTitle}>{getWheelTitle(currentWheel)}</Text>
          
          <View style={styles.studentStatRow}>
            <Text style={styles.studentStatText}>
              {t('student.average')}:{' '}
              <Text style={{ color: getAverageColor(currentStudent.average), fontWeight: '700' }}>
                {currentStudent.average}
              </Text>
            </Text>
            <Text style={styles.studentStatText}>
              {t('home.points')}:{' '}
              <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>
                {currentStudent.points}
              </Text>
            </Text>
          </View>

          {currentWheel === 'locked' ? (
            <View style={styles.lockedBanner}>
              <Ionicons
                name="lock-closed"
                size={24}
                color={theme.colors.textSecondary}
                style={styles.lockedIcon}
              />
              <Text style={styles.lockedText}>
                {t('student.wheelLockedSub')}
              </Text>
            </View>
          ) : (
            <View style={styles.wheelWrapper}>
              <View style={styles.wheelIndicator}>
                <Ionicons name="caret-down" size={32} color={getWheelColor(currentWheel)} />
              </View>

              <Animated.View
                style={[
                  styles.wheelDisc,
                  {
                    borderColor: getWheelColor(currentWheel),
                    transform: [{ rotate: getInterpolatedRotation() }],
                  },
                ]}
              >
                <View style={[styles.wheelDivider, { transform: [{ rotate: '0deg' }] }]} />
                <View style={[styles.wheelDivider, { transform: [{ rotate: '60deg' }] }]} />
                <View style={[styles.wheelDivider, { transform: [{ rotate: '120deg' }] }]} />
                
                <View style={styles.wheelCenterPin} />
              </Animated.View>

              {spinResult && (
                <View
                  style={[
                    styles.resultBanner,
                    {
                      backgroundColor:
                        currentWheel === 'gold'
                          ? 'rgba(13, 148, 136, 0.08)'
                          : 'rgba(239, 68, 68, 0.05)',
                      borderColor: getWheelColor(currentWheel),
                    },
                  ]}
                >
                  <Ionicons
                    name={currentWheel === 'gold' ? 'trophy' : 'warning'}
                    size={20}
                    color={getWheelColor(currentWheel)}
                    style={styles.resultIcon}
                  />
                  <Text style={[styles.resultText, { color: getWheelColor(currentWheel) }]}>
                    {t('student.spinResult', { result: spinResult })}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={spin}
                disabled={isSpinning}
                style={[
                  styles.spinButton,
                  { backgroundColor: getWheelColor(currentWheel) },
                  isSpinning ? styles.spinButtonDisabled : {},
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.spinButtonText}>
                  {isSpinning ? t('common.loading') : t('student.spinBtn')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 115,
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
  selectorWrapper: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.bodySemibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  studentSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  studentTab: {
    flex: 1,
    height: 40,
    borderRadius: theme.roundness.sm,
    borderWidth: 1,
    borderColor: 'rgba(30, 64, 175, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
  },
  studentTabActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  studentTabText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  studentTabTextActive: {
    color: theme.colors.primary,
  },
  wheelCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(30, 64, 175, 0.08)',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  wheelTitle: {
    ...theme.typography.bodySemibold,
    color: theme.colors.text,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  studentStatRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  studentStatText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  lockedIcon: {
    marginRight: theme.spacing.md,
  },
  lockedText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  wheelWrapper: {
    alignItems: 'center',
  },
  wheelIndicator: {
    marginBottom: -12,
    zIndex: 5,
  },
  wheelDisc: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelDivider: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: theme.colors.border,
  },
  wheelCenterPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.card,
    borderWidth: 2,
    borderColor: theme.colors.border,
    zIndex: 10,
  },
  spinButton: {
    height: 48,
    borderRadius: theme.roundness.md,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  spinButtonDisabled: {
    opacity: 0.6,
  },
  spinButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: theme.roundness.sm,
    padding: theme.spacing.md,
    width: '100%',
    marginTop: theme.spacing.lg,
  },
  resultIcon: {
    marginRight: theme.spacing.sm,
  },
  resultText: {
    ...theme.typography.caption,
    fontWeight: '700',
    textAlign: 'center',
  },
});
export default PeriodWheel;
