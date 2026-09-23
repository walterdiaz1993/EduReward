import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../../config/theme';
import { PeriodRow } from '../../../database/dbService';

interface PeriodSelectorProps {
  periods: PeriodRow[];
  selectedPeriodId: string;
  setSelectedPeriodId: (id: string) => void;
  colors: any;
  t: any;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  periods,
  selectedPeriodId,
  setSelectedPeriodId,
  colors,
  t,
}) => {
  return (
    <View style={[styles.card, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{t('rewards.selectPeriod', 'Seleccionar Período')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodSelector}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p.id}
            onPress={() => setSelectedPeriodId(p.id)}
            style={[
              styles.periodChip,
              { borderColor: colors.border, backgroundColor: colors.background },
              selectedPeriodId === p.id && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
          >
            <Text
              style={[
                styles.periodChipText,
                { color: selectedPeriodId === p.id ? colors.white : colors.text },
              ]}
            >
              {p.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    ...theme.typography.h2,
    fontSize: 16,
    marginBottom: theme.spacing.sm,
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  periodChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.roundness.full,
    borderWidth: 1,
    marginRight: theme.spacing.xs,
  },
  periodChipText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
});
