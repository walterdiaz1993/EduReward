import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../store/AuthContext';
import dbService, { PeriodRow, StudentPeriodSpinRow, PeriodWheelRow, GradeLogRow, RewardLogRow } from '../../../database/dbService';
import { theme } from '../../../config/theme';

type HistoryItem = {
  id: string;
  type: 'spin' | 'grade';
  dateStr: string;
  timestamp: number;
  periodId: string;
  // Spin specifics
  wheelId?: string;
  prizeText?: string;
  // Grade specifics
  subjectName?: string;
  gradeValue?: string;
  rewardTitle?: string;
  rewardValue?: string;
};

export default function StudentRewardsScreen() {
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [periods, setPeriods] = useState<Record<string, PeriodRow>>({});
  const [wheels, setWheels] = useState<Record<string, PeriodWheelRow>>({});
  
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        if (!user) return;
        
        try {
          const allSts = await dbService.getAllStudents();
          const match = allSts.find((s) => s.id === user.id || s.username === user.username);
          if (!match) return;
          
          const studentId = match.id;
          
          // 1. Fetch periods & wheels
          const allPeriods = await dbService.getAllPeriods(match.parent_teacher_id);
          const periodMap = allPeriods.reduce((acc, p) => { acc[p.id] = p; return acc; }, {} as Record<string, PeriodRow>);
          
          let wheelsData: any[] = [];
          for (const p of allPeriods) {
            const wList = await dbService.getPeriodWheels(p.id);
            wheelsData = [...wheelsData, ...wList];
          }
          const wheelsMap = wheelsData.reduce((acc, w) => { acc[w.id] = w; return acc; }, {} as Record<string, any>);
          
          // 2. Fetch all spins
          const allSpins = await dbService.getAllStudentSpins(studentId);
          
          // 3. Fetch grades and explicit rewards log
          const grades = await dbService.getGradesForStudent(studentId);
          const rewardsLog = await dbService.getRewardsLogForStudent(studentId);
          
          // Map rewards log by unique key (subject_id + created_at)
          const rewardsMap: Record<string, RewardLogRow> = {};
          rewardsLog.forEach(r => {
            rewardsMap[`${r.subject_id}_${r.created_at}`] = r;
          });

          const combined: HistoryItem[] = [];

          allSpins.forEach(spin => {
            combined.push({
              id: spin.id,
              type: 'spin',
              dateStr: spin.created_at,
              timestamp: new Date(spin.created_at).getTime() || 0,
              periodId: spin.period_id,
              wheelId: spin.wheel_id,
              prizeText: spin.prize_text
            });
          });

          grades.forEach((grade: GradeLogRow & { subject_name?: string }) => {
            const reward = rewardsMap[`${grade.subject_id}_${grade.created_at}`];
            combined.push({
              id: grade.id,
              type: 'grade',
              dateStr: grade.created_at,
              timestamp: new Date(grade.created_at).getTime() || 0,
              periodId: grade.period_id,
              subjectName: grade.subject_name || 'Materia',
              gradeValue: grade.raw_grade,
              rewardTitle: reward?.title,
              rewardValue: reward?.reward_value,
            });
          });

          combined.sort((a, b) => b.timestamp - a.timestamp);
          
          if (isActive) {
            setHistoryItems(combined);
            setPeriods(periodMap);
            setWheels(wheelsMap);
          }
        } catch (e) {
          console.error("Error loading student rewards screen:", e);
        }
      };

      loadData();

      return () => {
        isActive = false;
      };
    }, [user])
  );

  const getGradeColor = (valStr: string | undefined) => {
    if (!valStr) return colors.textSecondary;
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      if (val >= 90) return colors.success;
      if (val < 70) return colors.error;
    }
    return colors.primary;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={historyItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.container, { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, paddingBottom: 110 }]}
        ListEmptyComponent={
          <View style={{ marginTop: 40, alignItems: 'center' }}>
            <Ionicons name="folder-open-outline" size={48} color={colors.textSecondary} style={{ opacity: 0.5, marginBottom: 16 }} />
            <Text style={{ ...theme.typography.body, color: colors.textSecondary, textAlign: 'center' }}>
              No hay historial disponible. ¡Registra tus notas!
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const periodName = periods[item.periodId]?.name || 'Período Desconocido';
          const dateLabel = new Date(item.dateStr).toLocaleDateString();

          if (item.type === 'spin') {
            const wheelInfo = item.wheelId ? wheels[item.wheelId] : undefined;
            const wheelIcon = wheelInfo?.icon || 'gift';
            const wheelColor = wheelInfo?.color || colors.primary;
            
            return (
              <View style={[styles.card, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? `${wheelColor}35` : `${wheelColor}15` }]}>
                  <Ionicons name={wheelIcon as any} size={24} color={wheelColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.periodTitle, { color: colors.textSecondary }]}>{periodName} • {dateLabel}</Text>
                  <Text style={[styles.prizeText, { color: colors.text }]}>{item.prizeText}</Text>
                  <Text style={[styles.subText, { color: wheelColor, marginTop: 2 }]}>Premio de Ruleta</Text>
                </View>
              </View>
            );
          } else {
            // Grade item
            return (
              <View style={[styles.card, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? `${colors.secondary}35` : `${colors.secondary}15` }]}>
                  <Text style={{ ...theme.typography.h2, color: getGradeColor(item.gradeValue) }}>{item.gradeValue}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.periodTitle, { color: colors.textSecondary }]}>{periodName} • {dateLabel}</Text>
                  <Text style={[styles.prizeText, { color: colors.text }]}>{item.subjectName}</Text>
                  
                  {item.rewardTitle ? (
                    <View style={{ marginTop: 6, gap: 4 }}>
                      <View style={styles.rewardPill}>
                        <Ionicons name="star" size={12} color="#f59e0b" style={{ marginRight: 4 }} />
                        <Text style={[styles.rewardPillText, { color: '#f59e0b' }]}>{item.rewardTitle}</Text>
                      </View>
                      {item.rewardValue ? (
                        <Text style={[styles.rewardValueText, { color: colors.textSecondary }]}>
                          {item.rewardValue}
                        </Text>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              </View>
            );
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: theme.roundness.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  periodTitle: {
    ...theme.typography.caption,
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prizeText: {
    ...theme.typography.bodySemibold,
    fontSize: 16,
  },
  subText: {
    ...theme.typography.caption,
    fontSize: 12,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  rewardPillText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  rewardValueText: {
    ...theme.typography.caption,
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  }
});
