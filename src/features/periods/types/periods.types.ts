import { PeriodRow, StudentRow, SubjectRow, RewardRuleRow, PeriodType, GradingSystem } from '../../../database/dbService';

export interface PeriodsSubjectsScreenProps {
  onBack: () => void;
}

export interface EditableRuleSlot {
  minGradeStr: string;
  maxGradeStr: string;
  rewardValue: string;
  ruleType: 'punishment' | 'minor_reward' | 'major_reward';
}

export interface PeriodFrequencyOption {
  type: PeriodType;
  labelKey: string;
  defaultLabel: string;
}

export interface GradingSystemOption {
  type: GradingSystem;
  label: string;
}
