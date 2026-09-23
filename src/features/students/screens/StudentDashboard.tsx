import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../config/theme';
import useStudent from '../hooks/useStudent';
import GradeDetailModal from '../components/GradeDetailModal';

export const StudentDashboard: React.FC = () => {
  const {
    studentData,
    gradesHistory,
    subjectAveragesMap,
    selectedGradeDetail,
    gradeDetailReward,
    isGradeDetailModalOpen,
    openGradeDetail,
    closeGradeDetail,
    t,
  } = useStudent();

  const getAverageColor = (avg: number) => {
    if (avg >= 90) return theme.colors.success;
    if (avg < 70) return theme.colors.error;
    return theme.colors.primary;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <FlatList
        data={[]}
      renderItem={null}
      ListEmptyComponent={
        <View style={styles.container}>

          {studentData && (
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Promedio Global</Text>
                <Text
                  style={[
                    styles.summaryValue,
                    { color: getAverageColor(studentData.average) },
                  ]}
                >
                  {studentData.average}
                </Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>{t('home.points')}</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>
                  {studentData.points}
                </Text>
              </View>
            </View>
          )}

          {/* Per-Subject Averages Card */}
          {Object.keys(subjectAveragesMap).length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Promedios por Materia</Text>
              <View style={{ gap: 8, marginTop: theme.spacing.sm }}>
                {Object.entries(subjectAveragesMap).map(([sbId, data]) => (
                  <View key={sbId} style={styles.subjectAvgRow}>
                    <Ionicons name="book-outline" size={18} color={theme.colors.secondary} />
                    <Text style={styles.subjectAvgName}>{data.subjectName}</Text>
                    <View style={styles.subjectAvgBadge}>
                      <Text style={styles.subjectAvgValueText}>
                        Prom: {data.average} ({data.count} notas)
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('student.qrTitle')}</Text>
            <Text style={styles.sectionDesc}>{t('student.qrSubtitle')}</Text>
            <View style={styles.qrContainer}>
              <View style={styles.qrBorder}>
                <Ionicons name="qr-code" size={140} color={theme.colors.text} />
                <View style={styles.scannerCornerTL} />
                <View style={styles.scannerCornerTR} />
                <View style={styles.scannerCornerBL} />
                <View style={styles.scannerCornerBR} />
              </View>
              {studentData && (
                <Text style={styles.studentIdCode}>
                  ID: {studentData.id.toUpperCase()}
                </Text>
              )}
            </View>
          </View>

          {studentData && studentData.subjectRules && studentData.subjectRules.length > 0 && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>{t('student.activeRules')}</Text>
              {studentData.subjectRules.map((rule) => (
                <View key={rule.id} style={styles.ruleItem}>
                  <Ionicons name="gift-outline" size={18} color={theme.colors.secondary} />
                  <Text style={styles.ruleText}>
                    {t('rewards.rulePlaceholder', {
                      subject: rule.subject,
                      condition: rule.condition === 'greater' ? '>' : '<',
                      value: rule.value,
                      reward: rule.rewardValue,
                    })}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Complete Grade History */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Histórico de Calificaciones</Text>
            {gradesHistory.length > 0 ? (
              <View style={{ gap: 8, marginTop: theme.spacing.sm }}>
                {gradesHistory.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => openGradeDetail(item)}
                    style={styles.gradeHistoryCard}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.gradeHistorySubject}>{item.subject_name || 'Materia'}</Text>
                      <Text style={styles.gradeHistoryDate}>
                        {new Date(item.created_at).toLocaleDateString()} — Sistema: {item.grading_system}
                      </Text>
                    </View>
                    <Text style={[styles.gradeHistoryValue, { color: getAverageColor(item.numeric_grade) }]}>
                      {item.raw_grade}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.noGradesText}>{t('student.noGrades')}</Text>
            )}
          </View>

          {/* Grade Detail Modal */}
          <GradeDetailModal
            visible={isGradeDetailModalOpen}
            gradeLog={selectedGradeDetail}
            subjectName={(selectedGradeDetail as any)?.subject_name || 'Materia'}
            reward={gradeDetailReward}
            onClose={closeGradeDetail}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </View>
      }
    />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 110,
    paddingTop: theme.spacing.md,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  backButtonText: {
    ...theme.typography.bodySemibold,
    color: theme.colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.roundness.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryLabel: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    ...theme.typography.h1,
    fontSize: 28,
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionTitle: {
    ...theme.typography.h2,
    fontSize: 18,
    marginBottom: theme.spacing.xs,
  },
  sectionDesc: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.lg,
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  qrBorder: {
    padding: theme.spacing.lg,
    backgroundColor: '#ffffff',
    borderRadius: theme.roundness.lg,
    position: 'relative',
    borderWidth: 2,
    borderColor: theme.colors.primary + '30',
  },
  scannerCornerTL: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 16,
    height: 16,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: theme.colors.primary,
    borderTopLeftRadius: theme.roundness.sm,
  },
  scannerCornerTR: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: theme.colors.primary,
    borderTopRightRadius: theme.roundness.sm,
  },
  scannerCornerBL: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 16,
    height: 16,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: theme.colors.primary,
    borderBottomLeftRadius: theme.roundness.sm,
  },
  scannerCornerBR: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: theme.colors.primary,
    borderBottomRightRadius: theme.roundness.sm,
  },
  studentIdCode: {
    ...theme.typography.caption,
    fontWeight: '700',
    marginTop: theme.spacing.md,
    letterSpacing: 2,
    color: theme.colors.textSecondary,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  ruleText: {
    ...theme.typography.caption,
    flex: 1,
  },
  gradesList: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  gradeCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.roundness.md,
    minWidth: 90,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  gradeIndex: {
    ...theme.typography.caption,
    fontSize: 11,
    marginBottom: 4,
  },
  gradeValueText: {
    ...theme.typography.h2,
    fontSize: 20,
  },
  subjectAvgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    gap: 8,
  },
  subjectAvgName: {
    ...theme.typography.bodySemibold,
    fontSize: 14,
    flex: 1,
  },
  subjectAvgBadge: {
    backgroundColor: theme.colors.primary + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.roundness.full,
  },
  subjectAvgValueText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  gradeHistoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.roundness.md,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  gradeHistorySubject: {
    ...theme.typography.bodySemibold,
    fontSize: 14,
  },
  gradeHistoryDate: {
    ...theme.typography.caption,
    fontSize: 11,
    marginTop: 2,
  },
  gradeHistoryValue: {
    ...theme.typography.h2,
    fontSize: 20,
    fontWeight: '700',
  },
  noGradesText: {
    ...theme.typography.caption,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
});

export default StudentDashboard;
