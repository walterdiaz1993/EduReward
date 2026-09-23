import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../config/theme';
import { PeriodWheelWithOptions } from '../../../database/dbService';

interface WheelCardProps {
  wheel: PeriodWheelWithOptions;
  colors: any;
  t: any;
  rangeInput: { title: string; min: string; max: string; icon: string; color: string };
  setRangeInputs: React.Dispatch<React.SetStateAction<Record<string, { title: string; min: string; max: string; icon: string; color: string }>>>;
  savingWheelId: string | null;
  handleSaveRanges: (wheelId: string) => void;
  newOptionInput: string;
  setNewOptionInputs: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleAddOption: (wheelId: string) => void;
  handleDeleteOption: (optionId: string) => void;
  handleDeleteWheel: (wheelId: string) => void;
}

export const WheelCard: React.FC<WheelCardProps> = ({
  wheel,
  colors,
  t,
  rangeInput,
  setRangeInputs,
  savingWheelId,
  handleSaveRanges,
  newOptionInput,
  setNewOptionInputs,
  handleAddOption,
  handleDeleteOption,
  handleDeleteWheel,
}) => {
  const wheelColor = wheel.color || colors.primary;

  return (
    <View
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
            {t('rewards.currentRange', { min: wheel.min_grade, max: wheel.max_grade, defaultValue: `Rango actual: ${wheel.min_grade} - ${wheel.max_grade}` })}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDeleteWheel(wheel.id)} style={{ padding: 4 }}>
          <Ionicons name="trash-outline" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Editable Range Section */}
      <View style={[styles.rangeBox, { backgroundColor: colors.background + '80', borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>{t('rewards.editRangeTitle', 'EDITAR CONFIGURACIÓN')}</Text>
        
        {/* Title Input */}
        <View style={{ marginBottom: theme.spacing.sm }}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('rewards.wheelNameLabel', 'Nombre de la Ruleta')}</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
            ]}
            value={rangeInput.title}
            onChangeText={(txt) =>
              setRangeInputs((prev) => ({
                ...prev,
                [wheel.id]: { ...prev[wheel.id], title: txt },
              }))
            }
            placeholder="Ej. Ruleta de Castigos"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Icon Selector */}
        <View style={{ marginBottom: theme.spacing.sm }}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('rewards.wheelIconLabel', 'Icono de la Ruleta')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', paddingBottom: 5 }}>
            {[
              { name: 'alert-circle', color: '#ef4444' }, // Red (Consecuencias/Castigos)
              { name: 'sad-outline', color: '#f87171' }, // Light Red (Menor Castigo)
              { name: 'aperture', color: '#3b82f6' }, // Blue (Default/Normal)
              { name: 'bicycle-outline', color: '#6366f1' }, // Indigo (Actividad)
              { name: 'game-controller-outline', color: '#8b5cf6' }, // Purple (Consola/Juegos)
              { name: 'ribbon-outline', color: '#f59e0b' }, // Orange (Intermedia)
              { name: 'happy-outline', color: '#10b981' }, // Green (Buena nota)
              { name: 'gift-outline', color: '#ec4899' }, // Pink (Premio menor)
              { name: 'star-outline', color: '#fbbf24' }, // Yellow (Estrella/Premio medio)
              { name: 'trophy', color: '#eab308' } // Gold (Premio Mayor/Dorada)
            ].map((iconObj) => (
              <TouchableOpacity
                key={iconObj.name}
                onPress={() =>
                  setRangeInputs((prev) => ({
                    ...prev,
                    [wheel.id]: { ...prev[wheel.id], icon: iconObj.name, color: iconObj.color },
                  }))
                }
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: rangeInput.icon === iconObj.name ? iconObj.color + '30' : colors.card,
                  borderWidth: 1,
                  borderColor: rangeInput.icon === iconObj.name ? iconObj.color : colors.border,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 8,
                }}
              >
                <Ionicons name={iconObj.name as any} size={20} color={rangeInput.icon === iconObj.name ? iconObj.color : colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.rangeInputsRow}>
          <View style={styles.rangeField}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('rewards.minLabel', 'Mínimo')}</Text>
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
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{t('rewards.maxLabel', 'Máximo')}</Text>
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
            <Text style={styles.saveRangeBtnText}>{t('admin.saveBtn', 'Guardar')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Wheel Options / Prizes List */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: theme.spacing.md }]}>
        {t('rewards.wheelOptionsTitle', { count: wheel.options.length, defaultValue: `Premios (${wheel.options.length})` })}
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
          {t('rewards.noOptions', 'Sin premios agregados a esta ruleta.')}
        </Text>
      )}

      {/* Add New Option Input */}
      <View style={styles.addOptionRow}>
        <TextInput
          style={[
            styles.input,
            { flex: 1, backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
          ]}
          placeholder={t('rewards.addOptionPlaceholder', 'Ej. 1h de Consola / Salida al Cine')}
          placeholderTextColor={colors.textSecondary}
          value={newOptionInput}
          onChangeText={(txt) =>
            setNewOptionInputs((prev) => ({ ...prev, [wheel.id]: txt }))
          }
        />
        <TouchableOpacity
          onPress={() => handleAddOption(wheel.id)}
          style={[styles.addOptBtn, { backgroundColor: colors.secondary }]}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.addOptBtnText}>{t('common.add', 'Agregar')}</Text>
        </TouchableOpacity>
      </View>
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
