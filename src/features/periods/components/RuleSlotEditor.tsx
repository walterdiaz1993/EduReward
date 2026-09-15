import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { theme } from '../../../config/theme';
import { GradingSystem } from '../../../database/dbService';
import { EditableRuleSlot } from '../types/periods.types';
import { createStyles } from '../styles/PeriodsSubjectsScreen.styles';

interface RuleSlotEditorProps {
  slot: EditableRuleSlot;
  index: number;
  totalSlots: number;
  gradingSystem?: GradingSystem;
  onUpdateSlot: (index: number, field: keyof EditableRuleSlot, value: string) => void;
  onRemoveSlot: (index: number) => void;
}

export const RuleSlotEditor: React.FC<RuleSlotEditorProps> = ({
  slot,
  index,
  totalSlots,
  gradingSystem,
  onUpdateSlot,
  onRemoveSlot,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const placeholderMin = gradingSystem === 'letters' ? 'F' : '0';
  const placeholderMax = gradingSystem === 'letters' ? 'A' : '100';

  let rewardPlaceholder = 'Ej. +50 Puntos de recompensa / +30m consola';
  if (slot.ruleType === 'punishment') {
    rewardPlaceholder = 'Ej. Sin consola por 1 semana / -20 pts';
  } else if (slot.ruleType === 'major_reward') {
    rewardPlaceholder = 'Ej. +150 Puntos / $10 Mesada / Salida al cine';
  }

  return (
    <View style={styles.ruleSlotCard}>
      <View style={styles.ruleSlotHeader}>
        <Text style={styles.ruleSlotTitle}>
          {t('periods.ruleSlotTitle', { number: index + 1 })}
        </Text>
        {totalSlots > 1 && (
          <TouchableOpacity onPress={() => onRemoveSlot(index)}>
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

      {/* Rule Type Selection */}
      <Text style={styles.fieldLabel}>{t('periods.ruleTypeLabel')}</Text>
      <View style={styles.ruleTypeRow}>
        <TouchableOpacity
          onPress={() => onUpdateSlot(index, 'ruleType', 'punishment')}
          style={[
            styles.ruleTypeTab,
            slot.ruleType === 'punishment' && {
              backgroundColor: colors.error + '20',
              borderColor: colors.error,
            },
          ]}
        >
          <Text
            style={[
              styles.ruleTypeTabText,
              { color: slot.ruleType === 'punishment' ? colors.error : colors.textSecondary },
            ]}
          >
            {t('periods.punishment')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onUpdateSlot(index, 'ruleType', 'minor_reward')}
          style={[
            styles.ruleTypeTab,
            slot.ruleType === 'minor_reward' && {
              backgroundColor: colors.secondary + '20',
              borderColor: colors.secondary,
            },
          ]}
        >
          <Text
            style={[
              styles.ruleTypeTabText,
              { color: slot.ruleType === 'minor_reward' ? colors.secondary : colors.textSecondary },
            ]}
          >
            {t('periods.minorReward')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onUpdateSlot(index, 'ruleType', 'major_reward')}
          style={[
            styles.ruleTypeTab,
            slot.ruleType === 'major_reward' && {
              backgroundColor: colors.primary + '20',
              borderColor: colors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.ruleTypeTabText,
              { color: slot.ruleType === 'major_reward' ? colors.primary : colors.textSecondary },
            ]}
          >
            {t('periods.majorReward')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Range Inputs */}
      <Text style={[styles.fieldLabel, { marginTop: theme.spacing.xs }]}>
        {t('periods.gradeRangeLabel')}
      </Text>
      <View style={styles.rangeInputsRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rangeInputSub}>{t('periods.fromMin')}</Text>
          <TextInput
            style={styles.rangeInput}
            placeholder={placeholderMin}
            placeholderTextColor={colors.textSecondary}
            value={slot.minGradeStr}
            onChangeText={(val) => onUpdateSlot(index, 'minGradeStr', val)}
          />
        </View>

        <Text style={styles.rangeToText}>{t('periods.rangeTo')}</Text>

        <View style={{ flex: 1 }}>
          <Text style={styles.rangeInputSub}>{t('periods.toMax')}</Text>
          <TextInput
            style={styles.rangeInput}
            placeholder={placeholderMax}
            placeholderTextColor={colors.textSecondary}
            value={slot.maxGradeStr}
            onChangeText={(val) => onUpdateSlot(index, 'maxGradeStr', val)}
          />
        </View>
      </View>

      {/* Reward Description */}
      <Text style={[styles.fieldLabel, { marginTop: theme.spacing.xs }]}>
        {t('periods.rewardDescLabel')}
      </Text>
      <TextInput
        style={styles.rewardDescInput}
        placeholder={rewardPlaceholder}
        placeholderTextColor={colors.textSecondary}
        value={slot.rewardValue}
        onChangeText={(val) => onUpdateSlot(index, 'rewardValue', val)}
      />
    </View>
  );
};

export default RuleSlotEditor;
