import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../config/theme';
import { useTheme } from '../../../context/ThemeContext';
import { StudentWithGrades } from '../../../mocks/userMock';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { useTranslation } from 'react-i18next';
import dbService, { PeriodRow, SubjectRow } from '../../../database/dbService';
import { getPeriodTypeLabel, getGradingSystemLabel } from '../../periods/constants/periods.constants';

interface StudentConfigFormProps {
  student: StudentWithGrades;
  onSave: (id: string, updatedFields: Partial<StudentWithGrades>) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

interface PeriodWithSubjects {
  period: PeriodRow;
  subjects: SubjectRow[];
  selectedSubjectIds: string[];
}

export const StudentConfigForm: React.FC<StudentConfigFormProps> = ({
  student,
  onSave,
  onDelete,
  onClose,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [name, setName] = useState(student.fullName);
  const [periodDataList, setPeriodDataList] = useState<PeriodWithSubjects[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAllPeriodsAndAssignments();
  }, [student.id]);

  const loadAllPeriodsAndAssignments = async () => {
    setIsLoading(true);
    try {
      const allP = await dbService.getAllPeriods();
      const list: PeriodWithSubjects[] = [];

      for (const p of allP) {
        const subs = await dbService.getSubjectsForPeriod(p.id);
        const assignedRows = await dbService.getAssignmentsByPeriodAndStudent(p.id, student.id);
        const assignedIds = assignedRows.map((a) => a.subject_id);

        list.push({
          period: p,
          subjects: subs,
          selectedSubjectIds: assignedIds,
        });
      }

      setPeriodDataList(list);
    } catch (e) {
      console.error('Error loading student period assignments:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSubjectInPeriod = (periodId: string, subjectId: string) => {
    setPeriodDataList((prevList) =>
      prevList.map((item) => {
        if (item.period.id === periodId) {
          const exists = item.selectedSubjectIds.includes(subjectId);
          const updatedSubjectIds = exists
            ? item.selectedSubjectIds.filter((id) => id !== subjectId)
            : [...item.selectedSubjectIds, subjectId];
          return { ...item, selectedSubjectIds: updatedSubjectIds };
        }
        return item;
      })
    );
  };

  const handleSave = async () => {
    try {
      for (const item of periodDataList) {
        await dbService.saveStudentPeriodAndSubjectsBatch(
          student.id,
          item.period.id,
          item.selectedSubjectIds
        );
      }
    } catch (e) {
      console.error('Error saving student period assignments:', e);
    }

    onSave(student.id, {
      fullName: name,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t('admin.editStudentTitle')}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {onDelete && (
            <TouchableOpacity onPress={() => onDelete(student.id)} style={styles.closeBtn}>
              <Ionicons name="trash-outline" size={24} color={colors.error || '#ef4444'} />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Student Name Edit */}
      <Input
        label={t('admin.fullName')}
        value={name}
        onChangeText={setName}
        placeholder={t('admin.fullNamePlaceholder')}
      />

      {/* Period & Subject Relation Section */}
      <View style={[styles.sectionCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <View style={styles.sectionHeaderRow}>
          <View style={[styles.iconBox, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.sectionTitleText, { color: colors.text }]}>
              Relacionar Período Lectivo y Materias
            </Text>
            <Text style={[styles.sectionSubText, { color: colors.textSecondary }]}>
              Selecciona los períodos y marca las materias que cursará este estudiante.
            </Text>
          </View>
        </View>

        {isLoading ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('common.loading')}</Text>
        ) : periodDataList.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No hay períodos lectivos creados aún. Ve a la opción "Gestión de Períodos" en el menú principal para registrar uno.
          </Text>
        ) : (
          periodDataList.map((item) => {
            const freqLabel = getPeriodTypeLabel(item.period.period_type, t);
            const assignedCount = item.selectedSubjectIds.length;

            return (
              <View
                key={item.period.id}
                style={[
                  styles.periodContainerCard,
                  { backgroundColor: colors.card, borderColor: colors.glassBorder },
                  assignedCount > 0 && { borderColor: colors.primary },
                ]}
              >
                {/* Period Header */}
                <View style={styles.periodHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons
                      name={assignedCount > 0 ? 'checkmark-circle' : 'ellipse-outline'}
                      size={18}
                      color={assignedCount > 0 ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.periodNameText, { color: colors.text }]}>{item.period.name}</Text>
                  </View>

                  <View style={[styles.badge, { backgroundColor: colors.secondary + '20' }]}>
                    <Text style={[styles.badgeText, { color: colors.secondary }]}>{freqLabel}</Text>
                  </View>
                </View>

                {/* Subjects List for this Period */}
                <Text style={[styles.fieldSubLabel, { color: colors.textSecondary }]}>
                  Materias del Período ({assignedCount}/{item.subjects.length} asignadas):
                </Text>

                {item.subjects.length === 0 ? (
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Este período no tiene materias configuradas.
                  </Text>
                ) : (
                  <View style={styles.subjectsGrid}>
                    {item.subjects.map((sb) => {
                      const isChecked = item.selectedSubjectIds.includes(sb.id);
                      const sysLabel = getGradingSystemLabel(sb.grading_system, t);

                      return (
                        <TouchableOpacity
                          key={sb.id}
                          onPress={() => toggleSubjectInPeriod(item.period.id, sb.id)}
                          style={[
                            styles.subjectChip,
                            { borderColor: colors.border, backgroundColor: colors.background },
                            isChecked && { backgroundColor: colors.primary, borderColor: colors.primary },
                          ]}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name={isChecked ? 'checkmark-circle' : 'book-outline'}
                            size={16}
                            color={isChecked ? colors.white : colors.textSecondary}
                          />
                          <Text
                            style={[
                              styles.subjectChipText,
                              { color: isChecked ? colors.white : colors.text },
                            ]}
                          >
                            {sb.name} ({sysLabel})
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      <Button
        title={t('admin.saveBtn')}
        onPress={handleSave}
        containerStyle={styles.saveBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    fontSize: 18,
  },
  closeBtn: {
    padding: 4,
  },
  sectionCard: {
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitleText: {
    ...theme.typography.bodySemibold,
    fontSize: 15,
  },
  sectionSubText: {
    ...theme.typography.caption,
    fontSize: 11,
    marginTop: 2,
  },
  periodContainerCard: {
    borderRadius: theme.roundness.md,
    borderWidth: 1,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  periodHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  periodNameText: {
    ...theme.typography.bodySemibold,
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.roundness.full,
  },
  badgeText: {
    ...theme.typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  fieldSubLabel: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 6,
  },
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.roundness.full,
    borderWidth: 1,
    gap: 6,
  },
  subjectChipText: {
    ...theme.typography.caption,
    fontWeight: '600',
    fontSize: 11,
  },
  emptyText: {
    ...theme.typography.caption,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  saveBtn: {
    marginTop: theme.spacing.xs,
  },
});

export default StudentConfigForm;
