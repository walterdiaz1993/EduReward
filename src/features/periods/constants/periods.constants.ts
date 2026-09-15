import { PeriodType, GradingSystem } from '../../../database/dbService';
import { EditableRuleSlot } from '../types/periods.types';

export const PERIOD_FREQUENCIES: { type: PeriodType; labelKey: string }[] = [
  { type: 'monthly', labelKey: 'periods.frequencyMonthly' },
  { type: 'bimonthly', labelKey: 'periods.frequencyBimonthly' },
  { type: 'quarterly', labelKey: 'periods.frequencyQuarterly' },
  { type: 'semester', labelKey: 'periods.frequencySemester' },
  { type: 'annual', labelKey: 'periods.frequencyAnnual' },
];

export const GRADING_SYSTEMS: { type: GradingSystem; labelKey: string }[] = [
  { type: 'percentage', labelKey: 'admin.base100' },
  { type: 'decimal', labelKey: 'admin.base10' },
  { type: 'letters', labelKey: 'admin.alphabetical' },
];

export const getPeriodTypeLabel = (type: PeriodType, t: (key: string, options?: any) => string): string => {
  switch (type) {
    case 'monthly':
      return t('periods.frequencyMonthly');
    case 'bimonthly':
      return t('periods.frequencyBimonthly');
    case 'quarterly':
      return t('periods.frequencyQuarterly');
    case 'semester':
      return t('periods.frequencySemester');
    case 'annual':
      return t('periods.frequencyAnnual');
    default:
      return type;
  }
};

export const getGradingSystemLabel = (
  system: GradingSystem | undefined,
  t: (key: string, options?: any) => string
): string => {
  switch (system) {
    case 'decimal':
      return t('admin.base10');
    case 'letters':
      return t('admin.alphabetical');
    case 'percentage':
    default:
      return t('admin.base100');
  }
};

export const getDefaultRuleSlots = (system: GradingSystem): EditableRuleSlot[] => {
  if (system === 'decimal') {
    return [
      { minGradeStr: '0', maxGradeStr: '5.9', rewardValue: '', ruleType: 'punishment' },
      { minGradeStr: '6', maxGradeStr: '8.9', rewardValue: '', ruleType: 'minor_reward' },
      { minGradeStr: '9', maxGradeStr: '10', rewardValue: '', ruleType: 'major_reward' },
    ];
  }
  if (system === 'letters') {
    return [
      { minGradeStr: 'F', maxGradeStr: 'D', rewardValue: '', ruleType: 'punishment' },
      { minGradeStr: 'C', maxGradeStr: 'B', rewardValue: '', ruleType: 'minor_reward' },
      { minGradeStr: 'A', maxGradeStr: 'A', rewardValue: '', ruleType: 'major_reward' },
    ];
  }
  return [
    { minGradeStr: '0', maxGradeStr: '59', rewardValue: '', ruleType: 'punishment' },
    { minGradeStr: '60', maxGradeStr: '89', rewardValue: '', ruleType: 'minor_reward' },
    { minGradeStr: '90', maxGradeStr: '100', rewardValue: '', ruleType: 'major_reward' },
  ];
};
