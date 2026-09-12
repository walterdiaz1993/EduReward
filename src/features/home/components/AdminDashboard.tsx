import React from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView } from 'expo-camera';
import { theme } from '../../../config/theme';
import { useAuth } from '../../../store/AuthContext';
import useAdmin, { GradingSystem } from '../hooks/useAdmin';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import StudentConfigForm from './StudentConfigForm';
import PeriodAssignmentModal from './PeriodAssignmentModal';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';

interface AdminDashboardProps {
  onBack: () => void;
  adminState: ReturnType<typeof useAdmin>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, adminState }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const {
    students,
    allStudents,
    selectedStudent,
    isScannerOpen,
    isGradeModalOpen,
    isCreateModalOpen,
    isPeriodModalOpen,
    isConfigMode,
    gradingSystem,
    setGradingSystem,
    gradeValue,
    setGradeValue,
    newStudentName,
    setNewStudentName,
    newStudentUsername,
    setNewStudentUsername,
    alertMessage,
    alertType,
    cameraPermission,
    openScanner,
    closeScanner,
    handleScanStudent,
    handleSelectStudent,
    handleConfigureStudent,
    closeGradeModal,
    openCreateModal,
    closeCreateModal,
    openPeriodModal,
    closePeriodModal,
    handleCreateStudent,
    handleSaveStudentConfig,
    handleActivatePremium,
    validateAndAddGrade,
    checkCreationLimit,
    reloadFromDb,
  } = adminState;

  const isTeacher = user?.role === 'teacher';
  const isPremium = user?.isPremium;
  const limitCheck = checkCreationLimit();

  const getAverageColor = (avg: number) => {
    if (avg >= 90) return theme.colors.success;
    if (avg < 70) return theme.colors.error;
    return theme.colors.primary;
  };

  const getSystemPlaceholder = (sys: GradingSystem) => {
    switch (sys) {
      case 'percentage':
        return '0 - 100';
      case 'decimal':
        return '0.0 - 10.0';
      case 'letters':
        return 'A, B, C, D, F';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
        <Text style={styles.backButtonText}>{t('common.backBtn')}</Text>
      </TouchableOpacity>

      {isTeacher && !isPremium && (
        <View style={styles.premiumBanner}>
          <View style={styles.premiumTextContainer}>
            <Ionicons name="gift-outline" size={24} color={theme.colors.secondary} />
            <Text style={styles.premiumBannerText}>
              {t('admin.premiumRequired')}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleActivatePremium}
            style={styles.premiumBannerBtn}
            activeOpacity={0.8}
          >
            <Text style={styles.premiumBannerBtnText}>
              {t('admin.activatePremium')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isTeacher && isPremium && (
        <View style={styles.premiumActiveBanner}>
          <Ionicons name="checkmark-circle" size={20} color={theme.colors.secondary} />
          <Text style={styles.premiumActiveText}>
            {t('admin.premiumActive')}
          </Text>
        </View>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={openScanner}
          style={[styles.actionBtn, styles.scanButton]}
          activeOpacity={0.8}
        >
          <Ionicons name="qr-code-outline" size={20} color={theme.colors.white} />
          <Text style={styles.scanButtonText}>{t('admin.scanQr')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openCreateModal}
          style={[styles.actionBtn, styles.createButton]}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add-outline" size={20} color={theme.colors.primary} />
          <Text style={styles.createButtonText}>
            {isTeacher
              ? isPremium
                ? t('admin.addProfileTeacherPremium')
                : t('admin.addProfileTeacher')
              : t('admin.addProfileTutor')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={openPeriodModal}
          style={[styles.actionBtn, { backgroundColor: colors.secondary + '20', borderColor: colors.secondary, borderWidth: 1 }]}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.secondary} />
          <Text style={[styles.createButtonText, { color: colors.secondary }]}>
            {t('periods.createPeriodBtn')}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>
        {isTeacher ? t('admin.studentListTeacher') : t('admin.studentListTutor')}
      </Text>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.studentCardRow}>
            <TouchableOpacity
              onPress={() => handleSelectStudent(item)}
              style={styles.studentCard}
              activeOpacity={0.7}
            >
              <View style={styles.studentInfo}>
                <View style={styles.avatarCircle}>
                  <Ionicons name="person" size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.nameContainer}>
                  <Text style={styles.studentName}>{item.fullName}</Text>
                  <Text style={styles.studentEmail}>
                    {item.email} • {item.periodType === 'bimonthly' ? t('admin.bimonthly') : t('admin.semester')}
                  </Text>
                </View>
              </View>

              <View style={styles.studentStats}>
                <View
                  style={[
                    styles.avgBadge,
                    { backgroundColor: getAverageColor(item.average) + '15' },
                  ]}
                >
                  <Text
                    style={[
                      styles.avgText,
                      { color: getAverageColor(item.average) },
                    ]}
                  >
                    {t('admin.averageShort', { avg: item.average })}
                  </Text>
                </View>
                <View style={styles.pointsBadge}>
                  <Ionicons name="star" size={14} color={theme.colors.secondary} />
                  <Text style={styles.pointsText}>{item.points} pts</Text>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleConfigureStudent(item)}
              style={styles.settingsBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={isScannerOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={closeScanner}
      >
        <View style={styles.scannerModalOverlay}>
          <View style={styles.scannerContainer}>
            <View style={styles.scannerHeader}>
              <Text style={styles.scannerTitle}>{t('admin.scanSimTitle')}</Text>
              <TouchableOpacity onPress={closeScanner}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.scannerDesc}>{t('admin.scanSimDesc')}</Text>

            <View style={styles.cameraBox}>
              {cameraPermission?.granted ? (
                <CameraView
                  style={styles.cameraView}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                  }}
                  onBarcodeScanned={({ data }) => {
                    if (data) {
                      handleScanStudent(data);
                    }
                  }}
                >
                  <View style={styles.cameraOverlay}>
                    <View style={styles.scanTargetFrame}>
                      <Ionicons
                        name="scan-outline"
                        size={180}
                        color={theme.colors.secondary}
                      />
                      <View style={styles.scanLaser} />
                    </View>
                  </View>
                </CameraView>
              ) : (
                <View style={styles.cameraFallback}>
                  <Ionicons name="camera-reverse-outline" size={48} color={theme.colors.textSecondary} />
                </View>
              )}
            </View>

            <Text style={styles.selectPrompt}>{t('admin.selectStudent')}:</Text>
            {allStudents.map((student) => (
              <TouchableOpacity
                key={student.id}
                onPress={() => handleScanStudent(student.id)}
                style={styles.scanOptionCard}
              >
                <Ionicons name="qr-code" size={20} color={theme.colors.primary} />
                <Text style={styles.scanOptionText}>{student.fullName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      <Modal
        visible={isCreateModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={closeCreateModal}
      >
        <View style={styles.gradeModalOverlay}>
          <View style={styles.gradeContainer}>
            <View style={styles.gradeHeader}>
              <Text style={styles.gradeTitle}>{t('admin.createProfileTitle')}</Text>
              <TouchableOpacity onPress={closeCreateModal}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {alertMessage && alertType === 'error' && (
              <View style={[styles.alertBox, styles.alertPunish]}>
                <Ionicons
                  name="alert-circle-outline"
                  size={22}
                  color={theme.colors.error}
                  style={styles.alertIcon}
                />
                <Text style={[styles.alertText, { color: theme.colors.error }]}>
                  {alertMessage}
                </Text>
              </View>
            )}

            <Input
              label={t('admin.fullName')}
              placeholder={t('admin.fullNamePlaceholder')}
              value={newStudentName}
              onChangeText={setNewStudentName}
              autoCapitalize="words"
            />

            <Input
              label={t('admin.username')}
              placeholder={t('admin.usernamePlaceholder')}
              value={newStudentUsername}
              onChangeText={setNewStudentUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button
              title={t('admin.createBtn')}
              onPress={handleCreateStudent}
              disabled={!limitCheck.allowed}
              containerStyle={styles.submitBtn}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={isGradeModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={closeGradeModal}
      >
        <View style={styles.gradeModalOverlay}>
          {isConfigMode && selectedStudent ? (
            <StudentConfigForm
              student={selectedStudent}
              onSave={handleSaveStudentConfig}
              onClose={closeGradeModal}
            />
          ) : (
            <View style={styles.gradeContainer}>
              <View style={styles.gradeHeader}>
                <Text style={styles.gradeTitle}>
                  {alertType === 'success' || alertType === 'error'
                    ? t('common.loading').slice(0, -3)
                    : t('admin.addGradeTitle')}
                </Text>
                <TouchableOpacity onPress={closeGradeModal}>
                  <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>

              {selectedStudent && alertType !== 'success' && alertType !== 'error' && (
                <View style={styles.gradeStudentDetail}>
                  <Text style={styles.studentDetailName}>
                    {t('admin.studentName', { name: selectedStudent.fullName })}
                  </Text>
                  <View style={styles.gradeDetailRow}>
                    <Text style={styles.studentDetailPoints}>
                      {t('home.points')}: {selectedStudent.points} pts
                    </Text>
                    <Text style={styles.studentDetailAvg}>
                      {t('student.average')}: {selectedStudent.average}
                    </Text>
                  </View>

                  {selectedStudent.grades.length > 0 && (
                    <View style={styles.historyBox}>
                      <Text style={styles.historyTitle}>
                        {t('admin.gradesTitle')}
                      </Text>
                      <Text style={styles.historyContent}>
                        {selectedStudent.grades.join(', ')}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {alertMessage && (
                <View
                  style={[
                    styles.alertBox,
                    alertType === 'reward'
                      ? styles.alertReward
                      : alertType === 'punish'
                      ? styles.alertPunish
                      : alertType === 'error'
                      ? styles.alertPunish
                      : styles.alertSuccess,
                  ]}
                >
                  <Ionicons
                    name={
                      alertType === 'reward'
                        ? 'trophy-outline'
                        : alertType === 'punish' || alertType === 'error'
                        ? 'alert-circle-outline'
                        : 'checkmark-circle-outline'
                    }
                    size={22}
                    color={
                      alertType === 'reward'
                        ? theme.colors.secondary
                        : alertType === 'punish' || alertType === 'error'
                        ? theme.colors.error
                        : theme.colors.primary
                    }
                    style={styles.alertIcon}
                  />
                  <Text
                    style={[
                      styles.alertText,
                      {
                        color:
                          alertType === 'reward'
                            ? theme.colors.secondary
                            : alertType === 'punish' || alertType === 'error'
                            ? theme.colors.error
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {alertMessage}
                  </Text>
                </View>
              )}

              {(!alertMessage || (alertType !== 'success' && alertType !== 'error')) && (
                <>
                  <Text style={styles.label}>{t('admin.gradeSystem')}</Text>
                  <View style={styles.systemSwitcher}>
                    {(['percentage', 'decimal', 'letters'] as GradingSystem[]).map(
                      (sys) => (
                        <TouchableOpacity
                          key={sys}
                          onPress={() => {
                            setGradingSystem(sys);
                            setGradeValue('');
                          }}
                          style={[
                            styles.systemTab,
                            gradingSystem === sys ? styles.systemTabActive : {},
                          ]}
                        >
                          <Text
                            style={[
                              styles.systemTabText,
                              gradingSystem === sys
                                ? styles.systemTabTextActive
                                : {},
                            ]}
                          >
                            {t(`admin.${sys}`)}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>

                  <TextInput
                    style={styles.gradeInput}
                    value={gradeValue}
                    onChangeText={setGradeValue}
                    placeholder={getSystemPlaceholder(gradingSystem)}
                    placeholderTextColor={theme.colors.textSecondary}
                    autoCapitalize={gradingSystem === 'letters' ? 'characters' : 'none'}
                    keyboardType={gradingSystem === 'letters' ? 'default' : 'numeric'}
                  />

                  <Button
                    title={t('admin.submitBtn')}
                    onPress={validateAndAddGrade}
                    containerStyle={styles.submitBtn}
                  />
                </>
              )}
            </View>
          )}
        </View>
      </Modal>

      <PeriodAssignmentModal
        visible={isPeriodModalOpen}
        onClose={closePeriodModal}
        onSuccess={reloadFromDb}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  premiumBanner: {
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    borderColor: theme.colors.secondary,
    borderWidth: 1,
    borderRadius: theme.roundness.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  premiumTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  premiumBannerText: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  premiumBannerBtn: {
    backgroundColor: theme.colors.secondary,
    height: 38,
    borderRadius: theme.roundness.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  premiumBannerBtnText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontWeight: '700',
  },
  premiumActiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    borderRadius: theme.roundness.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    gap: 8,
  },
  premiumActiveText: {
    ...theme.typography.caption,
    color: theme.colors.secondary,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: theme.roundness.md,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scanButton: {
    backgroundColor: theme.colors.primary,
  },
  scanButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
    fontSize: 14,
  },
  createButton: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  createButtonText: {
    ...theme.typography.button,
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
    fontSize: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  listContent: {
    paddingBottom: 115,
  },
  studentCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: 8,
  },
  studentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.roundness.md,
    padding: theme.spacing.md,
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(30, 64, 175, 0.08)',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  settingsBtn: {
    width: 44,
    height: 52,
    backgroundColor: theme.colors.card,
    borderRadius: theme.roundness.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(30, 64, 175, 0.08)',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  nameContainer: {
    flex: 1,
  },
  studentName: {
    ...theme.typography.bodySemibold,
    color: theme.colors.text,
  },
  studentEmail: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  studentStats: {
    alignItems: 'flex-end',
    marginLeft: theme.spacing.sm,
  },
  avgBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.roundness.sm,
    marginBottom: theme.spacing.xs,
  },
  avgText: {
    ...theme.typography.caption,
    fontWeight: '700',
    fontSize: 11,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pointsText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  scannerModalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  scannerContainer: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.roundness.lg,
    borderTopRightRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    minHeight: 520,
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  scannerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  scannerDesc: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  cameraBox: {
    height: 220,
    width: '100%',
    borderRadius: theme.roundness.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraView: {
    flex: 1,
    width: '100%',
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanTargetFrame: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    width: 180,
    position: 'relative',
  },
  scanLaser: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: theme.colors.secondary,
    top: '50%',
  },
  cameraFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectPrompt: {
    ...theme.typography.bodySemibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  scanOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.roundness.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  scanOptionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  gradeModalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  gradeContainer: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  gradeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  gradeTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  gradeStudentDetail: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.roundness.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  studentDetailName: {
    ...theme.typography.bodySemibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  gradeDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  studentDetailPoints: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  studentDetailAvg: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  historyBox: {
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.xs,
  },
  historyTitle: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  historyContent: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginTop: 2,
  },
  label: {
    ...theme.typography.bodySemibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  systemSwitcher: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  systemTab: {
    flex: 1,
    height: 38,
    borderRadius: theme.roundness.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  systemTabActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  systemTabText: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  systemTabTextActive: {
    color: theme.colors.primary,
  },
  gradeInput: {
    height: 52,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.roundness.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontSize: theme.typography.body.fontSize,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  submitBtn: {
    marginTop: theme.spacing.xs,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.roundness.sm,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
  },
  alertSuccess: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderColor: theme.colors.primary,
  },
  alertReward: {
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    borderColor: theme.colors.secondary,
  },
  alertPunish: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: theme.colors.error,
  },
  alertIcon: {
    marginRight: theme.spacing.sm,
  },
  alertText: {
    ...theme.typography.caption,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
});
export default AdminDashboard;
