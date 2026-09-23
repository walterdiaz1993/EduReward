import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../config/theme';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import { useRewardsManager } from '../hooks/useRewardsManager';
import { PeriodSelector } from '../components/PeriodSelector';
import { WheelCard } from '../components/WheelCard';

export const RewardsManager: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const {
    periods,
    selectedPeriodId,
    setSelectedPeriodId,
    wheels,
    loading,
    rangeInputs,
    setRangeInputs,
    newOptionInputs,
    setNewOptionInputs,
    savingWheelId,
    handleSaveRanges,
    handleAddOption,
    handleDeleteOption,
    handleCreateWheel,
    handleDeleteWheel
  } = useRewardsManager();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>{t('rewards.managerTitle', 'Configuración de Recompensas')}</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {t('rewards.managerSubtitle', 'Ajusta los rangos de notas y define los premios para la ruleta.')}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addWheelBtn, { backgroundColor: colors.primary }]}
          onPress={handleCreateWheel}
          disabled={!selectedPeriodId || loading}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addWheelBtnText}>{t('rewards.addWheelBtn', 'Añadir Ruleta')}</Text>
        </TouchableOpacity>
      </View>

      {/* Period Selector Card */}
      <PeriodSelector
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        setSelectedPeriodId={setSelectedPeriodId}
        colors={colors}
        t={t}
      />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 30 }} />
      ) : (
        wheels.map((wheel) => (
          <WheelCard
            key={wheel.id}
            wheel={wheel}
            colors={colors}
            t={t}
            rangeInput={rangeInputs[wheel.id] || { min: '', max: '' }}
            setRangeInputs={setRangeInputs}
            savingWheelId={savingWheelId}
            handleSaveRanges={handleSaveRanges}
            newOptionInput={newOptionInputs[wheel.id] || ''}
            setNewOptionInputs={setNewOptionInputs}
            handleAddOption={handleAddOption}
            handleDeleteOption={handleDeleteOption}
            handleDeleteWheel={handleDeleteWheel}
          />
        ))
      )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 110,
    paddingTop: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  addWheelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.roundness.md,
    gap: 4,
  },
  addWheelBtnText: {
    ...theme.typography.caption,
    color: '#fff',
    fontWeight: '700',
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
});

export default RewardsManager;
