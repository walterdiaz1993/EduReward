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
import StudentConfigForm from '../components/StudentConfigForm';
import PeriodAssignmentModal from '../components/PeriodAssignmentModal';
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

  const getRoleTitle = () => {
    if (user?.role === 'tutor') {
      return t('admin.studentListTutor');
    }
    return t('admin.studentListTeacher');
  };

  const getAddButtonText = () => {
    if (user?.role === 'tutor') {
      return t('admin.addProfileTutor');
    }
    if (user?.isPremium) {
      return t('admin.addProfileTeacherPremium');
    }
    return t('admin.addProfileTeacher');
  };

  const limitCheck = checkCreationLimit();

  const renderStudentCard = ({ item }: { item: (typeof students)[0] }) => (
    <View style={[styles.studentCard, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
      <View style={styles.studentInfo}>
        <View style={styles.avatarBox}>
          <Ionicons name="person" size={24} color={colors.primary} />
        </View>
        <View style={styles.studentTextDetails}>
          <Text style={[styles.studentNameText, { color: colors.text }]}>{item.fullName}</Text>
          <Text style={[styles.studentUserText, { color: colors.textSecondary }]}>@{item.username}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.miniBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.miniBadgeText, { color: colors.primary }]}>
                {t('home.points')}: {item.points}
              </Text>
            </View>
            <View style={[styles.miniBadge, { backgroundColor: colors.secondary + '20' }]}>
              <Text style={[styles.miniBadgeText, { color: colors.secondary }]}>
                {t('admin.averageShort', { avg: item.average })}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          onPress={() => handleSelectStudent(item)}
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={16} color={colors.white} />
          <Text style={styles.actionBtnText}>{t('admin.submitBtn')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleConfigureStudent(item)}
          style={[styles.actionBtn, styles.configBtn, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}
          activeOpacity={0.8}
        >
          <Ionicons name="settings-outline" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={[]}
      renderItem={null}
      ListEmptyComponent={
        <View style={styles.container}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={20} color={colors.primary} />
            <Text style={[styles.backButtonText, { color: colors.primary }]}>{t('common.backBtn')}</Text>
          </TouchableOpacity>

          <Text style={[styles.dashboardTitle, { color: colors.text }]}>{t('admin.title')}</Text>

          {/* Quick Scanner & Action Bar */}
          <View style={styles.topActionsRow}>
            <TouchableOpacity
              onPress={openScanner}
              style={[styles.primaryActionCard, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <View style={styles.scannerIconBox}>
                <Ionicons name="qr-code-outline" size={28} color={colors.white} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.primaryActionTitle}>{t('admin.scanQr')}</Text>
                <Text style={styles.primaryActionDesc}>
                  {t('admin.scanSimDesc')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Registered Profiles Header */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{getRoleTitle()}</Text>
              <Text style={[styles.sectionCountText, { color: colors.textSecondary }]}>
                {students.length} {t('student.gradesTitle').toLowerCase()}
              </Text>
            </View>

            <TouchableOpacity
              onPress={openCreateModal}
              style={[
                styles.addProfileBtn,
                { backgroundColor: limitCheck.allowed ? colors.secondary : colors.border },
              ]}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add" size={16} color={colors.white} />
              <Text style={styles.addProfileBtnText}>{getAddButtonText()}</Text>
            </TouchableOpacity>
          </View>

          {/* Limit Notice / Premium Upgrade Card */}
          {!limitCheck.allowed && limitCheck.requiresPremium && (
            <View style={[styles.premiumNoticeCard, { backgroundColor: colors.cardTranslucent, borderColor: colors.secondary }]}>
              <Ionicons name="star" size={24} color={colors.secondary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.premiumNoticeTitle, { color: colors.text }]}>{t('admin.limitReached')}</Text>
                <Text style={[styles.premiumNoticeDesc, { color: colors.textSecondary }]}>{t('admin.premiumRequired')}</Text>
              </View>
              <TouchableOpacity
                onPress={handleActivatePremium}
                style={[styles.upgradeBtn, { backgroundColor: colors.secondary }]}
              >
                <Text style={styles.upgradeBtnText}>{t('admin.activatePremium')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Student Cards List */}
          <View style={styles.studentListContainer}>
            {students.length > 0 ? (
              students.map((student) => (
                <View key={student.id}>{renderStudentCard({ item: student })}</View>
              ))
            ) : (
              <View style={[styles.emptyCard, { backgroundColor: colors.cardTranslucent, borderColor: colors.glassBorder }]}>
                <Ionicons name="people-outline" size={40} color={colors.textSecondary} />
                <Text style={[styles.emptyCardText, { color: colors.textSecondary }]}>
                  {t('student.noGrades')}
                </Text>
              </View>
            )}
          </View>

          {/* QR Scanner Simulator Modal */}
          <Modal visible={isScannerOpen} animationType="slide" transparent={true} onRequestClose={closeScanner}>
            <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
              <View style={[styles.scannerModalContainer, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}>
                <View style={[styles.scannerHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{t('admin.scanSimTitle')}</Text>
                  <TouchableOpacity onPress={closeScanner}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                {cameraPermission?.granted ? (
                  <View style={styles.cameraBox}>
                    <CameraView style={StyleSheet.absoluteFillObject} facing="back" />
                    <View style={styles.overlayScannerBox}>
                      <View style={styles.scanFrame} />
                    </View>
                  </View>
                ) : (
                  <View style={styles.cameraFallbackBox}>
                    <Ionicons name="camera-outline" size={48} color={colors.primary} />
                    <Text style={[styles.scannerDesc, { color: colors.textSecondary }]}>
                      {t('admin.scanSimDesc')}
                    </Text>
                  </View>
                )}

                {/* Quick Simulation Options for testing */}
                <Text style={[styles.simTitle, { color: colors.textSecondary }]}>{t('admin.selectStudent')}</Text>
                <View style={styles.simList}>
                  {allStudents.map((st) => (
                    <TouchableOpacity
                      key={st.id}
                      onPress={() => handleScanStudent(st.id)}
                      style={[styles.simItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                    >
                      <Ionicons name="qr-code-outline" size={18} color={colors.primary} />
                      <Text style={[styles.simItemText, { color: colors.text }]}>{st.fullName} (@{st.username})</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Button title={t('admin.closeBtn')} onPress={closeScanner} variant="secondary" containerStyle={{ marginTop: 12 }} />
              </View>
            </View>
          </Modal>

          {/* Add Grade or Edit Student Modal */}
          <Modal visible={isGradeModalOpen} animationType="fade" transparent={true} onRequestClose={closeGradeModal}>
            <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
              <View style={[styles.modalContainer, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}>
                {isConfigMode && selectedStudent ? (
                  <StudentConfigForm
                    student={selectedStudent}
                    onSave={handleSaveStudentConfig}
                    onClose={closeGradeModal}
                  />
                ) : (
                  <>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.modalTitle, { color: colors.text }]}>{t('admin.addGradeTitle')}</Text>
                      <TouchableOpacity onPress={closeGradeModal}>
                        <Ionicons name="close" size={24} color={colors.text} />
                      </TouchableOpacity>
                    </View>

                    {selectedStudent && (
                      <View style={styles.selectedStudentInfo}>
                        <Text style={[styles.selectedStudentName, { color: colors.text }]}>
                          {t('admin.studentName', { name: selectedStudent.fullName })}
                        </Text>
                        <Text style={[styles.selectedStudentDetails, { color: colors.textSecondary }]}>
                          {t('student.average')}: {selectedStudent.average} | {t('home.points')}: {selectedStudent.points}
                        </Text>
                      </View>
                    )}

                    {alertMessage && (
                      <View
                        style={[
                          styles.alertBox,
                          alertType === 'reward' && styles.alertReward,
                          alertType === 'punish' && styles.alertPunish,
                          alertType === 'error' && styles.alertError,
                        ]}
                      >
                        <Text style={styles.alertText}>{alertMessage}</Text>
                      </View>
                    )}

                    {!alertMessage && (
                      <>
                        <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{t('admin.gradeSystem')}</Text>
                        <View style={styles.systemSelectorRow}>
                          <TouchableOpacity
                            onPress={() => setGradingSystem('percentage')}
                            style={[
                              styles.systemChip,
                              { borderColor: colors.border, backgroundColor: colors.background },
                              gradingSystem === 'percentage' && { backgroundColor: colors.primary, borderColor: colors.primary },
                            ]}
                          >
                            <Text style={[styles.systemChipText, { color: gradingSystem === 'percentage' ? colors.white : colors.text }]}>
                              {t('admin.base100')}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => setGradingSystem('decimal')}
                            style={[
                              styles.systemChip,
                              { borderColor: colors.border, backgroundColor: colors.background },
                              gradingSystem === 'decimal' && { backgroundColor: colors.primary, borderColor: colors.primary },
                            ]}
                          >
                            <Text style={[styles.systemChipText, { color: gradingSystem === 'decimal' ? colors.white : colors.text }]}>
                              {t('admin.base10')}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => setGradingSystem('letters')}
                            style={[
                              styles.systemChip,
                              { borderColor: colors.border, backgroundColor: colors.background },
                              gradingSystem === 'letters' && { backgroundColor: colors.primary, borderColor: colors.primary },
                            ]}
                          >
                            <Text style={[styles.systemChipText, { color: gradingSystem === 'letters' ? colors.white : colors.text }]}>
                              {t('admin.alphabetical')}
                            </Text>
                          </TouchableOpacity>
                        </View>

                        <Input
                          label={t('admin.submitBtn')}
                          placeholder={
                            gradingSystem === 'percentage'
                              ? 'Ej. 85'
                              : gradingSystem === 'decimal'
                              ? 'Ej. 8.5'
                              : 'Ej. A, B, C, D o F'
                          }
                          value={gradeValue}
                          onChangeText={setGradeValue}
                        />

                        <Button
                          title={t('admin.submitBtn')}
                          onPress={validateAndAddGrade}
                          containerStyle={{ marginTop: 12 }}
                        />
                      </>
                    )}

                    {alertMessage && (
                      <Button
                        title={t('admin.closeBtn')}
                        onPress={closeGradeModal}
                        containerStyle={{ marginTop: 12 }}
                      />
                    )}
                  </>
                )}
              </View>
            </View>
          </Modal>

          {/* Create Profile Modal */}
          <Modal visible={isCreateModalOpen} animationType="slide" transparent={true} onRequestClose={closeCreateModal}>
            <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
              <View style={[styles.modalContainer, { backgroundColor: colors.card, borderColor: colors.glassBorder }]}>
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>{t('admin.createProfileTitle')}</Text>
                  <TouchableOpacity onPress={closeCreateModal}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <Input
                  label={t('admin.fullName')}
                  placeholder={t('admin.fullNamePlaceholder')}
                  value={newStudentName}
                  onChangeText={setNewStudentName}
                />

                <Input
                  label={t('admin.username')}
                  placeholder={t('admin.usernamePlaceholder')}
                  value={newStudentUsername}
                  onChangeText={setNewStudentUsername}
                />

                <Button
                  title={t('admin.createBtn')}
                  onPress={handleCreateStudent}
                  containerStyle={{ marginTop: 12 }}
                />
              </View>
            </View>
          </Modal>

          {/* Period Assignment Modal Component */}
          <PeriodAssignmentModal
            visible={isPeriodModalOpen}
            onClose={closePeriodModal}
            onSuccess={() => {
              reloadFromDb();
            }}
          />
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
    gap: 6,
    marginBottom: theme.spacing.sm,
  },
  backButtonText: {
    ...theme.typography.caption,
    fontWeight: '700',
  },
  dashboardTitle: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.md,
  },
  topActionsRow: {
    marginBottom: theme.spacing.lg,
  },
  primaryActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.roundness.lg,
    gap: theme.spacing.md,
  },
  scannerIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionTitle: {
    ...theme.typography.h2,
    fontSize: 18,
    color: '#ffffff',
  },
  primaryActionDesc: {
    ...theme.typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h2,
    fontSize: 18,
  },
  sectionCountText: {
    ...theme.typography.caption,
  },
  addProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.roundness.full,
    gap: 6,
  },
  addProfileBtnText: {
    ...theme.typography.caption,
    color: '#ffffff',
    fontWeight: '700',
  },
  premiumNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  premiumNoticeTitle: {
    ...theme.typography.bodySemibold,
    fontSize: 14,
  },
  premiumNoticeDesc: {
    ...theme.typography.caption,
    fontSize: 11,
    marginTop: 2,
  },
  upgradeBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.roundness.md,
  },
  upgradeBtnText: {
    ...theme.typography.caption,
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 11,
  },
  studentListContainer: {
    gap: theme.spacing.md,
  },
  studentCard: {
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    padding: theme.spacing.md,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentTextDetails: {
    flex: 1,
  },
  studentNameText: {
    ...theme.typography.bodySemibold,
    fontSize: 16,
  },
  studentUserText: {
    ...theme.typography.caption,
    fontSize: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  miniBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.roundness.full,
  },
  miniBadgeText: {
    ...theme.typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.roundness.md,
    gap: 6,
  },
  actionBtnText: {
    ...theme.typography.caption,
    color: '#ffffff',
    fontWeight: '700',
  },
  configBtn: {
    flex: 0,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
  },
  emptyCard: {
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCardText: {
    ...theme.typography.caption,
    marginTop: theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContainer: {
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    ...theme.typography.h2,
    fontSize: 18,
  },
  scannerModalContainer: {
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    maxHeight: '85%',
    borderWidth: 1,
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    marginBottom: theme.spacing.md,
  },
  cameraBox: {
    height: 200,
    borderRadius: theme.roundness.md,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  cameraFallbackBox: {
    height: 140,
    borderRadius: theme.roundness.md,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  scannerDesc: {
    ...theme.typography.caption,
    textAlign: 'center',
    marginTop: 8,
  },
  overlayScannerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 140,
    height: 140,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: theme.roundness.md,
  },
  simTitle: {
    ...theme.typography.caption,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    fontSize: 10,
  },
  simList: {
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  simItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.roundness.md,
    borderWidth: 1,
    gap: 8,
  },
  simItemText: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  selectedStudentInfo: {
    marginBottom: theme.spacing.md,
  },
  selectedStudentName: {
    ...theme.typography.bodySemibold,
    fontSize: 16,
  },
  selectedStudentDetails: {
    ...theme.typography.caption,
    marginTop: 2,
  },
  fieldLabel: {
    ...theme.typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 10,
    marginBottom: theme.spacing.xs,
  },
  systemSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  systemChip: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.roundness.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  systemChipText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  alertBox: {
    padding: theme.spacing.md,
    borderRadius: theme.roundness.md,
    marginBottom: theme.spacing.md,
  },
  alertReward: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  alertPunish: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  alertError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  alertText: {
    ...theme.typography.bodySemibold,
    fontSize: 13,
    textAlign: 'center',
  },
});

export default AdminDashboard;
