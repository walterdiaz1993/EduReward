import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../config/theme';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import useLogin from '../hooks/useLogin';

export const LoginScreen: React.FC = () => {
  const {
    username,
    setUsername,
    password,
    setPassword,
    isLoading,
    validationError,
    handleLogin,
    toggleLanguage,
    currentLanguage,
    t,
  } = useLogin();

  const onSubmit = async () => {
    await handleLogin();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
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
              onPress={toggleLanguage}
              style={styles.languageButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name="globe-outline"
                size={16}
                color={theme.colors.primary}
                style={styles.languageIcon}
              />
              <Text style={styles.languageText}>
                {currentLanguage === 'es' ? 'EN' : 'ES'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.logoSection}>
            <View style={styles.logoCircle}>
              <Ionicons name="school" size={40} color={theme.colors.primary} />
            </View>
            <Text style={styles.appName}>EduReward</Text>
            <Text style={styles.appSubtitle}>{t('login.subtitle')}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('login.title')}</Text>

            {validationError && (
              <View style={styles.errorBanner}>
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={theme.colors.error}
                  style={styles.errorIcon}
                />
                <Text style={styles.errorBannerText}>{validationError}</Text>
              </View>
            )}

            <Input
              label={t('login.usernameLabel')}
              placeholder={t('login.usernamePlaceholder')}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
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
              title={t('login.button')}
              onPress={onSubmit}
              isLoading={isLoading}
              containerStyle={styles.submitButton}
            />
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              v1.0.0 • React Native & i18n
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    zIndex: 10,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.roundness.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.black,
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
    fontWeight: '600',
    color: theme.colors.primary,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  appName: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  appSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.roundness.lg,
    padding: theme.spacing.lg,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: theme.colors.error,
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
    color: theme.colors.error,
    fontWeight: '600',
    flex: 1,
  },
  submitButton: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
});
export default LoginScreen;
