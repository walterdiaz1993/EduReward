import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../config/theme';
import useStudent from '../../students/hooks/useStudent';
import { StudentWithGrades } from '../../../mocks/userMock';
import { useAuth } from '../../../store/AuthContext';
import { useAdmin } from '../../students/hooks/useAdmin';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';

export const PeriodWheel: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { students } = useAdmin();

  const [selectedStudent, setSelectedStudent] = useState<StudentWithGrades | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0.7)).current;

  const {
    studentData,
    periods,
    selectedPeriodId,
    setSelectedPeriodId,
    activeWheelInfo,
    savedSpinRecord,
    resolveWheelForStudentAndPeriod,
    resetSpinOpportunity,
    spinResult,
    clearSpinResult,
    isSpinning,
    spin,
    getInterpolatedRotation,
  } = useStudent();

  useEffect(() => {
    if (students && students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0]);
    }
  }, [students]);

  const activeStudent =
    user?.role === 'tutor' || user?.role === 'teacher'
      ? selectedStudent || (students.length > 0 ? students[0] : null)
      : studentData;

  const currentAverage = activeStudent ? activeStudent.average : 0;

  useEffect(() => {
    if (activeStudent && selectedPeriodId) {
      resolveWheelForStudentAndPeriod(activeStudent.id, selectedPeriodId);
    }
  }, [activeStudent, selectedPeriodId]);

  useEffect(() => {
    if (spinResult) {
      setIsModalVisible(true);
      scaleAnim.setValue(0);
      bounceAnim.setValue(0.7);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: 3,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [spinResult]);

  const handleCloseModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsModalVisible(false);
      clearSpinResult();
    });
  };

  const handleResetSpin = () => {
    if (!activeStudent || !selectedPeriodId) return;

    Alert.alert(
      t('wheel.resetConfirmTitle'),
      t('wheel.resetConfirmMsg', { name: activeStudent.fullName, avg: currentAverage }),
      [
        { text: t('profile.deleteAccountCancel') || 'Cancelar', style: 'cancel' },
        {
          text: t('wheel.resetConfirmTitle') || 'Reiniciar',
          style: 'destructive',
          onPress: async () => {
            await resetSpinOpportunity(activeStudent.id, selectedPeriodId);
          },
        },
      ]
    );
  };

  const wheelTitle = activeWheelInfo?.wheel.title || 'Ruleta del Período';
  const wheelColor = activeWheelInfo?.wheel.color || colors.primary;
  const wheelIcon = activeWheelInfo?.wheel.icon || 'aperture-outline';
  const wheelOptions = activeWheelInfo?.options || [];
  const isSpunAlready = !!savedSpinRecord;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

      <Text style={[styles.title, { color: colors.text }]}>{t('home.menuWheel')}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t('wheel.subtitle')}
      </Text>

      {/* Parent/Teacher Student Selector */}
      {(user?.role === 'tutor' || user?.role === 'teacher') && (
        <View style={[styles.card, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('admin.selectStudent')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorRow}>
            {students.map((st) => (
              <TouchableOpacity
                key={st.id}
                onPress={() => setSelectedStudent(st)}
                style={[
                  styles.chip,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  selectedStudent?.id === st.id && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
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

      {/* Period Selector */}
      {periods.length > 0 && (
        <View style={[styles.card, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('wheel.selectPeriod')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorRow}>
            {periods.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setSelectedPeriodId(p.id)}
                style={[
                  styles.chip,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  selectedPeriodId === p.id && { backgroundColor: colors.secondary, borderColor: colors.secondary },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: selectedPeriodId === p.id ? colors.white : colors.text },
                  ]}
                >
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Saved Prize Banner if spun already */}
      {isSpunAlready && (
        <View style={[styles.spunBannerCard, { backgroundColor: colors.secondary + '15', borderColor: colors.secondary }]}>
          <Ionicons name="trophy-outline" size={28} color={colors.secondary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.spunBannerTitle, { color: colors.secondary }]}>
              {t('wheel.spunBannerTitle')}
            </Text>
            <Text style={[styles.spunBannerText, { color: colors.text }]}>
              {t('wheel.spunBannerText', { prize: savedSpinRecord?.prize_text })}
            </Text>
          </View>
        </View>
      )}

      {/* Wheel Header Banner Card */}
      <View
        style={[
          styles.wheelHeaderCard,
          { backgroundColor: wheelColor + '15', borderColor: wheelColor },
        ]}
      >
        <Ionicons name={(wheelIcon as any) || 'trophy'} size={32} color={wheelColor} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.wheelModeTitle, { color: wheelColor }]}>
            {wheelTitle}
          </Text>
          <Text style={[styles.wheelModeSub, { color: colors.textSecondary }]}>
            {activeStudent
              ? t('wheel.studentAverageInfo', { name: activeStudent.fullName, avg: currentAverage })
              : t('wheel.selectStudentToSpin')}
          </Text>
        </View>
      </View>

      {/* Animated Wheel Graphic */}
      <View style={styles.wheelWrapper}>
        <View style={styles.pointerContainer}>
          <Ionicons name="caret-down" size={36} color={wheelColor} />
        </View>

        <Animated.View
          style={[
            styles.wheelGraphic,
            {
              borderColor: wheelColor,
              transform: [{ rotate: getInterpolatedRotation() }],
            },
          ]}
        >
          {wheelOptions.length > 0 ? (
            wheelOptions.map((opt, idx) => {
              const angle = (360 / wheelOptions.length) * idx;
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
                  <Text style={[styles.segmentText, { color: colors.text }]} numberOfLines={1}>
                    {opt}
                  </Text>
                </View>
              );
            })
          ) : (
            <Text style={[styles.segmentText, { color: colors.textSecondary }]}>{t('rewards.noOptions')}</Text>
          )}
        </Animated.View>

        <TouchableOpacity
          onPress={() => spin(wheelOptions, activeStudent?.id)}
          disabled={isSpinning || wheelOptions.length === 0 || isSpunAlready}
          style={[
            styles.spinBtnCenter,
            { backgroundColor: wheelColor },
            (isSpinning || wheelOptions.length === 0 || isSpunAlready) && styles.disabledSpinBtn,
          ]}
        >
          <Text style={styles.spinBtnCenterText}>
            {isSpunAlready ? t('wheel.played') : isSpinning ? '...' : t('student.spinBtn')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reset Spin Opportunity Button for Tutor/Teacher or Parent */}
      {isSpunAlready && (user?.role === 'tutor' || user?.role === 'teacher') && (
        <TouchableOpacity
          onPress={handleResetSpin}
          style={[styles.resetButton, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons name="refresh-outline" size={18} color={colors.primary} />
          <Text style={[styles.resetButtonText, { color: colors.primary }]}>
            {t('wheel.resetOpportunityBtn')}
          </Text>
        </TouchableOpacity>
      )}

      {/* Eye-Catching Animated Victory Prize Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalCardContainer,
              {
                backgroundColor: colors.card,
                borderColor: wheelColor,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            {/* Sparkles top badge */}
            <View style={[styles.modalHeaderBadge, { backgroundColor: wheelColor + '20' }]}>
              <Ionicons name="sparkles" size={30} color={wheelColor} />
            </View>

            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('wheel.congratsTitle')}</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              {t('wheel.congratsSub', { name: activeStudent ? activeStudent.fullName : 'Estudiante' })}
            </Text>

            {/* Glowing Prize Display Card */}
            <Animated.View
              style={[
                styles.prizeCard,
                {
                  backgroundColor: wheelColor + '15',
                  borderColor: wheelColor,
                  transform: [{ scale: bounceAnim }],
                },
              ]}
            >
              <View style={[styles.prizeIconContainer, { backgroundColor: wheelColor }]}>
                <Ionicons name="gift" size={38} color="#ffffff" />
              </View>

              <Text style={[styles.prizeLabelText, { color: colors.textSecondary }]}>{t('wheel.prizeWonLabel')}</Text>
              <Text style={[styles.prizeValueText, { color: wheelColor }]}>{spinResult}</Text>
            </Animated.View>

            {/* Action Claim Button */}
            <TouchableOpacity
              onPress={handleCloseModal}
              style={[styles.claimButton, { backgroundColor: wheelColor }]}
              activeOpacity={0.8}
            >
              <Ionicons name="trophy" size={20} color="#ffffff" />
              <Text style={styles.claimButtonText}>{t('wheel.claimBtn')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 110,
    paddingTop: theme.spacing.md,
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
    fontSize: 15,
    marginBottom: theme.spacing.sm,
  },
  selectorRow: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.roundness.full,
    borderWidth: 1,
    marginRight: theme.spacing.xs,
  },
  chipText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  spunBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.roundness.lg,
    borderWidth: 1.5,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  spunBannerTitle: {
    ...theme.typography.bodySemibold,
    fontSize: 14,
  },
  spunBannerText: {
    ...theme.typography.caption,
    fontSize: 12,
    marginTop: 2,
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
    maxWidth: 90,
  },
  segmentText: {
    ...theme.typography.caption,
    fontWeight: '700',
    fontSize: 10,
    textAlign: 'center',
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
    fontSize: 11,
    textAlign: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.roundness.md,
    borderWidth: 1,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  resetButtonText: {
    ...theme.typography.bodySemibold,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalCardContainer: {
    width: '90%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 2,
    padding: theme.spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeaderBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  modalTitle: {
    ...theme.typography.h1,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 2,
  },
  modalSubtitle: {
    ...theme.typography.caption,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  prizeCard: {
    width: '100%',
    borderRadius: theme.roundness.lg,
    borderWidth: 1.5,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  prizeIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  prizeLabelText: {
    ...theme.typography.caption,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 2,
  },
  prizeValueText: {
    ...theme.typography.h2,
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '800',
  },
  claimButton: {
    width: '100%',
    height: 48,
    borderRadius: theme.roundness.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  claimButtonText: {
    ...theme.typography.bodySemibold,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default PeriodWheel;
