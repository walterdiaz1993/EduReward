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
import useStudent from '../../students/hooks/useStudent';
import { StudentWithGrades } from '../../../mocks/userMock';
import { useAuth } from '../../../store/AuthContext';
import { useAdmin } from '../../students/hooks/useAdmin';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';

interface PeriodWheelProps {
  onBack: () => void;
}

export const PeriodWheel: React.FC<PeriodWheelProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors } = useTheme();
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
    if (students && students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]);
    }
  }, [students]);

  const activeStudent = (user?.role === 'tutor' || user?.role === 'teacher')
    ? selectedStudent || (students.length > 0 ? students[0] : null)
    : studentData;

  const currentAverage = activeStudent ? activeStudent.average : 0;
  
  let currentWheelMode: 'gold' | 'consequences' | 'locked' = 'locked';
  if (activeStudent && activeStudent.grades && activeStudent.grades.length > 0) {
    if (currentAverage >= 90) currentWheelMode = 'gold';
    else if (currentAverage < 70) currentWheelMode = 'consequences';
    else currentWheelMode = 'locked';
  } else if (activeStudent) {
    currentWheelMode = activeWheel;
  }

  const options = currentWheelMode === 'gold' ? goldOptions : consequenceOptions;

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={colors.primary} />
        <Text style={[styles.backButtonText, { color: colors.primary }]}>{t('common.backBtn')}</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.text }]}>{t('home.menuWheel')}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('home.menuWheelDesc')}</Text>

      {/* Parent/Teacher Selector */}
      {(user?.role === 'tutor' || user?.role === 'teacher') && (
        <View style={[styles.card, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('admin.selectStudent')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.studentSelector}>
            {students.map((st) => (
              <TouchableOpacity
                key={st.id}
                onPress={() => setSelectedStudent(st)}
                style={[
                  styles.studentChip,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  selectedStudent?.id === st.id && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.studentChipText,
                    { color: selectedStudent?.id === st.id ? colors.white : colors.text },
                  ]}
                >
                  {st.fullName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Wheel Banner Info */}
      <View
        style={[
          styles.wheelHeaderCard,
          currentWheelMode === 'gold' && styles.goldBanner,
          currentWheelMode === 'consequences' && styles.consequenceBanner,
          currentWheelMode === 'locked' && { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder },
        ]}
      >
        <Ionicons
          name={
            currentWheelMode === 'gold'
              ? 'trophy'
              : currentWheelMode === 'consequences'
              ? 'alert-circle'
              : 'lock-closed'
          }
          size={32}
          color={
            currentWheelMode === 'gold'
              ? '#d97706'
              : currentWheelMode === 'consequences'
              ? colors.error
              : colors.textSecondary
          }
        />
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.wheelModeTitle,
              currentWheelMode === 'gold' && { color: '#b45309' },
              currentWheelMode === 'consequences' && { color: colors.error },
              currentWheelMode === 'locked' && { color: colors.text },
            ]}
          >
            {currentWheelMode === 'gold'
              ? t('student.wheelGold')
              : currentWheelMode === 'consequences'
              ? t('student.wheelConsequences')
              : t('student.wheelLocked')}
          </Text>
          <Text style={[styles.wheelModeSub, { color: colors.textSecondary }]}>
            {activeStudent
              ? `Estudiante: ${activeStudent.fullName} | Promedio: ${currentAverage}`
              : t('student.wheelLockedSub')}
          </Text>
        </View>
      </View>

      {/* Visual Animated Wheel Graphic */}
      <View style={styles.wheelWrapper}>
        <View style={styles.pointerContainer}>
          <Ionicons name="caret-down" size={36} color={colors.primary} />
        </View>

        <Animated.View
          style={[
            styles.wheelGraphic,
            {
              borderColor:
                currentWheelMode === 'gold'
                  ? '#f59e0b'
                  : currentWheelMode === 'consequences'
                  ? colors.error
                  : colors.border,
              transform: [{ rotate: getInterpolatedRotation() }],
            },
          ]}
        >
          {options.map((opt, idx) => {
            const angle = (360 / options.length) * idx;
            return (
              <View
                key={idx}
                style={[
                  styles.wheelSegment,
                  {
                    transform: [
                      { rotate: `${angle}deg` },
                      { translateY: -70 },
                    ],
                  },
                ]}
              >
                <Text style={[styles.segmentText, { color: colors.text }]}>{opt}</Text>
              </View>
            );
          })}
        </Animated.View>

        <TouchableOpacity
          onPress={spin}
          disabled={isSpinning || currentWheelMode === 'locked'}
          style={[
            styles.spinBtnCenter,
            { backgroundColor: colors.primary },
            (isSpinning || currentWheelMode === 'locked') && styles.disabledSpinBtn,
          ]}
        >
          <Text style={styles.spinBtnCenterText}>
            {isSpinning ? '...' : t('student.spinBtn')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Result Display */}
      {spinResult && (
        <View style={[styles.resultCard, { backgroundColor: colors.secondary + '20', borderColor: colors.secondary }]}>
          <Ionicons name="sparkles" size={24} color={colors.secondary} />
          <Text style={[styles.resultText, { color: colors.secondary }]}>
            {t('student.spinResult', { result: spinResult })}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 110,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.sm,
  },
  backButtonText: {
    ...theme.typography.caption,
    fontWeight: '700',
  },
  title: {
    ...theme.typography.h1,
    fontSize: 22,
    marginBottom: 2,
  },
  subtitle: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.lg,
  },
  card: {
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    ...theme.typography.h2,
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
  studentSelector: {
    flexDirection: 'row',
  },
  studentChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.roundness.full,
    borderWidth: 1,
    marginRight: theme.spacing.xs,
  },
  studentChipText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  wheelHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  goldBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#f59e0b',
  },
  consequenceBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#ef4444',
  },
  wheelModeTitle: {
    ...theme.typography.bodySemibold,
    fontSize: 16,
  },
  wheelModeSub: {
    ...theme.typography.caption,
    fontSize: 11,
    marginTop: 2,
  },
  wheelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.lg,
    position: 'relative',
  },
  pointerContainer: {
    position: 'absolute',
    top: -24,
    zIndex: 10,
  },
  wheelGraphic: {
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  wheelSegment: {
    position: 'absolute',
    alignItems: 'center',
  },
  segmentText: {
    ...theme.typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  spinBtnCenter: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  disabledSpinBtn: {
    opacity: 0.5,
  },
  spinBtnCenterText: {
    ...theme.typography.caption,
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  resultText: {
    ...theme.typography.bodySemibold,
    fontSize: 15,
  },
});

export default PeriodWheel;
