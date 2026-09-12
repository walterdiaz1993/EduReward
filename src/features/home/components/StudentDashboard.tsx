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
                keyExtractor={(_, index) => index.toString()}
                renderItem={renderGradeItem}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.emptyText}>{t('student.noGrades')}</Text>
            )}
          </View>
        </View>
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    />
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 115,
  },
  container: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: 4,
  },
  backButtonText: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: theme.roundness.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(30, 64, 175, 0.08)',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    ...theme.typography.h1,
    fontSize: 24,
  },
  sectionCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(30, 64, 175, 0.08)',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    ...theme.typography.bodySemibold,
    color: theme.colors.text,
    fontSize: 18,
    marginBottom: theme.spacing.xs,
  },
  sectionDesc: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    lineHeight: 18,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBorder: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.md,
    position: 'relative',
    backgroundColor: theme.colors.white,
  },
  scannerCornerTL: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: theme.colors.primary,
  },
  scannerCornerTR: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: theme.colors.primary,
  },
  scannerCornerBL: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: theme.colors.primary,
  },
  scannerCornerBR: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: theme.colors.primary,
  },
  studentIdCode: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    letterSpacing: 1.5,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 8,
  },
  ruleText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    flex: 1,
    lineHeight: 18,
  },
  gradeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  gradeIndex: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  gradeValueText: {
    ...theme.typography.bodySemibold,
    fontSize: 18,
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
});
export default StudentDashboard;
