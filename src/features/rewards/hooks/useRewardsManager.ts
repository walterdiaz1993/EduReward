import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import dbService, { PeriodRow, PeriodWheelWithOptions } from '../../../database/dbService';
import { useTranslation } from 'react-i18next';

export const useRewardsManager = () => {
  const { t } = useTranslation();
  
  const [periods, setPeriods] = useState<PeriodRow[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('');
  const [wheels, setWheels] = useState<PeriodWheelWithOptions[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Range inputs state map: wheelId -> { title: string, min: string, max: string, icon: string, color: string }
  const [rangeInputs, setRangeInputs] = useState<Record<string, { title: string; min: string; max: string; icon: string; color: string }>>({});

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
      const initialRanges: Record<string, { title: string; min: string; max: string; icon: string; color: string }> = {};
      const initialNewOpts: Record<string, string> = {};
      fetchedWheels.forEach((w) => {
        initialRanges[w.id] = {
          title: w.title || '',
          min: w.min_grade.toString(),
          max: w.max_grade.toString(),
          icon: w.icon || 'aperture',
          color: w.color || '#3b82f6',
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
    const newTitle = inputs.title.trim();
    const newIcon = inputs.icon || 'aperture';
    const newColor = inputs.color || '#3b82f6';

    if (!newTitle) {
      Alert.alert(t('common.error', 'Error'), t('rewards.titleRequired', 'El nombre de la ruleta es requerido.'));
      return;
    }

    if (isNaN(minNum) || isNaN(maxNum) || minNum < 0 || maxNum < minNum) {
      Alert.alert(
        t('rewards.invalidRangeTitle'),
        t('rewards.invalidRangeMsg')
      );
      return;
    }

    setSavingWheelId(wheelId);
    try {
      await dbService.updatePeriodWheelRange(wheelId, minNum, maxNum, newTitle, newIcon, newColor);
      if (selectedPeriodId) {
        await loadWheelsForPeriod(selectedPeriodId);
      }
      Alert.alert(t('common.success', 'Éxito'), t('rewards.rangeUpdated'));
    } catch (e: any) {
      Alert.alert(t('common.error', 'Error'), e?.message || t('rewards.rangeUpdateError', 'No se pudo guardar el rango.'));
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
      Alert.alert(t('common.error', 'Error'), e?.message || t('rewards.addOptionError', 'No se pudo agregar la opción.'));
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    try {
      await dbService.deleteWheelOption(optionId);
      if (selectedPeriodId) {
        await loadWheelsForPeriod(selectedPeriodId);
      }
    } catch (e: any) {
      Alert.alert(t('common.error', 'Error'), e?.message || t('rewards.deleteOptionError', 'No se pudo eliminar la opción.'));
    }
  };

  const handleCreateWheel = async () => {
    if (!selectedPeriodId) return;
    try {
      await dbService.createPeriodWheel(selectedPeriodId, t('rewards.newWheelDefault', 'Nueva Ruleta'));
      await loadWheelsForPeriod(selectedPeriodId);
    } catch (e: any) {
      Alert.alert(t('common.error', 'Error'), e?.message || 'Error al crear la ruleta.');
    }
  };

  const handleDeleteWheel = async (wheelId: string) => {
    Alert.alert(
      t('rewards.deleteWheelTitle', 'Eliminar Ruleta'),
      t('rewards.deleteWheelConfirm', '¿Estás seguro de que quieres eliminar esta ruleta y todos sus premios?'),
      [
        { text: t('common.cancel', 'Cancelar'), style: 'cancel' },
        {
          text: t('common.delete', 'Eliminar'),
          style: 'destructive',
          onPress: async () => {
            try {
              await dbService.deletePeriodWheel(wheelId);
              if (selectedPeriodId) {
                await loadWheelsForPeriod(selectedPeriodId);
              }
            } catch (e: any) {
              Alert.alert(t('common.error', 'Error'), e?.message || 'Error al eliminar la ruleta.');
            }
          }
        }
      ]
    );
  };

  return {
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
  };
};
