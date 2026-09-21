import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { theme } from '../../../config/theme';
import { GradeLogRow } from '../../../database/dbService';

interface GradeDetailModalProps {
  visible: boolean;
  gradeLog: GradeLogRow | null;
  subjectName?: string;
  reward?: {
    title: string;
    reward_type: string;
    reward_value: string;
    rule_type: string;
  } | null;
  onClose: () => void;
  onEdit: (gradeLog: GradeLogRow) => void;
  onDelete: (gradeId: string) => void;
}

export const GradeDetailModal: React.FC<GradeDetailModalProps> = ({
  visible,
  gradeLog,
  subjectName = 'Materia',
  reward,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { colors } = useTheme();

  if (!visible || !gradeLog) return null;

  const isMajor = reward?.rule_type === 'major_reward';
  const isMinor = reward?.rule_type === 'minor_reward';
  const isPunish = reward?.rule_type === 'punishment';

  const rewardBgColor = isMajor
    ? 'rgba(245, 158, 11, 0.15)'
    : isMinor
    ? 'rgba(16, 185, 129, 0.15)'
    : isPunish
    ? 'rgba(239, 68, 68, 0.15)'
    : 'rgba(59, 130, 246, 0.15)';

  const rewardBorderColor = isMajor
    ? '#f59e0b'
    : isMinor
    ? '#10b981'
    : isPunish
    ? '#ef4444'
    : '#3b82f6';

  const rewardTextColor = isMajor
    ? '#d97706'
    : isMinor
    ? '#059669'
    : isPunish
    ? '#dc2626'
    : '#2563eb';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="ribbon-outline" size={22} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>Detalle de Calificación</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Grade Details Summary */}
          <View style={[styles.infoCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Materia:</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{subjectName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Nota Registrada:</Text>
              <Text style={[styles.gradeBadge, { color: colors.primary }]}>{gradeLog.raw_grade}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Fecha de Registro:</Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                {new Date(gradeLog.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>

          {/* Reward Section */}
          <View style={[styles.rewardCard, { backgroundColor: rewardBgColor, borderColor: rewardBorderColor }]}>
            <View style={styles.rewardHeader}>
              <Ionicons
                name={isMajor ? 'trophy' : isMinor ? 'gift' : isPunish ? 'alert-circle' : 'information-circle'}
                size={26}
                color={rewardBorderColor}
              />
              <Text style={[styles.rewardTitle, { color: rewardTextColor }]}>
                {reward?.title || 'Premio de la Nota'}
              </Text>
            </View>

            {reward && reward.reward_value ? (
              <View style={styles.rewardBody}>
                <Text style={[styles.rewardLabel, { color: colors.textSecondary }]}>
                  {isPunish ? 'Consecuencia asignada:' : 'Premio u objeto obtenido:'}
                </Text>
                <Text style={[styles.rewardValueText, { color: colors.text }]}>
                  {reward.reward_value}
                </Text>
              </View>
            ) : (
              <Text style={[styles.noRewardText, { color: colors.textSecondary }]}>
                No hay premio o consecuencia registrada para esta calificación.
              </Text>
            )}
          </View>

          {/* Actions: Edit & Delete */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.btnAction, { backgroundColor: colors.primary }]}
              onPress={() => {
                onClose();
                onEdit(gradeLog);
              }}
            >
              <Ionicons name="pencil" size={16} color="#ffffff" />
              <Text style={styles.btnActionText}>Editar Nota</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btnAction, { backgroundColor: colors.error }]}
              onPress={() => {
                onClose();
                onDelete(gradeLog.id);
              }}
            >
              <Ionicons name="trash-outline" size={16} color="#ffffff" />
              <Text style={styles.btnActionText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
  },
  title: {
    ...theme.typography.h2,
    fontSize: 17,
  },
  closeBtn: {
    padding: 4,
  },
  infoCard: {
    borderRadius: theme.roundness.md,
    borderWidth: 1,
    padding: theme.spacing.md,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    ...theme.typography.caption,
    fontSize: 13,
  },
  infoValue: {
    ...theme.typography.bodySemibold,
    fontSize: 14,
  },
  gradeBadge: {
    ...theme.typography.h2,
    fontSize: 18,
    fontWeight: '800',
  },
  rewardCard: {
    borderRadius: theme.roundness.md,
    borderWidth: 1.5,
    padding: theme.spacing.md,
    gap: 8,
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rewardTitle: {
    ...theme.typography.bodySemibold,
    fontSize: 15,
  },
  rewardBody: {
    marginTop: 4,
    gap: 2,
  },
  rewardLabel: {
    ...theme.typography.caption,
    fontSize: 11,
  },
  rewardValueText: {
    ...theme.typography.body,
    fontSize: 15,
    fontWeight: '700',
  },
  noRewardText: {
    ...theme.typography.caption,
    fontSize: 12,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  btnAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.roundness.md,
    gap: 6,
  },
  btnActionText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default GradeDetailModal;
