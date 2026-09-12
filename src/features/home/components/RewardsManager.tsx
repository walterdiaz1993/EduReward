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
  const [selectedStudent, setSelectedStudent] = useState<StudentWithGrades | null>(students[0] || null);
  const [activeSubject, setActiveSubject] = useState<string>('Matemáticas');
  const [condition, setCondition] = useState<'greater' | 'less'>('greater');
  const [gradeValue, setGradeValue] = useState<string>('');
  const [rewardType, setRewardType] = useState<'points' | 'console' | 'allowance'>('points');
  const [rewardVal, setRewardVal] = useState<string>('');

  const subjects = ['Matemáticas', 'Español', 'Ciencias', 'Historia'];

  const getSubjectIcon = (sub: string) => {
    switch (sub) {
      case 'Matemáticas':
        return 'calculator-outline';
      case 'Español':
        return 'book-outline';
      case 'Ciencias':
        return 'flask-outline';
      default:
        return 'hourglass-outline';
    }
  };

  const handleCreateRule = () => {
    if (!selectedStudent || !gradeValue.trim() || !rewardVal.trim()) return;

    const valNumeric = parseFloat(gradeValue);
    if (isNaN(valNumeric) || valNumeric < 0 || valNumeric > 100) return;

    const newRuleValue = rewardType === 'points' ? parseInt(rewardVal, 10) || 50 : rewardVal;

    onAddRule(selectedStudent.id, {
      subject: activeSubject,
      condition,
      value: valNumeric,
      rewardType,
      rewardValue: newRuleValue,
    });

    setGradeValue('');
    setRewardVal('');
  };

  const currentRules = selectedStudent
    ? selectedStudent.subjectRules.filter((r) => r.subject === activeSubject)
    : [];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
        <Text style={styles.backButtonText}>{t('common.backBtn')}</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{t('rewards.title')}</Text>
      <Text style={styles.subtitle}>{t('rewards.subtitle')}</Text>

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

      <Text style={styles.label}>{t('rewards.subjectSelector')}</Text>
      <View style={styles.subjectRow}>
        {subjects.map((sub) => (
          <TouchableOpacity
            key={sub}
            onPress={() => setActiveSubject(sub)}
            style={[
              styles.subjectCard,
              activeSubject === sub ? styles.subjectCardActive : {},
            ]}
          >
            <Ionicons
              name={getSubjectIcon(sub) as any}
              size={20}
              color={activeSubject === sub ? theme.colors.white : theme.colors.primary}
            />
            <Text
              style={[
                styles.subjectCardText,
                activeSubject === sub ? styles.subjectCardTextActive : {},
              ]}
            >
              {sub}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.builderCard}>
        <Text style={styles.cardTitle}>{t('rewards.addRuleBtn')}</Text>

        <Text style={styles.fieldLabel}>{t('admin.conditionLabel')}</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            onPress={() => setCondition('greater')}
            style={[
              styles.toggleTab,
              condition === 'greater' ? styles.toggleTabActive : {},
            ]}
          >
            <Text
              style={[
                styles.toggleTabText,
                condition === 'greater' ? styles.toggleTabTextActive : {},
              ]}
            >
              {t('admin.ruleConditionGreater')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCondition('less')}
            style={[
              styles.toggleTab,
              condition === 'less' ? styles.toggleTabActive : {},
            ]}
          >
            <Text
              style={[
                styles.toggleTabText,
                condition === 'less' ? styles.toggleTabTextActive : {},
              ]}
            >
              {t('admin.ruleConditionLess')}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.fieldLabel}>{t('admin.valueLabel')} (0-100)</Text>
        <TextInput
          style={styles.textInput}
          value={gradeValue}
          onChangeText={setGradeValue}
          placeholder="E.g., 90"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="numeric"
        />

        <Text style={styles.fieldLabel}>{t('rewards.ruleLabel')}</Text>
        <View style={styles.toggleRow}>
          {(['points', 'console', 'allowance'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setRewardType(type)}
              style={[
                styles.toggleTab,
                rewardType === type ? styles.toggleTabActive : {},
              ]}
            >
              <Text
                style={[
                  styles.toggleTabText,
                  rewardType === type ? styles.toggleTabTextActive : {},
                ]}
              >
                {t(`rewards.${type}Option`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>
          {rewardType === 'points'
            ? t('admin.points')
            : t('rewards.ruleLabel')}
        </Text>
        <TextInput
          style={styles.textInput}
          value={rewardVal}
          onChangeText={setRewardVal}
          placeholder={rewardType === 'points' ? 'E.g., 100' : 'E.g., +1h console, -$10 allowance'}
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType={rewardType === 'points' ? 'numeric' : 'default'}
        />

        <Button title={t('rewards.addRuleBtn')} onPress={handleCreateRule} />
      </View>

      <View style={styles.rulesContainer}>
        <Text style={styles.rulesTitle}>{t('rewards.rulesList')}</Text>
        {currentRules.length > 0 ? (
          currentRules.map((rule) => (
            <View key={rule.id} style={styles.ruleItem}>
              <View style={styles.ruleInfo}>
                <Ionicons name="checkmark-circle-outline" size={20} color={theme.colors.secondary} />
                <Text style={styles.ruleText}>
                  {t('rewards.rulePlaceholder', {
                    subject: rule.subject,
                    condition: rule.condition === 'greater' ? '>' : '<',
                    value: rule.value,
                    reward: rule.rewardValue,
                  })}
                </Text>
              </View>
              {selectedStudent && (
                <TouchableOpacity
                  onPress={() => onDeleteRule(selectedStudent.id, rule.id)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>{t('rewards.noRules')}</Text>
        )}
      </View>
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
  label: {
    ...theme.typography.bodySemibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  studentSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.md,
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
  subjectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: theme.spacing.lg,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.roundness.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(30, 64, 175, 0.08)',
    gap: 6,
  },
  subjectCardActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  subjectCardText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.text,
  },
  subjectCardTextActive: {
    color: theme.colors.white,
  },
  builderCard: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: 'rgba(30, 64, 175, 0.08)',
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    ...theme.typography.h2,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  fieldLabel: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    fontSize: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  toggleTab: {
    flex: 1,
    height: 38,
    borderRadius: theme.roundness.sm,
    borderWidth: 1,
    borderColor: 'rgba(30, 64, 175, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  toggleTabActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  toggleTabText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    fontSize: 11,
  },
  toggleTabTextActive: {
    color: theme.colors.primary,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(30, 64, 175, 0.1)',
    borderRadius: theme.roundness.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontSize: theme.typography.caption.fontSize,
    marginBottom: theme.spacing.md,
  },
  rulesContainer: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: 'rgba(30, 64, 175, 0.08)',
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  rulesTitle: {
    ...theme.typography.h2,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  ruleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  ruleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.sm,
  },
  ruleText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    lineHeight: 18,
    flex: 1,
  },
  deleteBtn: {
    padding: theme.spacing.xs,
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});
export default RewardsManager;
