import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from '../i18n/locales/en.json';
import es from '../i18n/locales/es.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
};

const getDeviceLanguage = (): string => {
  try {
    const locales = Localization.getLocales();
    if (locales && locales.length > 0) {
      const languageCode = locales[0].languageCode;
      if (languageCode === 'es' || languageCode === 'en') {
        return languageCode;
      }
    }
  } catch (error) {
    console.warn(error);
  }
  return 'es';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    compatibilityJSON: 'v4',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
