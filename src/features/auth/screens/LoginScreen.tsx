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
import { useTheme } from '../../../context/ThemeContext';

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

  const { isDark, toggleTheme, colors } = useTheme();

  const onSubmit = async () => {
    await handleLogin();
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
            <View
              style={[
                styles.logoCircle,
                {
                  backgroundColor: colors.primary + '20',
                  borderColor: colors.primary + '40',
                },
              ]}
            >
              <Ionicons name="school" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.appName, { color: colors.primary }]}>EduReward</Text>
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
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('login.title')}</Text>

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
        </ScrollView>
      </KeyboardAvoidingView>
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
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  appName: {
    ...theme.typography.h1,
    fontSize: 32,
    marginBottom: theme.spacing.xs,
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
