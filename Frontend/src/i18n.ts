// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ru from './locales/ru.json';

i18n
  .use(LanguageDetector) // Автоматически определяет язык браузера и сохраняет выбор юзера
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru }
    },
    fallbackLng: 'en', // Язык по умолчанию, если что-то пойдет не так
    interpolation: {
      escapeValue: false, // React сам защищает от XSS атак
    }
  });

export default i18n;