import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../config/theme';
import { StudentWithGrades } from '../../../mocks/userMock';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { useTranslation } from 'react-i18next';

interface StudentConfigFormProps {
  student: StudentWithGrades;
  onSave: (id: string, updatedFields: Partial<StudentWithGrades>) => void;
  onClose: () => void;
}

export const StudentConfigForm: React.FC<StudentConfigFormProps> = ({
  student,
  onSave,
  onClose,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(student.fullName);
  const [periodType, setPeriodType] = useState<'bimonthly' | 'semester'>(student.periodType || 'semester');
  const [gradingSystem, setGradingSystem] = useState<'percentage' | 'decimal' | 'letters'>(student.gradingSystem || 'percentage');

  const handleSave = () => {
    onSave(student.id, {
      fullName: name,
      periodType,
      gradingSystem,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('admin.editStudentTitle')}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <Input
        label={t('admin.fullName')}
        value={name}
        onChangeText={setName}
        placeholder={t('admin.fullNamePlaceholder')}
      />

      <Text style={styles.label}>{t('admin.periodTypeLabel')}</Text>
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={[
            styles.optionBtn,
            periodType === 'bimonthly' && styles.optionBtnActive,
          ]}
          onPress={() => setPeriodType('bimonthly')}
        >
          <Text
            style={[
              styles.optionText,
              periodType === 'bimonthly' && styles.optionTextActive,
            ]}
          >
            {t('admin.bimonthly')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionBtn,
            periodType === 'semester' && styles.optionBtnActive,
          ]}
          onPress={() => setPeriodType('semester')}
        >
          <Text
            style={[
              styles.optionText,
              periodType === 'semester' && styles.optionTextActive,
            ]}
          >
            {t('admin.semester')}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>{t('admin.gradeSystem')}</Text>
      <View style={styles.optionsColumn}>
        <TouchableOpacity
          style={[
            styles.optionBtn,
            gradingSystem === 'percentage' && styles.optionBtnActive,
          ]}
          onPress={() => setGradingSystem('percentage')}
        >
          <Text
            style={[
              styles.optionText,
              gradingSystem === 'percentage' && styles.optionTextActive,
            ]}
          >
            {t('admin.base100')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionBtn,
            gradingSystem === 'decimal' && styles.optionBtnActive,
          ]}
          onPress={() => setGradingSystem('decimal')}
        >
          <Text
            style={[
              styles.optionText,
              gradingSystem === 'decimal' && styles.optionTextActive,
            ]}
          >
            {t('admin.base10')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionBtn,
            gradingSystem === 'letters' && styles.optionBtnActive,
          ]}
          onPress={() => setGradingSystem('letters')}
        >
          <Text
            style={[
              styles.optionText,
              gradingSystem === 'letters' && styles.optionTextActive,
            ]}
          >
            {t('admin.alphabetical')}
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        title={t('admin.saveBtn')}
        onPress={handleSave}
        containerStyle={styles.saveBtn}
      />
    </View>
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
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    fontSize: 18,
  },
  closeBtn: {
    padding: 4,
  },
  label: {
    ...theme.typography.caption,
    fontWeight: '700',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  optionsColumn: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.roundness.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
  },
  optionBtnActive: {
    backgroundColor: theme.colors.primary + '20',
    borderColor: theme.colors.primary,
  },
  optionText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  optionTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  saveBtn: {
    marginTop: theme.spacing.md,
  },
});

export default StudentConfigForm;
