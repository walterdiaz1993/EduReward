import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../store/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { theme } from '../../../config/theme';
import Button from '../../../components/Button';

interface ProfileScreenProps {
  onBackToHome?: () => void;
  onActivateTeacherPremium?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onActivateTeacherPremium }) => {
  const { t, i18n } = useTranslation();
  const { user, logout, updateUser } = useAuth();
  const { isDark, toggleTheme, colors } = useTheme();

  if (!user) return null;

  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      const { supabase } = require('../../../lib/supabase');
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      Alert.alert('Éxito', 'Contraseña actualizada con éxito');
      setIsPasswordModalOpen(false);
      setNewPassword('');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo actualizar la contraseña');
    }
  };

  const isTeacher = user.role === 'teacher';
  const isTutor = user.role === 'tutor';

  const handleActivatePremium = () => {
    updateUser({ isPremium: true });
    if (onActivateTeacherPremium) {
      onActivateTeacherPremium();
    }
    Alert.alert('¡Cuenta Premium Activada!', t('profile.premiumActivated'));
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(nextLang);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profile.deleteAccountConfirmTitle'),
      t('profile.deleteAccountConfirmBody'),
      [
        { text: t('profile.deleteAccountCancel'), style: 'cancel' },
        {
          text: t('profile.deleteAccountConfirmBtn'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            Alert.alert(t('common.error'), t('profile.accountDeleted'));
          },
        },
      ],
    );
  };

  const getRoleLabel = () => {
    if (isTeacher) {
      return user.isPremium ? t('profile.teacherPremium') : t('profile.teacherFree');
    }
    if (isTutor) {
      return t('profile.tutorAccount');
    }
    return t('profile.studentAccount');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>{t('profile.title')}</Text>
        </View>

        {/* User Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.cardTranslucent,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <View style={styles.avatarRow}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' },
              ]}
            >
              <Ionicons
                name={isTeacher ? 'briefcase' : isTutor ? 'people' : 'school'}
                size={36}
                color={colors.primary}
              />
            </View>
            <View style={styles.userInfoText}>
              <Text style={[styles.fullNameText, { color: colors.text }]}>{user.fullName}</Text>
              <Text style={[styles.usernameText, { color: colors.textSecondary }]}>
                @{user.username} • {user.email}
              </Text>
              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: user.isPremium ? '#eab30820' : colors.primary + '15' },
                ]}
              >
                <Ionicons
                  name={user.isPremium ? 'star' : 'shield-checkmark-outline'}
                  size={14}
                  color={user.isPremium ? '#eab308' : colors.primary}
                />
                <Text
                  style={[
                    styles.roleBadgeText,
                    { color: user.isPremium ? '#eab308' : colors.primary },
                  ]}
                >
                  {getRoleLabel()}
                </Text>
              </View>
            </View>
          </View>

          {/* Points Pill */}
          <View style={[styles.pointsBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Ionicons name="trophy-outline" size={20} color="#f59e0b" />
            <Text style={[styles.pointsText, { color: colors.text }]}>
              {user.points} <Text style={{ color: colors.textSecondary, fontWeight: '400' }}>{t('home.points')}</Text>
            </Text>
          </View>
        </View>

        {/* Premium Upgrade for Teachers */}
        {isTeacher && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.cardTranslucent,
                borderColor: user.isPremium ? '#eab30860' : colors.glassBorder,
              },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <Ionicons name="sparkles" size={22} color={user.isPremium ? '#eab308' : colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>Módulo Premium Docente</Text>
            </View>
            <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
              {user.isPremium
                ? t('admin.premiumActive')
                : t('admin.premiumRequired')}
            </Text>

            {!user.isPremium && (
              <Button
                title={t('profile.activatePremiumBtn')}
                onPress={handleActivatePremium}
                containerStyle={styles.premiumButton}
              />
            )}
          </View>
        )}

        {/* Appearance & Language */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.cardTranslucent,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text, marginBottom: theme.spacing.md }]}>
            Ajustes de Interfaz
          </Text>

          <TouchableOpacity
            onPress={toggleTheme}
            style={[styles.settingRow, { borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingLabelRow}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.primary} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t('profile.themeSection')}</Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.primary }]}>
              {isDark ? t('profile.themeDark') : t('profile.themeLight')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleLanguage}
            style={[styles.settingRow, { borderBottomWidth: 0 }]}
            activeOpacity={0.7}
          >
            <View style={styles.settingLabelRow}>
              <Ionicons name="globe-outline" size={20} color={colors.secondary} />
              <Text style={[styles.settingText, { color: colors.text }]}>{t('profile.languageSection')}</Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.secondary }]}>
              {i18n.language === 'es' ? 'Español (ES)' : 'English (EN)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.cardTranslucent,
              borderColor: colors.glassBorder,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => setIsPasswordModalOpen(true)}
            style={[styles.actionButtonRow, { backgroundColor: colors.secondary + '12', borderColor: colors.secondary + '30', marginBottom: theme.spacing.sm }]}
            activeOpacity={0.7}
          >
            <Ionicons name="key-outline" size={20} color={colors.secondary} />
            <Text style={[styles.actionButtonText, { color: colors.secondary }]}>Cambiar Contraseña</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={logout}
            style={[styles.actionButtonRow, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30' }]}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>{t('common.logout')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteAccount}
            style={[styles.actionButtonRow, styles.deleteButtonRow]}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={20} color={colors.error} />
            <Text style={[styles.actionButtonText, { color: colors.error }]}>{t('profile.deleteAccount')}</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={isPasswordModalOpen} animationType="fade" transparent={true} onRequestClose={() => setIsPasswordModalOpen(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ width: '100%', backgroundColor: colors.card, padding: 20, borderRadius: theme.roundness.lg, borderColor: colors.border, borderWidth: 1 }}>
              <Text style={{ ...theme.typography.h2, color: colors.text, marginBottom: 15 }}>Cambiar Contraseña</Text>
              
              <Text style={{ ...theme.typography.caption, color: colors.textSecondary, marginBottom: 5 }}>Nueva Contraseña</Text>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  color: colors.text,
                  padding: 12,
                  borderRadius: theme.roundness.md,
                  marginBottom: 20
                }}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colors.textSecondary}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <Button title="Cancelar" variant="secondary" onPress={() => setIsPasswordModalOpen(false)} containerStyle={{ flex: 1 }} />
                <Button title="Guardar" onPress={handleChangePassword} containerStyle={{ flex: 1 }} />
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 115,
  },
  headerTitleRow: {
    marginBottom: theme.spacing.md,
  },
  pageTitle: {
    ...theme.typography.h1,
    fontSize: 24,
  },
  card: {
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  userInfoText: {
    flex: 1,
  },
  fullNameText: {
    ...theme.typography.h2,
    fontSize: 18,
    marginBottom: 2,
  },
  usernameText: {
    ...theme.typography.caption,
    fontSize: 12,
    marginBottom: 6,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.roundness.full,
    gap: 4,
  },
  roleBadgeText: {
    ...theme.typography.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  pointsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.roundness.md,
    borderWidth: 1,
    gap: 6,
  },
  pointsText: {
    ...theme.typography.bodySemibold,
    fontSize: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
    gap: 6,
  },
  cardTitle: {
    ...theme.typography.h2,
    fontSize: 16,
  },
  cardSubtitle: {
    ...theme.typography.caption,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  premiumButton: {
    marginTop: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
  },
  settingLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingText: {
    ...theme.typography.body,
    fontSize: 15,
  },
  settingValue: {
    ...theme.typography.caption,
    fontWeight: '600',
  },
  actionButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.roundness.md,
    borderWidth: 1,
    marginBottom: theme.spacing.sm,
    gap: 8,
  },
  deleteButtonRow: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 0,
  },
  actionButtonText: {
    ...theme.typography.button,
    fontSize: 15,
  },
});

export default ProfileScreen;
