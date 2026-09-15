import React, { useState, useEffect } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { theme } from '../../../config/theme';
import { useTheme } from '../../../context/ThemeContext';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import dbService, {
  StudentRow,
  PeriodRow,
  SubjectRow,
  RewardRuleRow,
  PeriodType,
  GradingSystem,
} from '../../../database/dbService';

interface PeriodsSubjectsScreenProps {
  onBack: () => void;
}

interface EditableRuleSlot {
  minGradeStr: string;
  maxGradeStr: string;
  rewardValue: string;
  ruleType: 'punishment' | 'minor_reward' | 'major_reward';
}

export const PeriodsSubjectsScreen: React.FC<PeriodsSubjectsScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  // Periods & Students State
  const [periods, setPeriods] = useState<PeriodRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);

  // Period Form
  const [newPeriodName, setNewPeriodName] = useState<string>('');
  const [newPeriodType, setNewPeriodType] = useState<PeriodType>('bimonthly');

  // Level 1: Period Detail Modal
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodRow | null>(null);
  const [periodSubjects, setPeriodSubjects] = useState<SubjectRow[]>([]);
  const [subjectRulesMap, setSubjectRulesMap] = useState<Record<string, RewardRuleRow[]>>({});
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Subject Form within Period
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [newGradingSystem, setNewGradingSystem] = useState<GradingSystem>('percentage');

  // Level 2: Subject Rewards Modal
  const [editingSubject, setEditingSubject] = useState<SubjectRow | null>(null);
  const [ruleSlots, setRuleSlots] = useState<EditableRuleSlot[]>([
    { minGradeStr: '0', maxGradeStr: '59', rewardValue: '', ruleType: 'punishment' },
    { minGradeStr: '60', maxGradeStr: '89', rewardValue: '', ruleType: 'minor_reward' },
    { minGradeStr: '90', maxGradeStr: '100', rewardValue: '', ruleType: 'major_reward' },
  ]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const pList = await dbService.getAllPeriods();
      const stList = await dbService.getAllStudents();
      setPeriods(pList);
      setStudents(stList);
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
      setPeriods((prev) => [...prev, created]);
      setNewPeriodName('');
      Alert.alert('¡Período Creado!', `El período "${created.name}" se guardó exitosamente.`);
    } catch (e) {
      console.error('Error creating period:', e);
      Alert.alert(t('common.error'), 'No se pudo guardar el período.');
    }
  };

  const handleDeletePeriod = (id: string, name: string) => {
    Alert.alert('Eliminar Período', `¿Deseas eliminar el período "${name}" y sus materias asociadas?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await dbService.deletePeriod(id);
          setPeriods((prev) => prev.filter((p) => p.id !== id));
          if (selectedPeriod?.id === id) {
            setSelectedPeriod(null);
          }
        },
      },
    ]);
  };

  // Open Level 1: Period Detail
  const openPeriodDetail = async (period: PeriodRow) => {
    setSelectedPeriod(period);
    try {
      const subs = await dbService.getSubjectsForPeriod(period.id);
      setPeriodSubjects(subs);

      // Load rules count map
      const rulesMap: Record<string, RewardRuleRow[]> = {};
      for (const sb of subs) {
        rulesMap[sb.id] = await dbService.getRulesForSubject(sb.id);
      }
      setSubjectRulesMap(rulesMap);

      if (students.length > 0) {
        setSelectedStudentIds([students[0].id]);
      }
    } catch (e) {
      console.error('Error loading subjects for period:', e);
    }
  };

  const handleCreateSubjectInPeriod = async () => {
    if (!selectedPeriod) return;
    if (!newSubjectName.trim()) {
      Alert.alert(t('common.error'), 'Ingresa el nombre de la materia.');
      return;
    }
    try {
      const created = await dbService.createSubject(
        newSubjectName.trim(),
        'user',
        selectedPeriod.id,
        newGradingSystem
      );
      setPeriodSubjects((prev) => [...prev, created]);
      setNewSubjectName('');
      Alert.alert('¡Materia Creada!', `Materia "${created.name}" agregada a ${selectedPeriod.name}.`);
    } catch (e) {
      console.error('Error creating subject in period:', e);
      Alert.alert(t('common.error'), 'No se pudo agregar la materia.');
    }
  };

  const handleDeleteSubjectInPeriod = (id: string, name: string) => {
    Alert.alert('Eliminar Materia', `¿Deseas eliminar la materia "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await dbService.deleteSubject(id);
          setPeriodSubjects((prev) => prev.filter((s) => s.id !== id));
        },
      },
    ]);
  };

  // Open Level 2: Subject Rewards Modal
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
        // Default initial slots based on grading system
        if (sys === 'decimal') {
          setRuleSlots([
            { minGradeStr: '0', maxGradeStr: '5.9', rewardValue: '', ruleType: 'punishment' },
            { minGradeStr: '6', maxGradeStr: '8.9', rewardValue: '', ruleType: 'minor_reward' },
            { minGradeStr: '9', maxGradeStr: '10', rewardValue: '', ruleType: 'major_reward' },
          ]);
        } else if (sys === 'letters') {
          setRuleSlots([
            { minGradeStr: 'F', maxGradeStr: 'D', rewardValue: '', ruleType: 'punishment' },
            { minGradeStr: 'C', maxGradeStr: 'B', rewardValue: '', ruleType: 'minor_reward' },
            { minGradeStr: 'A', maxGradeStr: 'A', rewardValue: '', ruleType: 'major_reward' },
          ]);
        } else {
          setRuleSlots([
            { minGradeStr: '0', maxGradeStr: '59', rewardValue: '', ruleType: 'punishment' },
            { minGradeStr: '60', maxGradeStr: '89', rewardValue: '', ruleType: 'minor_reward' },
            { minGradeStr: '90', maxGradeStr: '100', rewardValue: '', ruleType: 'major_reward' },
          ]);
        }
      }
    } catch (e) {
      console.error('Error loading subject rules:', e);
    }
  };

  const handleAddRuleSlot = () => {
    if (ruleSlots.length >= 4) {
      Alert.alert('Límite alcanzado', 'Puedes configurar máximo 4 premios o reglas por materia.');
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

        // Letter grade conversion if applicable
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

      // Refresh rules map
      const updatedRules = await dbService.getRulesForSubject(editingSubject.id);
      setSubjectRulesMap((prev) => ({ ...prev, [editingSubject.id]: updatedRules }));

      Alert.alert('¡Premios Guardados!', `Premios y castigos guardados con éxito para ${editingSubject.name}.`);
      setEditingSubject(null);
    } catch (e: any) {
      console.error('Error saving subject rewards:', e);
      Alert.alert(t('common.error'), e?.message || 'No se pudieron guardar los premios.');
    }
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSavePeriodAssignments = async () => {
    if (!selectedPeriod) return;
    if (periodSubjects.length === 0) {
      Alert.alert(t('common.error'), 'Crea al menos una materia para este período.');
      return;
    }
    if (selectedStudentIds.length === 0) {
      Alert.alert(t('common.error'), 'Selecciona al menos un estudiante o hijo.');
      return;
    }

    try {
      for (const stId of selectedStudentIds) {
        for (const sb of periodSubjects) {
          await dbService.assignSubjectToStudentInPeriod(selectedPeriod.id, stId, sb.id);
        }
      }
      Alert.alert('¡Período Guardado!', `Asignación de alumnos y materias guardada con éxito para ${selectedPeriod.name}.`);
      setSelectedPeriod(null);
    } catch (e: any) {
      console.error('Error saving assignments:', e);
      Alert.alert(t('common.error'), 'Error guardando asignación.');
    }
  };

  const getPeriodTypeLabel = (type: PeriodType) => {
    switch (type) {
      case 'monthly':
        return 'Mensual';
      case 'bimonthly':
        return 'Bimestral';
      case 'quarterly':
        return 'Trimestral';
      case 'semester':
        return 'Semestral (6 Meses)';
      case 'annual':
        return 'Anual';
      default:
        return type;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={styles.container}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={colors.primary} />
          <Text style={[styles.backButtonText, { color: colors.primary }]}>{t('common.backBtn')}</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>{t('periods.manageTitle')}</Text>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* CREATE PERIOD FORM */}
          <View style={[styles.card, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('periods.createPeriodBtn')}</Text>
            <Input
              label={t('periods.periodName')}
              placeholder={t('periods.periodNamePlaceholder')}
              value={newPeriodName}
              onChangeText={setNewPeriodName}
            />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('admin.periodTypeLabel')}</Text>

            {/* 5 Period Frequency Buttons */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.freqScroll}>
              {(['monthly', 'bimonthly', 'quarterly', 'semester', 'annual'] as PeriodType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setNewPeriodType(type)}
                  style={[
                    styles.freqChip,
                    { borderColor: colors.border, backgroundColor: colors.background },
                    newPeriodType === type && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.freqChipText, { color: newPeriodType === type ? colors.white : colors.text }]}>
                    {getPeriodTypeLabel(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Button title="Guardar Período" onPress={handleCreatePeriod} containerStyle={{ marginTop: theme.spacing.md }} />
          </View>

          {/* REGISTERED PERIODS CARDS */}
          <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>
            Períodos Registrados ({periods.length})
          </Text>
          <Text style={[styles.sectionSubTitle, { color: colors.textSecondary }]}>
            Haz clic en cualquier período para crear sus materias y configurar sus premios por rango.
          </Text>

          {periods.map((period) => (
            <TouchableOpacity
              key={period.id}
              onPress={() => openPeriodDetail(period)}
              style={[
                styles.periodCard,
                { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder },
              ]}
              activeOpacity={0.8}
            >
              <View style={styles.periodCardHeader}>
                <View style={styles.periodTitleRow}>
                  <View style={[styles.iconBadge, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="calendar" size={20} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.periodCardTitle, { color: colors.text }]}>{period.name}</Text>
                    <View style={[styles.tagBadge, { backgroundColor: colors.secondary + '20' }]}>
                      <Text style={[styles.tagBadgeText, { color: colors.secondary }]}>
                        {getPeriodTypeLabel(period.period_type)}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleDeletePeriod(period.id, period.name)}
                  style={styles.deleteIconBtn}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>

              <View style={[styles.cardActionRow, { borderTopColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="book-outline" size={16} color={colors.primary} />
                  <Text style={[styles.cardActionText, { color: colors.primary }]}>
                    Entrar al Período (Crear Materias y Premios)
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.primary} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LEVEL 1: PERIOD DETAIL MODAL */}
      {selectedPeriod && (
        <Modal visible={true} animationType="slide" transparent={true} onRequestClose={() => setSelectedPeriod(null)}>
          <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
            <View style={[styles.modalContainer, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{selectedPeriod.name}</Text>
                  <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                    Frecuencia: {getPeriodTypeLabel(selectedPeriod.period_type)}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedPeriod(null)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
                {/* FORM TO ADD SUBJECT IN THIS PERIOD */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Crear Materia para este Período</Text>
                <Input
                  label="Nombre de la Materia"
                  placeholder="Ej. Matemáticas, Robótica, Ciencias"
                  value={newSubjectName}
                  onChangeText={setNewSubjectName}
                />

                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Sistema de Calificación de la Materia</Text>
                <View style={styles.systemToggleRow}>
                  <TouchableOpacity
                    onPress={() => setNewGradingSystem('percentage')}
                    style={[
                      styles.systemTab,
                      { borderColor: colors.border, backgroundColor: colors.background },
                      newGradingSystem === 'percentage' && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                    ]}
                  >
                    <Text style={[styles.systemTabText, { color: newGradingSystem === 'percentage' ? colors.primary : colors.text }]}>
                      Base 100 (0-100%)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setNewGradingSystem('decimal')}
                    style={[
                      styles.systemTab,
                      { borderColor: colors.border, backgroundColor: colors.background },
                      newGradingSystem === 'decimal' && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                    ]}
                  >
                    <Text style={[styles.systemTabText, { color: newGradingSystem === 'decimal' ? colors.primary : colors.text }]}>
                      Base 10 (0-10)
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setNewGradingSystem('letters')}
                    style={[
                      styles.systemTab,
                      { borderColor: colors.border, backgroundColor: colors.background },
                      newGradingSystem === 'letters' && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                    ]}
                  >
                    <Text style={[styles.systemTabText, { color: newGradingSystem === 'letters' ? colors.primary : colors.text }]}>
                      Alfabético (A-F)
                    </Text>
                  </TouchableOpacity>
                </View>

                <Button title="Agregar Materia" onPress={handleCreateSubjectInPeriod} containerStyle={{ marginBottom: theme.spacing.lg }} />

                {/* LIST OF SUBJECT CARDS FOR THIS PERIOD */}
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: theme.spacing.xs }]}>
                  2. Cards de Materias de este Período ({periodSubjects.length})
                </Text>
                <Text style={[styles.sectionSubTitle, { color: colors.textSecondary, marginBottom: theme.spacing.md }]}>
                  Cada materia tiene su propia tarjeta. Presiona "Gestionar Premios" para asignar sus premios por rango.
                </Text>

                {periodSubjects.map((sb) => {
                  const sysLabel =
                    sb.grading_system === 'decimal'
                      ? 'Base 10 (0-10)'
                      : sb.grading_system === 'letters'
                      ? 'Alfabético (A-F)'
                      : 'Base 100 (0-100%)';
                  const configuredRulesCount = (subjectRulesMap[sb.id] || []).length;

                  return (
                    <View
                      key={sb.id}
                      style={[
                        styles.subjectCard,
                        { backgroundColor: colors.background, borderColor: colors.border },
                      ]}
                    >
                      <View style={styles.subjectCardHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <View style={[styles.iconBox, { backgroundColor: colors.secondary + '20' }]}>
                            <Ionicons name="book" size={20} color={colors.secondary} />
                          </View>
                          <View>
                            <Text style={[styles.subjectCardTitle, { color: colors.text }]}>{sb.name}</Text>
                            <View style={styles.subjectBadgeRow}>
                              <View style={[styles.miniBadge, { backgroundColor: colors.primary + '15' }]}>
                                <Text style={[styles.miniBadgeText, { color: colors.primary }]}>{sysLabel}</Text>
                              </View>
                              <View style={[styles.miniBadge, { backgroundColor: colors.secondary + '15' }]}>
                                <Text style={[styles.miniBadgeText, { color: colors.secondary }]}>
                                  {configuredRulesCount} / 4 Premios
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>

                        <TouchableOpacity onPress={() => handleDeleteSubjectInPeriod(sb.id, sb.name)}>
                          <Ionicons name="trash-outline" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </View>

                      {/* Manage Rewards Button on Subject Card */}
                      <TouchableOpacity
                        onPress={() => openSubjectRewardsModal(sb)}
                        style={[styles.manageRewardsBtn, { backgroundColor: colors.secondary }]}
                      >
                        <Ionicons name="gift-outline" size={16} color={colors.white} />
                        <Text style={styles.manageRewardsBtnText}>Gestionar Premios de esta Materia</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}

                {/* ASSIGN STUDENTS TO PERIOD */}
                <Text style={[styles.sectionTitle, { color: colors.text, marginTop: theme.spacing.lg }]}>
                  3. Asignar Hijos / Alumnos a este Período
                </Text>
                <View style={styles.chipRow}>
                  {students.map((st) => {
                    const selected = selectedStudentIds.includes(st.id);
                    return (
                      <TouchableOpacity
                        key={st.id}
                        onPress={() => toggleStudentSelection(st.id)}
                        style={[
                          styles.chip,
                          { backgroundColor: colors.background, borderColor: colors.border },
                          selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                        ]}
                      >
                        <Ionicons name={selected ? 'checkmark-circle' : 'person-outline'} size={16} color={selected ? colors.white : colors.textSecondary} />
                        <Text style={[styles.chipText, { color: selected ? colors.white : colors.text }]}>{st.full_name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Button title="Guardar Configuración del Período" onPress={handleSavePeriodAssignments} containerStyle={{ marginTop: theme.spacing.lg }} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* LEVEL 2: DEDICATED SUBJECT REWARDS MODAL */}
      {editingSubject && (
        <Modal visible={true} animationType="slide" transparent={true} onRequestClose={() => setEditingSubject(null)}>
          <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
            <View style={[styles.modalContainer, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Premios: {editingSubject.name}</Text>
                  <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                    Sistema:{' '}
                    {editingSubject.grading_system === 'decimal'
                      ? 'Base 10 (0 - 10)'
                      : editingSubject.grading_system === 'letters'
                      ? 'Alfabético (A - F)'
                      : 'Base 100 (0 - 100%)'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setEditingSubject(null)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionSubTitle, { color: colors.textSecondary, marginBottom: theme.spacing.md }]}>
                  Define de qué rango a qué rango aplica cada premio o castigo. (Máximo 4 por materia).
                </Text>

                {ruleSlots.map((slot, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.ruleSlotCard,
                      { backgroundColor: colors.background, borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.ruleSlotHeader}>
                      <Text style={[styles.ruleSlotTitle, { color: colors.text }]}>Premio / Regla #{idx + 1}</Text>
                      {ruleSlots.length > 1 && (
                        <TouchableOpacity onPress={() => handleRemoveRuleSlot(idx)}>
                          <Ionicons name="trash-outline" size={18} color={colors.error} />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Type Selector */}
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Tipo de Regla</Text>
                    <View style={styles.ruleTypeRow}>
                      <TouchableOpacity
                        onPress={() => updateRuleSlot(idx, 'ruleType', 'punishment')}
                        style={[
                          styles.ruleTypeTab,
                          { borderColor: colors.border, backgroundColor: colors.card },
                          slot.ruleType === 'punishment' && { backgroundColor: colors.error + '20', borderColor: colors.error },
                        ]}
                      >
                        <Text style={[styles.ruleTypeTabText, { color: slot.ruleType === 'punishment' ? colors.error : colors.textSecondary }]}>
                          Castigo
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => updateRuleSlot(idx, 'ruleType', 'minor_reward')}
                        style={[
                          styles.ruleTypeTab,
                          { borderColor: colors.border, backgroundColor: colors.card },
                          slot.ruleType === 'minor_reward' && { backgroundColor: colors.secondary + '20', borderColor: colors.secondary },
                        ]}
                      >
                        <Text style={[styles.ruleTypeTabText, { color: slot.ruleType === 'minor_reward' ? colors.secondary : colors.textSecondary }]}>
                          Premio Menor
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => updateRuleSlot(idx, 'ruleType', 'major_reward')}
                        style={[
                          styles.ruleTypeTab,
                          { borderColor: colors.border, backgroundColor: colors.card },
                          slot.ruleType === 'major_reward' && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                        ]}
                      >
                        <Text style={[styles.ruleTypeTabText, { color: slot.ruleType === 'major_reward' ? colors.primary : colors.textSecondary }]}>
                          Premio Mayor
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Min & Max Range Custom Inputs */}
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: theme.spacing.xs }]}>
                      Rango de Calificación (Mínimo a Máximo)
                    </Text>
                    <View style={styles.rangeInputsRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.rangeInputSub, { color: colors.textSecondary }]}>Desde (Mínimo)</Text>
                        <TextInput
                          style={[styles.rangeInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                          placeholder={editingSubject.grading_system === 'letters' ? 'F' : '0'}
                          placeholderTextColor={colors.textSecondary}
                          value={slot.minGradeStr}
                          onChangeText={(val) => updateRuleSlot(idx, 'minGradeStr', val)}
                        />
                      </View>

                      <Text style={[styles.rangeToText, { color: colors.textSecondary }]}>a</Text>

                      <View style={{ flex: 1 }}>
                        <Text style={[styles.rangeInputSub, { color: colors.textSecondary }]}>Hasta (Máximo)</Text>
                        <TextInput
                          style={[styles.rangeInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                          placeholder={editingSubject.grading_system === 'letters' ? 'A' : '100'}
                          placeholderTextColor={colors.textSecondary}
                          value={slot.maxGradeStr}
                          onChangeText={(val) => updateRuleSlot(idx, 'maxGradeStr', val)}
                        />
                      </View>
                    </View>

                    {/* Reward Description Input */}
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: theme.spacing.xs }]}>
                      Premio / Consecuencia Personalizada
                    </Text>
                    <TextInput
                      style={[styles.rewardDescInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                      placeholder={
                        slot.ruleType === 'punishment'
                          ? 'Ej. Sin consola por 1 semana / -20 pts'
                          : slot.ruleType === 'major_reward'
                          ? 'Ej. +150 Puntos / $10 Mesada / Salida al cine'
                          : 'Ej. +50 Puntos de recompensa / +30m consola'
                      }
                      placeholderTextColor={colors.textSecondary}
                      value={slot.rewardValue}
                      onChangeText={(val) => updateRuleSlot(idx, 'rewardValue', val)}
                    />
                  </View>
                ))}

                {ruleSlots.length < 4 && (
                  <TouchableOpacity
                    onPress={handleAddRuleSlot}
                    style={[styles.addSlotBtn, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                    <Text style={[styles.addSlotBtnText, { color: colors.primary }]}>
                      Agregar Otro Premio ({ruleSlots.length}/4)
                    </Text>
                  </TouchableOpacity>
                )}

                <Button
                  title="Guardar Premios de esta Materia"
                  onPress={handleSaveSubjectRewards}
                  containerStyle={{ marginTop: theme.spacing.lg }}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
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
    marginBottom: theme.spacing.md,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  card: {
    padding: theme.spacing.md,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    ...theme.typography.h2,
    fontSize: 18,
    marginBottom: theme.spacing.sm,
  },
  fieldLabel: {
    ...theme.typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 10,
    marginBottom: theme.spacing.xs,
  },
  freqScroll: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  freqChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.roundness.full,
    borderWidth: 1,
    marginRight: theme.spacing.xs,
  },
  freqChipText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  sectionHeaderTitle: {
    ...theme.typography.h2,
    fontSize: 18,
    marginBottom: 2,
  },
  sectionSubTitle: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.md,
  },
  periodCard: {
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  periodCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  periodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodCardTitle: {
    ...theme.typography.h2,
    fontSize: 16,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.roundness.full,
    marginTop: 2,
  },
  tagBadgeText: {
    ...theme.typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  deleteIconBtn: {
    padding: 4,
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    marginTop: theme.spacing.xs,
  },
  cardActionText: {
    ...theme.typography.caption,
    fontWeight: '700',
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: theme.roundness.lg,
    borderTopRightRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    maxHeight: '92%',
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    ...theme.typography.h2,
    fontSize: 18,
  },
  modalSub: {
    ...theme.typography.caption,
  },
  modalScrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  sectionTitle: {
    ...theme.typography.bodySemibold,
    fontSize: 15,
    marginBottom: theme.spacing.xs,
  },
  systemToggleRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  systemTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.roundness.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  systemTabText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '700',
  },

  /* Subject Card Styles */
  subjectCard: {
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  subjectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectCardTitle: {
    ...theme.typography.bodySemibold,
    fontSize: 15,
  },
  subjectBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  miniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.roundness.full,
  },
  miniBadgeText: {
    ...theme.typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  manageRewardsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: theme.roundness.md,
    marginTop: theme.spacing.xs,
  },
  manageRewardsBtnText: {
    ...theme.typography.caption,
    color: '#ffffff',
    fontWeight: '700',
  },

  /* Rule Slot Card Styles */
  ruleSlotCard: {
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  ruleSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  ruleSlotTitle: {
    ...theme.typography.bodySemibold,
    fontSize: 14,
  },
  ruleTypeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: theme.spacing.xs,
  },
  ruleTypeTab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: theme.roundness.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  ruleTypeTabText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  rangeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.xs,
  },
  rangeInputSub: {
    ...theme.typography.caption,
    fontSize: 10,
    marginBottom: 2,
  },
  rangeInput: {
    height: 38,
    borderWidth: 1,
    borderRadius: theme.roundness.sm,
    paddingHorizontal: 8,
    fontSize: 13,
  },
  rangeToText: {
    ...theme.typography.caption,
    fontWeight: '700',
    marginTop: 14,
  },
  rewardDescInput: {
    height: 42,
    borderWidth: 1,
    borderRadius: theme.roundness.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 13,
  },
  addSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: theme.spacing.md,
  },
  addSlotBtnText: {
    ...theme.typography.caption,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.roundness.full,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
});

export default PeriodsSubjectsScreen;
