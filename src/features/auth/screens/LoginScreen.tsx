import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../config/theme';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import useLogin from '../hooks/useLogin';
import { useTheme } from '../../../context/ThemeContext';

export const LoginScreen: React.FC = () => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [recoverUser, setRecoverUser] = useState('');
  const [recoverPass, setRecoverPass] = useState('');

  const {
    email,
    setEmail,
    username,
    setUsername,
    password,
    setPassword,
    fullName,
    setFullName,
    role,
    setRole,
    isSignUpMode,
    toggleMode,
    isLoading,
    validationError,
    handleSubmit,
    toggleLanguage,
    currentLanguage,
    handleEmergencyPasswordReset,
    setValidationError,
    t,
  } = useLogin();

  const { isDark, toggleTheme, colors } = useTheme();

  const onSubmit = async () => {
    await handleSubmit();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={toggleTheme}
              style={[
                styles.languageButton,
                {
                  marginRight: theme.spacing.sm,
                  backgroundColor: colors.cardTranslucent,
                  borderColor: colors.glassBorder,
                },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={toggleLanguage}
              style={[
                styles.languageButton,
                {
                  backgroundColor: colors.cardTranslucent,
                  borderColor: colors.glassBorder,
                },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="globe-outline"
                size={16}
                color={colors.primary}
                style={styles.languageIcon}
              />
              <Text style={[styles.languageText, { color: colors.primary }]}>
                {currentLanguage === 'es' ? 'EN' : 'ES'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Image 
                source={require('../../../../assets/logoedurewardfondo.png')} 
                style={{ width: '100%', height: '100%', resizeMode: 'contain' }} 
              />
            </View>
            <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>
              {t('login.subtitle')}
            </Text>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.cardTranslucent,
                borderColor: colors.glassBorder,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {isSignUpMode ? t('login.titleSignUp') : t('login.title')}
            </Text>

            {validationError && (
              <View style={[styles.errorBanner, { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: colors.error }]}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={colors.error}
                  style={styles.errorIcon}
                />
                <Text style={[styles.errorBannerText, { color: colors.error }]}>{validationError}</Text>
              </View>
            )}

            {isSignUpMode && (
              <>
                <Input
                  label={t('login.nameLabel')}
                  placeholder={t('login.namePlaceholder')}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
                
                <Input
                  label={t('login.usernameLabel')}
                  placeholder={t('login.usernamePlaceholder')}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                <View style={{ marginBottom: theme.spacing.md }}>
                  <Text style={{ ...theme.typography.caption, color: colors.textSecondary, marginBottom: theme.spacing.xs, fontWeight: '600' }}>
                    {t('login.roleLabel') || 'Selecciona tu Rol'}
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    {(['tutor', 'teacher'] as const).map((r) => {
                      const isSelected = role === r;
                      return (
                        <TouchableOpacity
                          key={r}
                          onPress={() => setRole(r)}
                          style={{
                            flex: 1,
                            marginHorizontal: 4,
                            paddingVertical: 10,
                            borderRadius: theme.roundness.md,
                            borderWidth: 1,
                            borderColor: isSelected ? colors.primary : colors.glassBorder,
                            backgroundColor: isSelected ? colors.primary : 'transparent',
                            alignItems: 'center',
                          }}
                        >
                          <Text style={{ 
                            ...theme.typography.caption,
                            fontWeight: isSelected ? 'bold' : 'normal',
                            color: isSelected ? '#fff' : colors.textSecondary 
                          }}>
                            {r.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </>
            )}

            <Input
              label={isSignUpMode ? t('login.emailLabel') : t('login.usernameLabel') + ' o ' + t('login.emailLabel')}
              placeholder={isSignUpMode ? t('login.emailPlaceholder') : 'tu@email.com o username'}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType={isSignUpMode ? "email-address" : "default"}
              autoCorrect={false}
            />

            <Input
              label={t('login.passwordLabel')}
              placeholder={t('login.passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Button
              title={isSignUpMode ? t('login.buttonSignUp') : t('login.button')}
              onPress={onSubmit}
              isLoading={isLoading}
              containerStyle={styles.submitButton}
            />

            {!isSignUpMode && (
              <TouchableOpacity style={{ marginTop: 15, alignItems: 'center' }} onPress={() => setIsResetModalOpen(true)}>
                <Text style={{ color: colors.textSecondary, ...theme.typography.caption }}>
                  ¿Olvidaste tu contraseña?
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={toggleMode}>
              <Text style={{ color: colors.primary, ...theme.typography.caption, fontWeight: 'bold' }}>
                {isSignUpMode ? t('login.haveAccount') : t('login.noAccount')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={isResetModalOpen} animationType="fade" transparent={true} onRequestClose={() => setIsResetModalOpen(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={{ width: '100%', backgroundColor: colors.card, padding: 24, borderRadius: theme.roundness.lg, borderColor: colors.border, borderWidth: 1 }}>
            <Text style={{ ...theme.typography.h2, color: colors.text, marginBottom: 20 }}>Recuperar Contraseña</Text>
            
            <Input
              label="Username o Correo"
              placeholder="Ej. marcos123"
              value={recoverUser}
              onChangeText={setRecoverUser}
              autoCapitalize="none"
            />
            
            <Input
              label="Nueva Contraseña"
              placeholder="Mínimo 6 caracteres"
              value={recoverPass}
              onChangeText={setRecoverPass}
              secureTextEntry
            />

            {validationError && (
              <View style={[styles.errorBanner, { borderColor: colors.error, backgroundColor: colors.error + '10', marginBottom: 15 }]}>
                <Ionicons name="warning" size={16} color={colors.error} style={styles.errorIcon} />
                <Text style={[styles.errorBannerText, { color: colors.error }]}>{validationError}</Text>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <Button 
                title="Cancelar" 
                variant="secondary" 
                onPress={() => { setIsResetModalOpen(false); setValidationError(null); }} 
                containerStyle={{ flex: 1 }} 
              />
              <Button 
                title="Cambiar" 
                isLoading={isLoading}
                onPress={async () => {
                  const success = await handleEmergencyPasswordReset(recoverUser, recoverPass);
                  if (success) {
                    Alert.alert('Éxito', 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.');
                    setIsResetModalOpen(false);
                  }
                }} 
                containerStyle={{ flex: 1 }} 
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  headerActions: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.roundness.full,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  languageIcon: {
    marginRight: theme.spacing.xs,
  },
  languageText: {
    ...theme.typography.caption,
    fontWeight: '700',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  appSubtitle: {
    ...theme.typography.caption,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
    lineHeight: 18,
  },
  card: {
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardTitle: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.roundness.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  errorIcon: {
    marginRight: theme.spacing.sm,
  },
  errorBannerText: {
    ...theme.typography.caption,
    fontWeight: '600',
    flex: 1,
  },
  submitButton: {
    marginTop: theme.spacing.sm,
  },
});

export default LoginScreen;
