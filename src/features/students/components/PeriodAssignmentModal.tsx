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
  const { colors } = useTheme();

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [periods, setPeriods] = useState<PeriodRow[]>([]);

  // Period Form State
  const [periodName, setPeriodName] = useState<string>('');
  const [periodType, setPeriodType] = useState<PeriodType>('bimonthly');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  // Selected subjects state for the period being created
  const [subjectInputs, setSubjectInputs] = useState<string[]>(['Matemáticas', 'Español']);
  const [newSubjectText, setNewSubjectText] = useState<string>('');

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    try {
      const stList = await dbService.getAllStudents();
      const pList = await dbService.getAllPeriods();
      setStudents(stList);
      setPeriods(pList);

      if (stList.length > 0) {
        setSelectedStudentIds([stList[0].id]);
      }
    } catch (e) {
      console.error('Error loading data in PeriodAssignmentModal:', e);
    }
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddSubjectInput = () => {
    if (!newSubjectText.trim()) return;
    if (subjectInputs.includes(newSubjectText.trim())) return;

    setSubjectInputs((prev) => [...prev, newSubjectText.trim()]);
    setNewSubjectText('');
  };

  const handleRemoveSubjectInput = (name: string) => {
    setSubjectInputs((prev) => prev.filter((s) => s !== name));
  };

  const handleSavePeriodAndAssignments = async () => {
    if (!periodName.trim()) {
      Alert.alert(t('common.error'), t('login.errorEmptyFields'));
      return;
    }

    if (selectedStudentIds.length === 0) {
      Alert.alert(t('common.error'), t('admin.selectStudent'));
      return;
    }

    if (subjectInputs.length === 0) {
      Alert.alert(t('common.error'), t('rewards.subjectSelector'));
      return;
    }

    try {
      // 1. Create Period
      const period = await dbService.createPeriod(periodName.trim(), periodType, 'user');

      // 2. Create Subjects for this Period
      const createdSubjects: SubjectRow[] = [];
      for (const sbName of subjectInputs) {
        const sb = await dbService.createSubject(sbName, 'user', period.id, 'percentage');
        createdSubjects.push(sb);
      }

      // 3. Assign each Student to all Subjects in this Period
      for (const studentId of selectedStudentIds) {
        for (const sb of createdSubjects) {
          await dbService.assignSubjectToStudentInPeriod(period.id, studentId, sb.id);
        }
      }

      Alert.alert(
        t('periods.periodCreatedTitle'),
        t('periods.periodCreatedMsg', { name: period.name })
      );

      // Reset Form & Close
      setPeriodName('');
      onSuccess?.();
      onClose();
    } catch (e: any) {
      console.error('Error saving period configuration:', e);
      Alert.alert(t('common.error'), e?.message || 'Error guardando configuración.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.modalContainer, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>{t('periods.manageTitle')}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {t('periods.periodCardHint')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Step 1: Period Name & Type */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                1. {t('periods.createPeriodBtn')}
              </Text>
              <Input
                label={t('periods.periodName')}
                placeholder={t('periods.periodNamePlaceholder')}
                value={periodName}
                onChangeText={setPeriodName}
              />

              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                {t('admin.periodTypeLabel')}
              </Text>

              <View style={styles.periodTypeRow}>
                <TouchableOpacity
                  onPress={() => setPeriodType('bimonthly')}
                  style={[
                    styles.typeChip,
                    { borderColor: colors.border, backgroundColor: colors.background },
                    periodType === 'bimonthly' && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.typeChipText, { color: periodType === 'bimonthly' ? colors.white : colors.text }]}>
                    {t('admin.bimonthly')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setPeriodType('semester')}
                  style={[
                    styles.typeChip,
                    { borderColor: colors.border, backgroundColor: colors.background },
                    periodType === 'semester' && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.typeChipText, { color: periodType === 'semester' ? colors.white : colors.text }]}>
                    {t('admin.semester')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Step 2: Select Children / Students */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                2. {t('periods.selectChildren')}
              </Text>
              {students.length === 0 ? (
                <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                  {t('student.noGrades')}
                </Text>
              ) : (
                <View style={styles.chipRow}>
                  {students.map((st) => {
                    const isSelected = selectedStudentIds.includes(st.id);
                    return (
                      <TouchableOpacity
                        key={st.id}
                        onPress={() => toggleStudentSelection(st.id)}
                        style={[
                          styles.studentChip,
                          { borderColor: colors.border, backgroundColor: colors.background },
                          isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                        ]}
                      >
                        <Ionicons
                          name={isSelected ? 'checkmark-circle' : 'person-outline'}
                          size={16}
                          color={isSelected ? colors.white : colors.textSecondary}
                        />
                        <Text style={[styles.studentChipText, { color: isSelected ? colors.white : colors.text }]}>
                          {st.full_name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Step 3: Subjects Setup */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                3. {t('periods.selectSubjects')}
              </Text>

              <View style={styles.addSubjectRow}>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={[styles.subjectInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                    placeholder={t('admin.matematicas') + ' / Robótica...'}
                    placeholderTextColor={colors.textSecondary}
                    value={newSubjectText}
                    onChangeText={setNewSubjectText}
                  />
                </View>
                <TouchableOpacity
                  onPress={handleAddSubjectInput}
                  style={[styles.addSubjectBtn, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="add" size={20} color={colors.white} />
                </TouchableOpacity>
              </View>

              <View style={styles.chipRow}>
                {subjectInputs.map((sbName) => (
                  <View key={sbName} style={[styles.subjectTag, { backgroundColor: colors.secondary + '20', borderColor: colors.secondary }]}>
                    <Ionicons name="book-outline" size={14} color={colors.secondary} />
                    <Text style={[styles.subjectTagText, { color: colors.secondary }]}>{sbName}</Text>
                    <TouchableOpacity onPress={() => handleRemoveSubjectInput(sbName)}>
                      <Ionicons name="close-circle" size={16} color={colors.secondary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* Submit */}
            <Button
              title={t('admin.saveBtn')}
              onPress={handleSavePeriodAndAssignments}
              containerStyle={{ marginTop: theme.spacing.md }}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: theme.roundness.lg,
    borderTopRightRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    maxHeight: '90%',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    fontSize: 18,
  },
  subtitle: {
    ...theme.typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.bodySemibold,
    fontSize: 15,
    marginBottom: theme.spacing.sm,
  },
  fieldLabel: {
    ...theme.typography.caption,
    fontWeight: '700',
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    fontSize: 10,
  },
  periodTypeRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  typeChip: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.roundness.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeChipText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  studentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.roundness.full,
    borderWidth: 1,
    gap: 6,
  },
  studentChipText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  emptyHint: {
    ...theme.typography.caption,
    fontStyle: 'italic',
  },
  addSubjectRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    alignItems: 'center',
  },
  subjectInput: {
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
  subjectTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
    borderRadius: theme.roundness.md,
    borderWidth: 1,
    gap: 6,
  },
  subjectTagText: {
    ...theme.typography.caption,
    fontWeight: '700',
    fontSize: 12,
  },
});

export default PeriodAssignmentModal;
