import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../config/theme';
import useStudent from '../hooks/useStudent';

interface StudentDashboardProps {
  onBack: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onBack }) => {
  const {
    studentData,
    t,
  } = useStudent();

  const getAverageColor = (avg: number) => {
    if (avg >= 90) return theme.colors.success;
    if (avg < 70) return theme.colors.error;
    return theme.colors.primary;
  };

  const renderGradeItem = ({ item, index }: { item: number; index: number }) => (
    <View style={styles.gradeCard}>
      <Text style={styles.gradeIndex}>{t('admin.percentage')} #{index + 1}</Text>
      <Text
        style={[
          styles.gradeValueText,
          { color: getAverageColor(item) },
        ]}
      >
        {item}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={[]}
      renderItem={null}
      ListEmptyComponent={
        <View style={styles.container}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
            <Text style={styles.backButtonText}>{t('common.backBtn')}</Text>
          </TouchableOpacity>

          {studentData && (
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>{t('student.average')}</Text>
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

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{t('student.gradesTitle')}</Text>
            {studentData && studentData.grades.length > 0 ? (
              <FlatList
                data={studentData.grades}
                renderItem={renderGradeItem}
                keyExtractor={(_, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.gradesList}
              />
            ) : (
              <Text style={styles.noGradesText}>{t('student.noGrades')}</Text>
            )}
          </View>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 110,
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
  noGradesText: {
    ...theme.typography.caption,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
});

export default StudentDashboard;
