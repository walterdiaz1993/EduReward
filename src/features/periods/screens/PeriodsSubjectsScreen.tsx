import React, { useState, useEffect } from 'react';
import {
  Alert,
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
import dbService, { StudentRow, PeriodRow, SubjectRow } from '../../../database/dbService';

interface PeriodsSubjectsScreenProps {
  onBack: () => void;
}

export const PeriodsSubjectsScreen: React.FC<PeriodsSubjectsScreenProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<'periods' | 'subjects' | 'assignments'>('periods');

  // State lists from SQLite
  const [periods, setPeriods] = useState<PeriodRow[]>([]);
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);

  // Period Form
  const [newPeriodName, setNewPeriodName] = useState<string>('');
  const [newPeriodType, setNewPeriodType] = useState<'bimonthly' | 'semester'>('bimonthly');

  // Subject Form
  const [newSubjectName, setNewSubjectName] = useState<string>('');

  // Assignment & Rules Form
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [failReward, setFailReward] = useState<string>('-20% pts / Sin consola');
  const [passReward, setPassReward] = useState<string>('+50 pts / +30m consola');
  const [greatReward, setGreatReward] = useState<string>('+150 pts / $10 mesada');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const pList = await dbService.getAllPeriods();
      const sList = await dbService.getAllSubjects();
      const stList = await dbService.getAllStudents();

      setPeriods(pList);
      setSubjects(sList);
      setStudents(stList);

      if (pList.length > 0) setSelectedPeriodId(pList[0].id);
      if (stList.length > 0) setSelectedStudentIds([stList[0].id]);
      if (sList.length > 0) setSelectedSubjectIds(sList.map((s) => s.id));
    } catch (e) {
      console.error('Error loading SQLite data in PeriodsSubjectsScreen:', e);
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
      Alert.alert('✨ ¡Período Creado!', `El período "${created.name}" se guardó exitosamente.`);
    } catch (e) {
      console.error('Error creating period:', e);
      Alert.alert(t('common.error'), 'No se pudo guardar el período.');
    }
  };

  const handleDeletePeriod = (id: string, name: string) => {
    Alert.alert('Eliminar Período', `¿Deseas eliminar el período "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await dbService.deletePeriod(id);
          setPeriods((prev) => prev.filter((p) => p.id !== id));
        },
      },
    ]);
  };

  const handleCreateSubject = async () => {
    if (!newSubjectName.trim()) {
      Alert.alert(t('common.error'), t('login.errorEmptyFields'));
      return;
    }
    try {
      const created = await dbService.createSubject(newSubjectName.trim(), 'user');
      setSubjects((prev) => [...prev, created]);
      setSelectedSubjectIds((prev) => [...prev, created.id]);
      setNewSubjectName('');
      Alert.alert('📚 ¡Materia Creada!', `La materia "${created.name}" se guardó correctamente.`);
    } catch (e) {
      console.error('Error creating subject:', e);
      Alert.alert(t('common.error'), 'No se pudo guardar la materia.');
    }
  };

  const handleDeleteSubject = (id: string, name: string) => {
    Alert.alert('Eliminar Materia', `¿Deseas eliminar la materia "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await dbService.deleteSubject(id);
          setSubjects((prev) => prev.filter((s) => s.id !== id));
        },
      },
    ]);
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSubjectSelection = (id: string) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSaveAssignmentsAndRules = async () => {
    if (!selectedPeriodId) {
      Alert.alert(t('common.error'), 'Debes seleccionar un período.');
      return;
    }
    if (selectedStudentIds.length === 0 || selectedSubjectIds.length === 0) {
      Alert.alert(t('common.error'), 'Debes seleccionar al menos un alumno y una materia.');
      return;
    }

    try {
      for (const stId of selectedStudentIds) {
        for (const sbId of selectedSubjectIds) {
          await dbService.assignSubjectToStudentInPeriod(selectedPeriodId, stId, sbId);
        }
      }

      for (const sbId of selectedSubjectIds) {
        // 0-59 Punishment
        await dbService.saveRewardRule({
          subject_id: sbId,
          min_grade: 0,
          max_grade: 59.99,
          rule_type: 'punishment',
          reward_type: 'console',
          reward_value: failReward,
        });

        // 60-89 Minor reward
        await dbService.saveRewardRule({
          subject_id: sbId,
          min_grade: 60,
          max_grade: 89.99,
          rule_type: 'minor_reward',
          reward_type: 'points',
          reward_value: passReward,
        });

        // 90-100 Major reward
        await dbService.saveRewardRule({
          subject_id: sbId,
          min_grade: 90,
          max_grade: 100,
          rule_type: 'major_reward',
          reward_type: 'allowance',
          reward_value: greatReward,
        });
      }

      Alert.alert('🎯 ¡Asignación Guardada!', 'Se han guardado las materias y las reglas de recompensas con éxito.');
    } catch (e) {
      console.error('Error saving assignments:', e);
      Alert.alert(t('common.error'), 'Error guardando asignaciones.');
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

        {/* Top Segmented Tab Switcher */}
        <View style={[styles.tabBar, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
          <TouchableOpacity
            onPress={() => setActiveTab('periods')}
            style={[styles.tabItem, activeTab === 'periods' && { backgroundColor: colors.primary, borderRadius: theme.roundness.md }]}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={18} color={activeTab === 'periods' ? colors.white : colors.textSecondary} />
            <Text style={[styles.tabText, { color: activeTab === 'periods' ? colors.white : colors.textSecondary }]}>Períodos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('subjects')}
            style={[styles.tabItem, activeTab === 'subjects' && { backgroundColor: colors.primary, borderRadius: theme.roundness.md }]}
            activeOpacity={0.8}
          >
            <Ionicons name="book-outline" size={18} color={activeTab === 'subjects' ? colors.white : colors.textSecondary} />
            <Text style={[styles.tabText, { color: activeTab === 'subjects' ? colors.white : colors.textSecondary }]}>Materias</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('assignments')}
            style={[styles.tabItem, activeTab === 'assignments' && { backgroundColor: colors.primary, borderRadius: theme.roundness.md }]}
            activeOpacity={0.8}
          >
            <Ionicons name="git-network-outline" size={18} color={activeTab === 'assignments' ? colors.white : colors.textSecondary} />
            <Text style={[styles.tabText, { color: activeTab === 'assignments' ? colors.white : colors.textSecondary }]}>Asignación</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* TAB 1: PERIODS */}
          {activeTab === 'periods' && (
            <View>
              <View style={[styles.card, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t('periods.createPeriodBtn')}</Text>
                <Input
                  label={t('periods.periodName')}
                  placeholder={t('periods.periodNamePlaceholder')}
                  value={newPeriodName}
                  onChangeText={setNewPeriodName}
                />

                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('admin.periodTypeLabel')}</Text>
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    onPress={() => setNewPeriodType('bimonthly')}
                    style={[
                      styles.toggleTab,
                      { borderColor: colors.border, backgroundColor: colors.background },
                      newPeriodType === 'bimonthly' && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                    ]}
                  >
                    <Text style={[styles.toggleTabText, { color: newPeriodType === 'bimonthly' ? colors.primary : colors.textSecondary }]}>
                      {t('admin.bimonthly')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setNewPeriodType('semester')}
                    style={[
                      styles.toggleTab,
                      { borderColor: colors.border, backgroundColor: colors.background },
                      newPeriodType === 'semester' && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                    ]}
                  >
                    <Text style={[styles.toggleTabText, { color: newPeriodType === 'semester' ? colors.primary : colors.textSecondary }]}>
                      {t('admin.semester')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Button title="Guardar Período" onPress={handleCreatePeriod} />
              </View>

              <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>Períodos Registrados ({periods.length})</Text>
              {periods.map((p) => (
                <View key={p.id} style={[styles.listItemCard, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
                  <View style={styles.listItemText}>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>{p.name}</Text>
                    <Text style={[styles.itemSub, { color: colors.textSecondary }]}>
                      Tipo: {p.period_type === 'bimonthly' ? t('admin.bimonthly') : t('admin.semester')}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeletePeriod(p.id, p.name)} style={styles.deleteIconBtn}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* TAB 2: SUBJECTS */}
          {activeTab === 'subjects' && (
            <View>
              <View style={[styles.card, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>Crear Nueva Materia</Text>
                <Input
                  label="Nombre de la Materia"
                  placeholder="Ej. Robótica, Inglés, Química"
                  value={newSubjectName}
                  onChangeText={setNewSubjectName}
                />
                <Button title="Agregar Materia" onPress={handleCreateSubject} />
              </View>

              <Text style={[styles.sectionHeaderTitle, { color: colors.text }]}>Materias Disponibles ({subjects.length})</Text>
              <View style={styles.gridContainer}>
                {subjects.map((sb) => (
                  <View key={sb.id} style={[styles.gridCard, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
                    <View style={[styles.subjectIconBox, { backgroundColor: colors.secondary + '20' }]}>
                      <Ionicons name="book" size={22} color={colors.secondary} />
                    </View>
                    <Text style={[styles.gridCardTitle, { color: colors.text }]}>{sb.name}</Text>
                    <TouchableOpacity onPress={() => handleDeleteSubject(sb.id, sb.name)} style={styles.deleteIconBtn}>
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 3: ASSIGNMENTS & RULES */}
          {activeTab === 'assignments' && (
            <View>
              <View style={[styles.card, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{t('periods.assignSubjectTitle')}</Text>

                {/* Period Selector */}
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Seleccionar Período</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                  {periods.map((p) => (
                    <TouchableOpacity
                      key={p.id}
                      onPress={() => setSelectedPeriodId(p.id)}
                      style={[
                        styles.chip,
                        { backgroundColor: colors.background, borderColor: colors.border },
                        selectedPeriodId === p.id && { backgroundColor: colors.primary, borderColor: colors.primary },
                      ]}
                    >
                      <Ionicons name={selectedPeriodId === p.id ? 'checkmark-circle' : 'calendar-outline'} size={16} color={selectedPeriodId === p.id ? colors.white : colors.textSecondary} />
                      <Text style={[styles.chipText, { color: selectedPeriodId === p.id ? colors.white : colors.text }]}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Students Selector */}
                <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: theme.spacing.md }]}>
                  {t('periods.selectChildren')}
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

                {/* Subjects Selector */}
                <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: theme.spacing.md }]}>
                  {t('periods.selectSubjects')}
                </Text>
                <View style={styles.chipRow}>
                  {subjects.map((sb) => {
                    const selected = selectedSubjectIds.includes(sb.id);
                    return (
                      <TouchableOpacity
                        key={sb.id}
                        onPress={() => toggleSubjectSelection(sb.id)}
                        style={[
                          styles.chip,
                          { backgroundColor: colors.background, borderColor: colors.border },
                          selected && { backgroundColor: colors.secondary, borderColor: colors.secondary },
                        ]}
                      >
                        <Ionicons name={selected ? 'checkmark-circle' : 'book-outline'} size={16} color={selected ? colors.white : colors.textSecondary} />
                        <Text style={[styles.chipText, { color: selected ? colors.white : colors.text }]}>{sb.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Range Rules Setup */}
                <Text style={[styles.cardTitle, { color: colors.text, marginTop: theme.spacing.lg }]}>
                  {t('periods.rangeTitle')}
                </Text>

                <Input
                  label={t('periods.failRange')}
                  value={failReward}
                  onChangeText={setFailReward}
                />

                <Input
                  label={t('periods.passRange')}
                  value={passReward}
                  onChangeText={setPassReward}
                />

                <Input
                  label={t('periods.greatRange')}
                  value={greatReward}
                  onChangeText={setGreatReward}
                />

                <Button
                  title={t('periods.saveConfigBtn')}
                  onPress={handleSaveAssignmentsAndRules}
                  containerStyle={{ marginTop: theme.spacing.md }}
                />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
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
  },
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
  },
  title: {
    ...theme.typography.h1,
    fontSize: 24,
    marginBottom: theme.spacing.md,
  },
  tabBar: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: theme.roundness.md,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  tabText: {
    ...theme.typography.caption,
    fontWeight: '700',
    fontSize: 12,
  },
  card: {
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
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
    marginBottom: theme.spacing.md,
  },
  fieldLabel: {
    ...theme.typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 10,
    marginBottom: theme.spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  toggleTab: {
    flex: 1,
    height: 40,
    borderRadius: theme.roundness.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleTabText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  sectionHeaderTitle: {
    ...theme.typography.h2,
    fontSize: 18,
    marginBottom: theme.spacing.sm,
  },
  listItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.roundness.md,
    borderWidth: 1,
    marginBottom: theme.spacing.sm,
  },
  listItemText: {
    flex: 1,
  },
  itemTitle: {
    ...theme.typography.bodySemibold,
    fontSize: 16,
  },
  itemSub: {
    ...theme.typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  deleteIconBtn: {
    padding: theme.spacing.xs,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  gridCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderRadius: theme.roundness.md,
    borderWidth: 1,
  },
  subjectIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridCardTitle: {
    ...theme.typography.caption,
    fontWeight: '700',
    flex: 1,
    marginHorizontal: 8,
  },
  chipScroll: {
    marginBottom: theme.spacing.md,
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
    marginRight: 6,
    gap: 6,
  },
  chipText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
});

export default PeriodsSubjectsScreen;
