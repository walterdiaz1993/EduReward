import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../config/theme';
import Button from '../../../components/Button';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import dbService, {
  PeriodRow,
  PeriodWheelWithOptions,
} from '../../../database/dbService';

interface RewardsManagerProps {
  onBack: () => void;
}

export const RewardsManager: React.FC<RewardsManagerProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const [periods, setPeriods] = useState<PeriodRow[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [wheels, setWheels] = useState<PeriodWheelWithOptions[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Range inputs state map: wheelId -> { min: string, max: string }
  const [rangeInputs, setRangeInputs] = useState<
    Record<string, { min: string; max: string }>
  >({});

  // New option inputs state map: wheelId -> string
  const [newOptionInputs, setNewOptionInputs] = useState<Record<string, string>>({});

  const [savingWheelId, setSavingWheelId] = useState<string | null>(null);

  useEffect(() => {
    loadPeriods();
  }, []);

  useEffect(() => {
    if (selectedPeriodId) {
      loadWheelsForPeriod(selectedPeriodId);
    }
  }, [selectedPeriodId]);

  const loadPeriods = async () => {
    setLoading(true);
    try {
      let fetchedPeriods = await dbService.getAllPeriods();
      if (fetchedPeriods.length === 0) {
        // Auto-create a default period if none exists
        const defaultP = await dbService.createPeriod('Primer Semestre', 'semester', 'admin');
        fetchedPeriods = [defaultP];
      }
      setPeriods(fetchedPeriods);
      if (fetchedPeriods.length > 0) {
        setSelectedPeriodId(fetchedPeriods[0].id);
      }
    } catch (e) {
      console.error('Error loading periods for rewards manager:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadWheelsForPeriod = async (periodId: string) => {
    try {
      const fetchedWheels = await dbService.getPeriodWheels(periodId);
      setWheels(fetchedWheels);

      // Populate local range inputs
      const initialRanges: Record<string, { min: string; max: string }> = {};
      const initialNewOpts: Record<string, string> = {};
      fetchedWheels.forEach((w) => {
        initialRanges[w.id] = {
          min: w.min_grade.toString(),
          max: w.max_grade.toString(),
        };
        initialNewOpts[w.id] = '';
      });
      setRangeInputs(initialRanges);
      setNewOptionInputs(initialNewOpts);
    } catch (e) {
      console.error('Error loading wheels for period:', e);
    }
  };

  const handleSaveRanges = async (wheelId: string) => {
    const inputs = rangeInputs[wheelId];
    if (!inputs) return;

    const minNum = parseFloat(inputs.min);
    const maxNum = parseFloat(inputs.max);

    if (isNaN(minNum) || isNaN(maxNum) || minNum < 0 || maxNum < minNum) {
      Alert.alert(
        t('rewards.invalidRangeTitle'),
        t('rewards.invalidRangeMsg')
      );
      return;
    }

    setSavingWheelId(wheelId);
    try {
      await dbService.updatePeriodWheelRange(wheelId, minNum, maxNum);
      if (selectedPeriodId) {
        await loadWheelsForPeriod(selectedPeriodId);
      }
      Alert.alert(t('common.success') || 'Éxito', t('rewards.rangeUpdated'));
    } catch (e: any) {
      Alert.alert(t('common.error') || 'Error', e?.message || 'No se pudo guardar el rango.');
    } finally {
      setSavingWheelId(null);
    }
  };

  const handleAddOption = async (wheelId: string) => {
    const text = (newOptionInputs[wheelId] || '').trim();
    if (!text) {
      Alert.alert(t('rewards.textRequiredTitle'), t('rewards.textRequiredMsg'));
      return;
    }

    try {
      await dbService.addWheelOption(wheelId, text);
      setNewOptionInputs((prev) => ({ ...prev, [wheelId]: '' }));
      if (selectedPeriodId) {
        await loadWheelsForPeriod(selectedPeriodId);
      }
    } catch (e: any) {
      Alert.alert(t('common.error') || 'Error', e?.message || 'No se pudo agregar la opción.');
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    try {
      await dbService.deleteWheelOption(optionId);
      if (selectedPeriodId) {
        await loadWheelsForPeriod(selectedPeriodId);
      }
    } catch (e: any) {
      Alert.alert(t('common.error') || 'Error', e?.message || 'No se pudo eliminar la opción.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={colors.primary} />
        <Text style={[styles.backButtonText, { color: colors.primary }]}>{t('common.backBtn')}</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.text }]}>{t('rewards.managerTitle')}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {t('rewards.managerSubtitle')}
      </Text>

      {/* Period Selector Card */}
      <View style={[styles.card, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('rewards.selectPeriod')}</Text>
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

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 30 }} />
      ) : (
        wheels.map((wheel) => {
          const wheelColor = wheel.color || colors.primary;
          const rangeInput = rangeInputs[wheel.id] || { min: '', max: '' };

          return (
            <View
              key={wheel.id}
              style={[
                styles.card,
                { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder },
              ]}
            >
              {/* Wheel Header */}
              <View style={styles.wheelHeader}>
                <View style={[styles.iconBox, { backgroundColor: wheelColor + '20' }]}>
                  <Ionicons name={(wheel.icon as any) || 'aperture'} size={24} color={wheelColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.wheelTitle, { color: colors.text }]}>{wheel.title}</Text>
                  <Text style={[styles.wheelSubtitle, { color: colors.textSecondary }]}>
                    {t('rewards.currentRange', { min: wheel.min_grade, max: wheel.max_grade })}
                  </Text>
                </View>
              </View>

              {/* Editable Range Section */}
              <View style={[styles.rangeBox, { backgroundColor: colors.background + '80', borderColor: colors.border }]}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('rewards.editRangeTitle')}</Text>
                <View style={styles.rangeInputsRow}>
                  <View style={styles.rangeField}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('rewards.minLabel')}</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
                      ]}
                      value={rangeInput.min}
                      onChangeText={(txt) =>
                        setRangeInputs((prev) => ({
                          ...prev,
                          [wheel.id]: { ...prev[wheel.id], min: txt },
                        }))
                      }
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  <Text style={[styles.rangeSeparator, { color: colors.textSecondary }]}>-</Text>

                  <View style={styles.rangeField}>
                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('rewards.maxLabel')}</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
                      ]}
                      value={rangeInput.max}
                      onChangeText={(txt) =>
                        setRangeInputs((prev) => ({
                          ...prev,
                          [wheel.id]: { ...prev[wheel.id], max: txt },
                        }))
                      }
                      keyboardType="numeric"
                      placeholder="10"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => handleSaveRanges(wheel.id)}
                    disabled={savingWheelId === wheel.id}
                    style={[styles.saveRangeBtn, { backgroundColor: colors.primary }]}
                  >
                    <Text style={styles.saveRangeBtnText}>{t('admin.saveBtn') || 'Guardar'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Wheel Options / Prizes List */}
              <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: theme.spacing.md }]}>
                {t('rewards.wheelOptionsTitle', { count: wheel.options.length })}
              </Text>

              {wheel.options.length > 0 ? (
                wheel.options.map((opt) => (
                  <View
                    key={opt.id}
                    style={[styles.optionItem, { borderBottomColor: colors.border }]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                      <Ionicons name="gift-outline" size={16} color={wheelColor} />
                      <Text style={[styles.optionText, { color: colors.text }]}>{opt.option_text}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteOption(opt.id)}
                      style={styles.deleteOptBtn}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {t('rewards.noOptions')}
                </Text>
              )}

              {/* Add New Option Input */}
              <View style={styles.addOptionRow}>
                <TextInput
                  style={[
                    styles.input,
                    { flex: 1, backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
                  ]}
                  placeholder={t('rewards.addOptionPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={newOptionInputs[wheel.id] || ''}
                  onChangeText={(txt) =>
                    setNewOptionInputs((prev) => ({ ...prev, [wheel.id]: txt }))
                  }
                />
                <TouchableOpacity
                  onPress={() => handleAddOption(wheel.id)}
                  style={[styles.addOptBtn, { backgroundColor: colors.secondary }]}
                >
                  <Ionicons name="add" size={20} color="#ffffff" />
                  <Text style={styles.addOptBtnText}>{t('common.add') || 'Agregar'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 110,
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
    fontSize: 22,
    marginBottom: 2,
  },
  subtitle: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.lg,
    lineHeight: 18,
  },
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
  wheelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelTitle: {
    ...theme.typography.bodySemibold,
    fontSize: 16,
  },
  wheelSubtitle: {
    ...theme.typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
  rangeBox: {
    borderRadius: theme.roundness.md,
    borderWidth: 1,
    padding: theme.spacing.md,
  },
  sectionLabel: {
    ...theme.typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: theme.spacing.xs,
  },
  rangeInputsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  rangeField: {
    flex: 1,
  },
  inputLabel: {
    ...theme.typography.caption,
    fontSize: 10,
    marginBottom: 4,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: theme.roundness.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: 13,
  },
  rangeSeparator: {
    paddingBottom: 10,
    fontSize: 16,
    fontWeight: '700',
  },
  saveRangeBtn: {
    height: 40,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.roundness.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveRangeBtnText: {
    ...theme.typography.caption,
    color: '#ffffff',
    fontWeight: '700',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
  },
  optionText: {
    ...theme.typography.body,
    fontSize: 13,
  },
  deleteOptBtn: {
    padding: theme.spacing.xs,
  },
  emptyText: {
    ...theme.typography.caption,
    fontStyle: 'italic',
    paddingVertical: theme.spacing.sm,
  },
  addOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  addOptBtn: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.roundness.md,
    gap: 4,
  },
  addOptBtnText: {
    ...theme.typography.caption,
    color: '#ffffff',
    fontWeight: '700',
  },
});

export default RewardsManager;
