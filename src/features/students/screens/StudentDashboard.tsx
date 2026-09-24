import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import QRCodeView from '../../../components/QRCodeView';
import { theme } from '../../../config/theme';
import { useTheme } from '../../../context/ThemeContext';
import useStudent from '../hooks/useStudent';

export const StudentDashboard: React.FC = () => {
  const { studentData, t } = useStudent();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.xl, paddingBottom: 110 },
        ]}
      >
        {studentData ? (
          <View
            style={[
              styles.idCardContainer,
              { backgroundColor: colors.background, borderColor: colors.primary },
            ]}
          >
            {/* ID Card Banner Header */}
            <View style={[styles.cardHeaderBanner, { backgroundColor: colors.primary }]}>
              <View style={styles.bannerRow}>
                <Ionicons name="school" size={22} color="#ffffff" />
                <View>
                  <Text style={styles.bannerTitle}>EduReward</Text>
                  <Text style={styles.bannerSubtitle}>{t('student.cardSubtitle', 'Carnet de Identificación Estudiantil')}</Text>
                </View>
              </View>
            </View>

            {/* Student Profile Info */}
            <View style={styles.cardBody}>
              <View style={styles.profileRow}>
                <View style={[styles.avatarCircle, { backgroundColor: colors.primary + '20' }]}>
                  <Ionicons name="person" size={36} color={colors.primary} />
                </View>
                <View style={styles.profileTextGroup}>
                  <Text style={[styles.studentFullName, { color: colors.text }]}>
                    {studentData.fullName}
                  </Text>
                  <Text style={[styles.studentUsername, { color: colors.textSecondary }]}>
                    @{studentData.username}
                  </Text>
                  <View style={styles.badgePillRow}>
                    <View style={[styles.roleBadge, { backgroundColor: colors.secondary + '20' }]}>
                      <Text style={[styles.roleBadgeText, { color: colors.secondary }]}>
                        {t('student.roleStudent', 'Estudiante')}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* QR Code Section */}
              <View style={[styles.qrSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.qrTitleLabel, { color: colors.textSecondary }]}>
                  {t('student.qrScanTitle', 'CÓDIGO QR PARA ESCANEAR NOTAS')}
                </Text>

                <View style={{ marginVertical: 8, alignItems: 'center' }}>
                  <QRCodeView value={studentData.id} size={190} color="#000000" backgroundColor="#ffffff" />
                </View>

                <Text style={[styles.qrInstructions, { color: colors.textSecondary }]}>
                  {t('student.qrScanDesc', 'Escanea este código QR con la cámara para abrir directamente el registro de calificaciones de {{name}}.', { name: studentData.fullName })}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: colors.textSecondary }}>{t('common.loading', 'Cargando...')}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  idCardContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: theme.roundness.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeaderBanner: {
    padding: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerTitle: {
    ...theme.typography.h2,
    color: '#ffffff',
    fontSize: 16,
    lineHeight: 20,
  },
  bannerSubtitle: {
    ...theme.typography.caption,
    color: '#ffffff',
    opacity: 0.85,
    fontSize: 11,
    lineHeight: 14,
  },
  cardBody: {
    padding: theme.spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileTextGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  studentFullName: {
    ...theme.typography.h2,
    fontSize: 18,
    marginBottom: 2,
  },
  studentUsername: {
    ...theme.typography.body,
    fontSize: 14,
    marginBottom: 6,
  },
  badgePillRow: {
    flexDirection: 'row',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.roundness.full,
  },
  roleBadgeText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  qrSection: {
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.roundness.md,
    borderWidth: 1,
  },
  qrTitleLabel: {
    ...theme.typography.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  qrInstructions: {
    ...theme.typography.caption,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
    lineHeight: 16,
  },
});

export default StudentDashboard;
