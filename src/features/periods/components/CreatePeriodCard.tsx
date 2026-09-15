import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { theme } from '../../../config/theme';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { PeriodType } from '../../../database/dbService';
import { PERIOD_FREQUENCIES, getPeriodTypeLabel } from '../constants/periods.constants';
import { createStyles } from '../styles/PeriodsSubjectsScreen.styles';

interface CreatePeriodCardProps {
  newPeriodName: string;
  setNewPeriodName: (val: string) => void;
  newPeriodType: PeriodType;
  setNewPeriodType: (type: PeriodType) => void;
  onCreatePeriod: () => void;
}

export const CreatePeriodCard: React.FC<CreatePeriodCardProps> = ({
  newPeriodName,
  setNewPeriodName,
  newPeriodType,
  setNewPeriodType,
  onCreatePeriod,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{t('periods.createPeriodBtn')}</Text>
      <Input
        label={t('periods.periodName')}
        placeholder={t('periods.periodNamePlaceholder')}
        value={newPeriodName}
        onChangeText={setNewPeriodName}
      />

      <Text style={styles.fieldLabel}>{t('admin.periodTypeLabel')}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.freqScroll}>
        {PERIOD_FREQUENCIES.map((freq) => {
          const isActive = newPeriodType === freq.type;
          return (
            <TouchableOpacity
              key={freq.type}
              onPress={() => setNewPeriodType(freq.type)}
              style={[styles.freqChip, isActive && styles.freqChipActive]}
            >
              <Text style={[styles.freqChipText, isActive && styles.freqChipTextActive]}>
                {getPeriodTypeLabel(freq.type, t)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Button
        title={t('periods.savePeriodBtn')}
        onPress={onCreatePeriod}
        containerStyle={{ marginTop: theme.spacing.md }}
      />
    </View>
  );
};

export default CreatePeriodCard;
