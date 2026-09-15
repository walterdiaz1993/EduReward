import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { PeriodRow } from '../../../database/dbService';
import { getPeriodTypeLabel } from '../constants/periods.constants';
import { createStyles } from '../styles/PeriodsSubjectsScreen.styles';

interface PeriodCardItemProps {
  period: PeriodRow;
  onOpenDetail: (period: PeriodRow) => void;
  onDelete: (id: string, name: string) => void;
}

export const PeriodCardItem: React.FC<PeriodCardItemProps> = ({
  period,
  onOpenDetail,
  onDelete,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      onPress={() => onOpenDetail(period)}
      style={styles.periodCard}
      activeOpacity={0.8}
    >
      <View style={styles.periodCardHeader}>
        <View style={styles.periodTitleRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="calendar" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.periodCardTitle}>{period.name}</Text>
            <View style={styles.tagBadge}>
              <Text style={styles.tagBadgeText}>
                {getPeriodTypeLabel(period.period_type, t)}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => onDelete(period.id, period.name)}
          style={styles.deleteIconBtn}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardActionRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="book-outline" size={16} color={colors.primary} />
          <Text style={styles.cardActionText}>
            {t('periods.enterPeriodAction')}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
};

export default PeriodCardItem;
