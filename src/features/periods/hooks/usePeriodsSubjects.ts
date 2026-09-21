import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  setPeriods,
  addPeriod,
  deletePeriod as deletePeriodAction,
  setSubjects,
  addSubject as addSubjectAction,
  deleteSubject as deleteSubjectAction,
  setSelectedPeriodId,
} from '../../../store/slices/academicSlice';
import dbService, {
  PeriodRow,
  SubjectRow,
  RewardRuleRow,
  PeriodType,
  GradingSystem,
} from '../../../database/dbService';
import { EditableRuleSlot } from '../types/periods.types';
import { getDefaultRuleSlots } from '../constants/periods.constants';

export const usePeriodsSubjects = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  // Redux Selectors (State from Store)
  const periods = useAppSelector((state) => state.academic.periods);
  const periodSubjects = useAppSelector((state) => state.academic.subjects);
  const selectedPeriodId = useAppSelector((state) => state.academic.selectedPeriodId);

  // Derived selectedPeriod from Redux Store
  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId) || null;

  // Period Creation Form State
  const [newPeriodName, setNewPeriodName] = useState<string>('');
  const [newPeriodType, setNewPeriodType] = useState<PeriodType>('bimonthly');

  // Rules map for subjects
  const [subjectRulesMap, setSubjectRulesMap] = useState<Record<string, RewardRuleRow[]>>({});

  // Subject Form inside Period Detail
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [newGradingSystem, setNewGradingSystem] = useState<GradingSystem>('percentage');

  // Level 2: Subject Rewards Modal State
  const [editingSubject, setEditingSubject] = useState<SubjectRow | null>(null);
  const [ruleSlots, setRuleSlots] = useState<EditableRuleSlot[]>(
    getDefaultRuleSlots('percentage')
  );

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const pList = await dbService.getAllPeriods();
      // Dispatch to Redux Store via useAppDispatch
      dispatch(setPeriods(pList));
    } catch (e) {
      console.error('Error loading periods data:', e);
    }
  };

  const handleCreatePeriod = async () => {
    if (!newPeriodName.trim()) {
      Alert.alert(t('common.error'), t('login.errorEmptyFields'));
      return;
    }
    try {
      const created = await dbService.createPeriod(newPeriodName.trim(), newPeriodType, 'user');
      // Dispatch action to update Redux store
      dispatch(addPeriod(created));
      setNewPeriodName('');
      Alert.alert(
        t('periods.periodCreatedTitle'),
        t('periods.periodCreatedMsg', { name: created.name })
      );
    } catch (e) {
      console.error('Error creating period:', e);
      Alert.alert(t('common.error'), t('periods.periodCreatedError'));
    }
  };

  const handleDeletePeriod = (id: string, name: string) => {
    Alert.alert(
      t('periods.deletePeriodTitle'),
      t('periods.deletePeriodConfirm', { name }),
      [
        { text: t('profile.deleteAccountCancel'), style: 'cancel' },
        {
          text: t('rewards.deleteRule'),
          style: 'destructive',
          onPress: async () => {
            await dbService.deletePeriod(id);
            // Dispatch delete action to Redux store
            dispatch(deletePeriodAction(id));
            if (selectedPeriodId === id) {
              dispatch(setSelectedPeriodId(null));
              dispatch(setSubjects([]));
            }
          },
        },
      ]
    );
  };

  const openPeriodDetail = async (period: PeriodRow) => {
    // Set selected period in Redux store
    dispatch(setSelectedPeriodId(period.id));
    try {
      const subs = await dbService.getSubjectsForPeriod(period.id);
      // Dispatch subjects to Redux store
      dispatch(setSubjects(subs));

      const rulesMap: Record<string, RewardRuleRow[]> = {};
      for (const sb of subs) {
        rulesMap[sb.id] = await dbService.getRulesForSubject(sb.id);
      }
      setSubjectRulesMap(rulesMap);
    } catch (e) {
      console.error('Error loading subjects for period:', e);
    }
  };

  const closePeriodDetail = () => {
    dispatch(setSelectedPeriodId(null));
    dispatch(setSubjects([]));
  };

  const handleCreateSubjectInPeriod = async () => {
    if (!selectedPeriod) return;
    if (!newSubjectName.trim()) {
      Alert.alert(t('common.error'), t('periods.enterSubjectName'));
      return;
    }
    try {
      const created = await dbService.createSubject(
        newSubjectName.trim(),
        'user',
        selectedPeriod.id,
        newGradingSystem
      );
      // Dispatch action to update Redux store
      dispatch(addSubjectAction(created));
      setNewSubjectName('');
      Alert.alert(
        t('periods.subjectCreatedTitle'),
        t('periods.subjectCreatedMsg', { subject: created.name, period: selectedPeriod.name })
      );
    } catch (e) {
      console.error('Error creating subject in period:', e);
      Alert.alert(t('common.error'), t('periods.subjectCreatedError'));
    }
  };

  const handleDeleteSubjectInPeriod = (id: string, name: string) => {
    Alert.alert(
      t('periods.deleteSubjectTitle'),
      t('periods.deleteSubjectConfirm', { name }),
      [
        { text: t('profile.deleteAccountCancel'), style: 'cancel' },
        {
          text: t('rewards.deleteRule'),
          style: 'destructive',
          onPress: async () => {
            await dbService.deleteSubject(id);
            // Dispatch action to remove subject from Redux store
            dispatch(deleteSubjectAction(id));
          },
        },
      ]
    );
  };

  const openSubjectRewardsModal = async (subject: SubjectRow) => {
    setEditingSubject(subject);
    try {
      const existingRules = await dbService.getRulesForSubject(subject.id);
      const sys = subject.grading_system || 'percentage';

      if (existingRules.length > 0) {
        const mappedSlots: EditableRuleSlot[] = existingRules.map((r) => ({
          minGradeStr: r.min_grade.toString(),
          maxGradeStr: r.max_grade.toString(),
          rewardValue: r.reward_value,
          ruleType: r.rule_type as any,
        }));
        setRuleSlots(mappedSlots);
      } else {
        setRuleSlots(getDefaultRuleSlots(sys));
      }
    } catch (e) {
      console.error('Error loading subject rules:', e);
    }
  };

  const closeSubjectRewardsModal = () => {
    setEditingSubject(null);
  };

  const handleAddRuleSlot = () => {
    if (ruleSlots.length >= 4) {
      Alert.alert(t('periods.limitReachedTitle'), t('periods.limitReachedMsg'));
      return;
    }
    setRuleSlots((prev) => [
      ...prev,
      { minGradeStr: '0', maxGradeStr: '100', rewardValue: '', ruleType: 'minor_reward' },
    ]);
  };

  const handleRemoveRuleSlot = (index: number) => {
    setRuleSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const updateRuleSlot = (index: number, field: keyof EditableRuleSlot, value: string) => {
    setRuleSlots((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSaveSubjectRewards = async () => {
    if (!editingSubject) return;

    try {
      const formattedRules: Omit<RewardRuleRow, 'id'>[] = [];

      for (const slot of ruleSlots) {
        if (!slot.rewardValue.trim()) continue;

        let minNum = parseFloat(slot.minGradeStr) || 0;
        let maxNum = parseFloat(slot.maxGradeStr) || 100;

        if (editingSubject.grading_system === 'letters') {
          const letterToVal = (l: string) => {
            const clean = l.trim().toUpperCase();
            if (clean === 'F') return 0;
            if (clean === 'D') return 2;
            if (clean === 'C') return 3;
            if (clean === 'B') return 4;
            if (clean === 'A') return 5;
            return 0;
          };
          minNum = letterToVal(slot.minGradeStr);
          maxNum = letterToVal(slot.maxGradeStr);
        }

        const rType = slot.ruleType;
        const rRewardType = rType === 'punishment' ? 'console' : rType === 'major_reward' ? 'allowance' : 'points';

        formattedRules.push({
          subject_id: editingSubject.id,
          min_grade: minNum,
          max_grade: maxNum,
          rule_type: rType,
          reward_type: rRewardType,
          reward_value: slot.rewardValue.trim(),
        });
      }

      await dbService.saveSubjectRewardRulesBatch(editingSubject.id, formattedRules);

      const updatedRules = await dbService.getRulesForSubject(editingSubject.id);
      setSubjectRulesMap((prev) => ({ ...prev, [editingSubject.id]: updatedRules }));

      Alert.alert(
        t('periods.rewardsSavedTitle'),
        t('periods.rewardsSavedMsg', { name: editingSubject.name })
      );
      setEditingSubject(null);
    } catch (e: any) {
      console.error('Error saving subject rewards:', e);
      Alert.alert(t('common.error'), e?.message || t('periods.rewardsSavedError'));
    }
  };

  return {
    periods,
    newPeriodName,
    setNewPeriodName,
    newPeriodType,
    setNewPeriodType,
    selectedPeriod,
    periodSubjects,
    subjectRulesMap,
    newSubjectName,
    setNewSubjectName,
    newGradingSystem,
    setNewGradingSystem,
    editingSubject,
    ruleSlots,
    handleCreatePeriod,
    handleDeletePeriod,
    openPeriodDetail,
    closePeriodDetail,
    handleCreateSubjectInPeriod,
    handleDeleteSubjectInPeriod,
    openSubjectRewardsModal,
    closeSubjectRewardsModal,
    handleAddRuleSlot,
    handleRemoveRuleSlot,
    updateRuleSlot,
    handleSaveSubjectRewards,
  };
};
