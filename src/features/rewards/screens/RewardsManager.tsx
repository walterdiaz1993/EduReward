import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../config/theme';
import { StudentWithGrades, RewardRule } from '../../../mocks/userMock';
import Button from '../../../components/Button';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';

interface RewardsManagerProps {
  students: StudentWithGrades[];
  onAddRule: (studentId: string, rule: Omit<RewardRule, 'id'>) => void;
  onDeleteRule: (studentId: string, ruleId: string) => void;
  onBack: () => void;
}

export const RewardsManager: React.FC<RewardsManagerProps> = ({
  students,
  onAddRule,
  onDeleteRule,
  onBack,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    students.length > 0 ? students[0].id : ''
  );
  const [selectedSubject, setSelectedSubject] = useState<string>('Matemáticas');
  const [condition, setCondition] = useState<'greater' | 'less'>('greater');
  const [gradeValue, setGradeValue] = useState<string>('90');
  const [rewardValue, setRewardValue] = useState<string>('+50 Puntos');
  const [rewardType, setRewardType] = useState<'points' | 'console' | 'allowance'>('points');

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleCreateRule = () => {
    if (!selectedStudentId || !selectedSubject || !gradeValue || !rewardValue) return;

    onAddRule(selectedStudentId, {
      subject: selectedSubject,
      condition,
      value: parseFloat(gradeValue) || 0,
      rewardType,
      rewardValue,
    });
  };

  const subjectsList = [
    { key: 'matematicas', label: t('admin.matematicas') },
    { key: 'espanol', label: t('admin.espanol') },
    { key: 'ciencias', label: t('admin.ciencias') },
    { key: 'historia', label: t('admin.historia') },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={colors.primary} />
        <Text style={[styles.backButtonText, { color: colors.primary }]}>{t('common.backBtn')}</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.text }]}>{t('rewards.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('rewards.subtitle')}</Text>

      {/* Select Student Selector */}
      <View style={[styles.card, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('admin.selectStudent')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.studentSelector}>
          {students.map((st) => (
            <TouchableOpacity
              key={st.id}
              onPress={() => setSelectedStudentId(st.id)}
              style={[
                styles.studentChip,
                { borderColor: colors.border, backgroundColor: colors.background },
                selectedStudentId === st.id && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.studentChipText,
                  { color: selectedStudentId === st.id ? colors.white : colors.text },
                ]}
              >
                {st.fullName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Rule Creator Card */}
      <View style={[styles.card, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('rewards.addRuleBtn')}</Text>

        {/* Subject selection */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('rewards.subjectSelector')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {subjectsList.map((sb) => (
            <TouchableOpacity
              key={sb.key}
              onPress={() => setSelectedSubject(sb.label)}
              style={[
                styles.chip,
                { borderColor: colors.border, backgroundColor: colors.background },
                selectedSubject === sb.label && { backgroundColor: colors.secondary, borderColor: colors.secondary },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selectedSubject === sb.label ? colors.white : colors.text },
                ]}
              >
                {sb.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Condition Selector */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('rewards.ruleLabel')}</Text>
        <View style={styles.conditionRow}>
          <TouchableOpacity
            onPress={() => setCondition('greater')}
            style={[
              styles.conditionChip,
              { borderColor: colors.border, backgroundColor: colors.background },
              condition === 'greater' && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
          >
            <Text style={[styles.conditionChipText, { color: condition === 'greater' ? colors.white : colors.text }]}>
              {t('admin.ruleConditionGreater')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCondition('less')}
            style={[
              styles.conditionChip,
              { borderColor: colors.border, backgroundColor: colors.background },
              condition === 'less' && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
          >
            <Text style={[styles.conditionChipText, { color: condition === 'less' ? colors.white : colors.text }]}>
              {t('admin.ruleConditionLess')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Target Grade Value */}
        <View style={styles.inputGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('admin.gradePlaceholder')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="Ej. 90"
            placeholderTextColor={colors.textSecondary}
            value={gradeValue}
            onChangeText={setGradeValue}
            keyboardType="numeric"
          />
        </View>

        {/* Reward Type Selector */}
        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('home.menuRewards')}</Text>
        <View style={styles.rewardTypeRow}>
          <TouchableOpacity
            onPress={() => setRewardType('points')}
            style={[
              styles.typeChip,
              { borderColor: colors.border, backgroundColor: colors.background },
              rewardType === 'points' && { backgroundColor: colors.secondary, borderColor: colors.secondary },
            ]}
          >
            <Text style={[styles.typeChipText, { color: rewardType === 'points' ? colors.white : colors.text }]}>
              {t('rewards.pointsOption')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setRewardType('console')}
            style={[
              styles.typeChip,
              { borderColor: colors.border, backgroundColor: colors.background },
              rewardType === 'console' && { backgroundColor: colors.secondary, borderColor: colors.secondary },
            ]}
          >
            <Text style={[styles.typeChipText, { color: rewardType === 'console' ? colors.white : colors.text }]}>
              {t('rewards.consoleOption')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setRewardType('allowance')}
            style={[
              styles.typeChip,
              { borderColor: colors.border, backgroundColor: colors.background },
              rewardType === 'allowance' && { backgroundColor: colors.secondary, borderColor: colors.secondary },
            ]}
          >
            <Text style={[styles.typeChipText, { color: rewardType === 'allowance' ? colors.white : colors.text }]}>
              {t('rewards.allowanceOption')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reward Consequence Text Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Acción / Consecuencia</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="Ej. +50 Puntos / +1h Consola / -$5 Mesada"
            placeholderTextColor={colors.textSecondary}
            value={rewardValue}
            onChangeText={setRewardValue}
          />
        </View>

        <Button
          title={t('rewards.addRuleBtn')}
          onPress={handleCreateRule}
          containerStyle={{ marginTop: theme.spacing.md }}
        />
      </View>

      {/* Active Rules List */}
      <View style={[styles.card, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('rewards.rulesList')}</Text>

        {selectedStudent && selectedStudent.subjectRules && selectedStudent.subjectRules.length > 0 ? (
          selectedStudent.subjectRules.map((rule) => (
            <View key={rule.id} style={[styles.ruleItem, { borderBottomColor: colors.border }]}>
              <View style={styles.ruleInfo}>
                <Ionicons name="ribbon-outline" size={20} color={colors.secondary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.ruleSubjectText, { color: colors.text }]}>{rule.subject}</Text>
                  <Text style={[styles.ruleDescText, { color: colors.textSecondary }]}>
                    {t('rewards.ruleSummaryText', {
                      cond: rule.condition === 'greater' ? '>' : '<',
                      val: rule.value,
                      action: rule.rewardValue,
                    })}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => onDeleteRule(selectedStudent.id, rule.id)}
                style={styles.deleteBtn}
              >
                <Ionicons name="trash-outline" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('rewards.noRules')}</Text>
        )}
      </View>
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
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    ...theme.typography.h2,
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
  studentSelector: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
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
  fieldLabel: {
    ...theme.typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 10,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.roundness.full,
    borderWidth: 1,
    marginRight: theme.spacing.xs,
  },
  chipText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  conditionRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  conditionChip: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.roundness.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  conditionChipText: {
    ...theme.typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  inputGroup: {
    marginBottom: theme.spacing.xs,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: theme.roundness.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 13,
  },
  rewardTypeRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  typeChip: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.roundness.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeChipText: {
    ...theme.typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
  },
  ruleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  ruleSubjectText: {
    ...theme.typography.bodySemibold,
    fontSize: 14,
  },
  ruleDescText: {
    ...theme.typography.caption,
    fontSize: 11,
  },
  deleteBtn: {
    padding: theme.spacing.xs,
  },
  emptyText: {
    ...theme.typography.caption,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
});

export default RewardsManager;
