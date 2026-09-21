import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { theme } from '../../../config/theme';
import { RewardLogRow } from '../../../database/dbService';

interface RewardCelebrationModalProps {
  visible: boolean;
  reward: RewardLogRow | null;
  subjectName?: string;
  studentName?: string;
  onClose: () => void;
}

export const RewardCelebrationModal: React.FC<RewardCelebrationModalProps> = ({
  visible,
  reward,
  subjectName,
  studentName,
  onClose,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    if (visible && reward) {
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
  }, [visible, reward]);

  if (!visible || !reward) return null;

  const handleClose = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const isPunish = reward.rule_type === 'punishment';
  const isMajor = reward.rule_type === 'major_reward';

  const iconName = isPunish ? 'alert-circle' : isMajor ? 'trophy' : 'gift';
  const accentColor = isPunish
    ? colors.error
    : isMajor
    ? colors.secondary
    : colors.primary;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.card,
              borderColor: accentColor,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Sparkles top badge */}
          <View style={[styles.modalHeaderBadge, { backgroundColor: accentColor + '20' }]}>
            <Ionicons name={isPunish ? 'warning' : 'sparkles'} size={30} color={accentColor} />
          </View>

          {/* Title */}
          <Text style={[styles.titleText, { color: colors.text }]}>
            {reward.title}
          </Text>

          {/* Subtitle with student & subject info */}
          <Text style={[styles.studentText, { color: colors.textSecondary }]}>
            {studentName ? `${studentName}` : ''}
            {studentName && subjectName ? ' • ' : ''}
            {subjectName ? `${subjectName}` : ''}
          </Text>

          {/* Glowing Animated Prize Card */}
          <Animated.View
            style={[
              styles.detailsCard,
              {
                backgroundColor: accentColor + '15',
                borderColor: accentColor,
                transform: [{ scale: bounceAnim }],
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: accentColor }]}>
              <Ionicons name={iconName} size={36} color="#ffffff" />
            </View>

            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
              {isPunish ? t('rewards.consequenceLabel') : t('rewards.prizeObtainedLabel')}
            </Text>
            <Text style={[styles.rewardValueText, { color: accentColor }]}>
              {reward.reward_value}
            </Text>
          </Animated.View>

          {/* Close Action Button */}
          <TouchableOpacity
            onPress={handleClose}
            style={[styles.claimButton, { backgroundColor: accentColor }]}
            activeOpacity={0.8}
          >
            <Ionicons name={isPunish ? 'checkmark-circle' : 'trophy'} size={20} color="#ffffff" />
            <Text style={styles.claimButtonText}>
              {isPunish ? t('rewards.closeUnderstood') : t('rewards.claimRewardBtn')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  container: {
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
  titleText: {
    ...theme.typography.h1,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  studentText: {
    ...theme.typography.caption,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  detailsCard: {
    width: '100%',
    borderRadius: theme.roundness.lg,
    borderWidth: 1.5,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconCircle: {
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
  detailLabel: {
    ...theme.typography.caption,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    marginBottom: 2,
  },
  rewardValueText: {
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

export default RewardCelebrationModal;
