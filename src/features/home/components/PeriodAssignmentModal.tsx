import React, { useState, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { theme } from '../../../config/theme';
import { useTheme } from '../../../context/ThemeContext';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import dbService, { StudentRow, PeriodRow, SubjectRow, PeriodType } from '../../../database/dbService';

interface PeriodAssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PeriodAssignmentModal: React.FC<PeriodAssignmentModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const [periodName, setPeriodName] = useState<string>('');
  const [periodType, setPeriodType] = useState<PeriodType>('bimonthly');
  
  const [dbStudents, setDbStudents] = useState<StudentRow[]>([]);
  const [dbSubjects, setDbSubjects] = useState<SubjectRow[]>([]);
  
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  // Configurable Reward/Punishment Threshold Rules
  const [failReward, setFailReward] = useState<string>('');
  const [passReward, setPassReward] = useState<string>('');
  const [greatReward, setGreatReward] = useState<string>('');

  const [newSubjectName, setNewSubjectName] = useState<string>('');

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    try {
      const stList = await dbService.getAllStudents();
      const sbList = await dbService.getAllSubjects();

      setDbStudents(stList);
      setDbSubjects(sbList);

      if (stList.length > 0) {
        setSelectedStudentIds([stList[0].id]);
      }
      if (sbList.length > 0) {
        setSelectedSubjectIds(sbList.map((s) => s.id));
      }
    } catch (e) {
      console.error('Error loading SQLite data in modal:', e);
    }
  };

  const handleAddNewSubject = async () => {
    if (!newSubjectName.trim()) return;
    try {
      const created = await dbService.createSubject(newSubjectName.trim(), 'user');
      setDbSubjects((prev) => [...prev, created]);
      setSelectedSubjectIds((prev) => [...prev, created.id]);
      setNewSubjectName('');
    } catch (e) {
      console.error('Error creating subject in SQLite:', e);
    }
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

  const handleSavePeriodConfig = async () => {
    if (!periodName.trim()) {
      Alert.alert(t('common.error'), t('login.errorEmptyFields'));
      return;
    }

    if (selectedStudentIds.length === 0 || selectedSubjectIds.length === 0) {
      Alert.alert(t('common.error'), 'Debes seleccionar al menos un alumno y una materia.');
      return;
    }

    try {
      // 1. Create Period in SQLite
      const createdPeriod = await dbService.createPeriod(periodName.trim(), periodType, 'user');

      // 2. Assign subjects & students to period
      for (const stId of selectedStudentIds) {
        for (const sbId of selectedSubjectIds) {
          await dbService.assignSubjectToStudentInPeriod(createdPeriod.id, stId, sbId);
        }
      }

      // 3. Save grade range rules for selected subjects
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

      Alert.alert('¡Todo Listo!', 'Configuración de período, materias y reglas guardada con éxito.');
      onClose();
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error('Error saving period setup:', e);
      Alert.alert(t('common.error'), 'No se pudo guardar la información. Intenta de nuevo.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.card,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{t('periods.manageTitle')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Period Details */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('periods.createPeriodBtn')}</Text>
            <Input
              label={t('periods.periodName')}
              placeholder={t('periods.periodNamePlaceholder')}
              value={periodName}
              onChangeText={setPeriodName}
            />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('admin.periodTypeLabel')}</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                onPress={() => setPeriodType('bimonthly')}
                style={[
                  styles.toggleTab,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  periodType === 'bimonthly' && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.toggleTabText, { color: periodType === 'bimonthly' ? colors.primary : colors.textSecondary }]}>
                  {t('admin.bimonthly')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setPeriodType('semester')}
                style={[
                  styles.toggleTab,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  periodType === 'semester' && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.toggleTabText, { color: periodType === 'semester' ? colors.primary : colors.textSecondary }]}>
                  {t('admin.semester')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Select Children */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: theme.spacing.md }]}>
              {t('periods.selectChildren')}
            </Text>
            <View style={styles.chipRow}>
              {dbStudents.map((st) => {
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

            {/* Select Subjects & Add Custom */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: theme.spacing.md }]}>
              {t('periods.selectSubjects')}
            </Text>
            <View style={styles.chipRow}>
              {dbSubjects.map((sb) => {
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

            {/* Add Custom Subject inline */}
            <View style={styles.addSubjectRow}>
              <TextInput
                style={[styles.miniInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder="Crear nueva materia..."
                placeholderTextColor={colors.textSecondary}
                value={newSubjectName}
                onChangeText={setNewSubjectName}
              />
              <TouchableOpacity onPress={handleAddNewSubject} style={[styles.addSubjectBtn, { backgroundColor: colors.secondary }]}>
                <Ionicons name="add" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>

            {/* Grade Range Rules Setup */}
            <Text style={[styles.sectionTitle, { color: colors.text, marginTop: theme.spacing.md }]}>
              {t('periods.rangeTitle')}
            </Text>

            <Input
              label={t('periods.failRange')}
              placeholder="Ej. Sin consola por 1 semana / -20 pts"
              value={failReward}
              onChangeText={setFailReward}
            />

            <Input
              label={t('periods.passRange')}
              placeholder="Ej. +50 Puntos de recompensa / +30m consola"
              value={passReward}
              onChangeText={setPassReward}
            />

            <Input
              label={t('periods.greatRange')}
              placeholder="Ej. +150 Puntos / $10 Mesada"
              value={greatReward}
              onChangeText={setGreatReward}
            />

            <Button
              title={t('periods.saveConfigBtn')}
              onPress={handleSavePeriodConfig}
              containerStyle={{ marginTop: theme.spacing.md }}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: theme.roundness.lg,
    borderTopRightRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    maxHeight: '90%',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    fontSize: 18,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.bodySemibold,
    fontSize: 16,
    marginBottom: theme.spacing.xs,
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
  addSubjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  miniInput: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderRadius: theme.roundness.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 13,
  },
  addSubjectBtn: {
    width: 42,
    height: 42,
    borderRadius: theme.roundness.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PeriodAssignmentModal;
