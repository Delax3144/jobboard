import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en }
    },
    lng: 'en',
    supportedLngs: ['en'],
    fallbackLng: 'en', // Язык по умолчанию, если что-то пойдет не так
    interpolation: {
      escapeValue: false, // React сам защищает от XSS атак
    }
  });

export default i18n;
