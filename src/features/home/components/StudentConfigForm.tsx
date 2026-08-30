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
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <Input
        label={t('admin.fullName')}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      <Text style={styles.label}>{t('admin.periodTypeLabel')}</Text>
      <View style={styles.toggleRow}>
        <TouchableOpacity
          onPress={() => setPeriodType('bimonthly')}
          style={[
            styles.toggleTab,
            periodType === 'bimonthly' ? styles.toggleTabActive : {},
          ]}
        >
          <Text
            style={[
              styles.toggleTabText,
              periodType === 'bimonthly' ? styles.toggleTabTextActive : {},
            ]}
          >
            {t('admin.bimonthly')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPeriodType('semester')}
          style={[
            styles.toggleTab,
            periodType === 'semester' ? styles.toggleTabActive : {},
          ]}
        >
          <Text
            style={[
              styles.toggleTabText,
              periodType === 'semester' ? styles.toggleTabTextActive : {},
            ]}
          >
            {t('admin.semester')}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>{t('admin.gradeSystem')}</Text>
      <View style={styles.toggleRow}>
        {(['percentage', 'decimal', 'letters'] as const).map((sys) => (
          <TouchableOpacity
            key={sys}
            onPress={() => setGradingSystem(sys)}
            style={[
              styles.toggleTab,
              gradingSystem === sys ? styles.toggleTabActive : {},
            ]}
          >
            <Text
              style={[
                styles.toggleTabText,
                gradingSystem === sys ? styles.toggleTabTextActive : {},
              ]}
            >
              {t(`admin.${sys}`)}
            </Text>
          </TouchableOpacity>
        ))}
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
    backgroundColor: theme.colors.card,
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    width: '100%',
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    fontSize: 18,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  label: {
    ...theme.typography.bodySemibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  toggleTab: {
    flex: 1,
    height: 44,
    borderRadius: theme.roundness.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  },
  toggleTabTextActive: {
    color: theme.colors.primary,
  },
  saveBtn: {
    marginTop: theme.spacing.md,
  },
});
export default StudentConfigForm;
