import React from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { theme } from '../../../config/theme';
import Button from '../../../components/Button';
import { SubjectRow } from '../../../database/dbService';
import { EditableRuleSlot } from '../types/periods.types';
import { getGradingSystemLabel } from '../constants/periods.constants';
import RuleSlotEditor from './RuleSlotEditor';
import { createStyles } from '../styles/PeriodsSubjectsScreen.styles';

interface SubjectRewardsModalProps {
  editingSubject: SubjectRow | null;
  ruleSlots: EditableRuleSlot[];
  onClose: () => void;
  onAddRuleSlot: () => void;
  onRemoveRuleSlot: (index: number) => void;
  onUpdateRuleSlot: (index: number, field: keyof EditableRuleSlot, value: string) => void;
  onSaveRewards: () => void;
}

export const SubjectRewardsModal: React.FC<SubjectRewardsModalProps> = ({
  editingSubject,
  ruleSlots,
  onClose,
  onAddRuleSlot,
  onRemoveRuleSlot,
  onUpdateRuleSlot,
  onSaveRewards,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  if (!editingSubject) return null;

  return (
    <Modal visible={true} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.modalTitle}>
                {t('periods.rewardsModalTitle', { subjectName: editingSubject.name })}
              </Text>
              <Text style={styles.modalSub}>
                {t('periods.gradingSystemText', {
                  systemLabel: getGradingSystemLabel(editingSubject.grading_system, t),
                })}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionSubTitle}>
              {t('periods.rewardsModalSub')}
            </Text>

            {ruleSlots.map((slot, idx) => (
              <RuleSlotEditor
                key={idx}
                slot={slot}
                index={idx}
                totalSlots={ruleSlots.length}
                gradingSystem={editingSubject.grading_system}
                onUpdateSlot={onUpdateRuleSlot}
                onRemoveSlot={onRemoveRuleSlot}
              />
            ))}

            {ruleSlots.length < 4 && (
              <TouchableOpacity onPress={onAddRuleSlot} style={styles.addSlotBtn}>
                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                <Text style={styles.addSlotBtnText}>
                  {t('periods.addRewardSlot', { count: ruleSlots.length })}
                </Text>
              </TouchableOpacity>
            )}

            <Button
              title={t('periods.saveSubjectRewardsBtn')}
              onPress={onSaveRewards}
              containerStyle={{ marginTop: theme.spacing.lg }}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default SubjectRewardsModal;
