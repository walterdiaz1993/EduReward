import React, { useRef } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { theme } from '../../../config/theme';
import { StudentWithGrades } from '../../../mocks/userMock';
import QRCodeView from '../../../components/QRCodeView';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

interface StudentCardModalProps {
  visible: boolean;
  student: StudentWithGrades | null;
  onClose: () => void;
  onScanThisStudent: (studentId: string) => void;
}

export const StudentCardModal: React.FC<StudentCardModalProps> = ({
  visible,
  student,
  onClose,
  onScanThisStudent,
}) => {
  const { colors } = useTheme();
  const cardRef = useRef<View>(null);

  if (!visible || !student) return null;

  const handleDownloadCard = async () => {
    try {
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          dialogTitle: 'Compartir o Guardar Carnet',
          mimeType: 'image/png',
        });
      } else {
        Alert.alert('Error', 'La función de compartir no está disponible en este dispositivo');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo capturar el carnet');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Top Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="card-outline" size={22} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.text }]}>Carnet Estudiantil</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={handleDownloadCard} style={styles.closeBtn}>
                <Ionicons name="download-outline" size={22} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* ID Card Graphic Container */}
            <View ref={cardRef} collapsable={false} style={[styles.idCardContainer, { backgroundColor: colors.background, borderColor: colors.primary }]}>
              {/* ID Card Banner Header */}
              <View style={[styles.cardHeaderBanner, { backgroundColor: colors.primary }]}>
                <View style={styles.bannerRow}>
                  <Ionicons name="school" size={22} color="#ffffff" />
                  <View>
                    <Text style={styles.bannerTitle}>EduReward</Text>
                    <Text style={styles.bannerSubtitle}>Carnet de Identificación Estudiantil</Text>
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
                      {student.fullName}
                    </Text>
                    <Text style={[styles.studentUsername, { color: colors.textSecondary }]}>
                      @{student.username}
                    </Text>
                    <View style={styles.badgePillRow}>
                      <View style={[styles.roleBadge, { backgroundColor: colors.secondary + '20' }]}>
                        <Text style={[styles.roleBadgeText, { color: colors.secondary }]}>
                          Estudiante
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* QR Code Section */}
                <View style={[styles.qrSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.qrTitleLabel, { color: colors.textSecondary }]}>
                    CÓDIGO QR PARA ESCANEAR NOTAS
                  </Text>

                  <View style={{ marginVertical: 8, alignItems: 'center' }}>
                    <QRCodeView value={student.id} size={190} color="#000000" backgroundColor="#ffffff" />
                  </View>

                  <Text style={[styles.qrInstructions, { color: colors.textSecondary }]}>
                    Escanea este código QR con la cámara para abrir directamente el registro de calificaciones de {student.fullName}.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Action Footer Buttons */}
          <View style={styles.actionsFooter}>
            <TouchableOpacity
              style={[styles.scanActionBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                onClose();
                onScanThisStudent(student.id);
              }}
            >
              <Ionicons name="qr-code-outline" size={18} color="#ffffff" />
              <Text style={styles.scanActionBtnText}>Registrar Nota con este QR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.closeActionBtn, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.closeActionBtnText, { color: colors.textSecondary }]}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    borderRadius: theme.roundness.lg,
    borderWidth: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
  },
  modalTitle: {
    ...theme.typography.h2,
    fontSize: 17,
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  idCardContainer: {
    borderRadius: theme.roundness.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  cardHeaderBanner: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bannerTitle: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '500',
  },
  cardBody: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileTextGroup: {
    flex: 1,
    gap: 2,
  },
  studentFullName: {
    ...theme.typography.h2,
    fontSize: 17,
  },
  studentUsername: {
    ...theme.typography.caption,
    fontSize: 12,
  },
  badgePillRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  avgBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  avgBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  qrSection: {
    borderRadius: theme.roundness.md,
    borderWidth: 1,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: 8,
  },
  qrTitleLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  qrWrapper: {
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 1.5,
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  studentIdTag: {
    fontFamily: undefined,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  qrInstructions: {
    ...theme.typography.caption,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
  actionsFooter: {
    gap: 8,
  },
  scanActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.roundness.md,
    gap: 8,
  },
  scanActionBtnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  closeActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: theme.roundness.md,
    borderWidth: 1,
  },
  closeActionBtnText: {
    fontWeight: '600',
    fontSize: 13,
  },
});

export default StudentCardModal;
