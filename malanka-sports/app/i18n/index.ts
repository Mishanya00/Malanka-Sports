import * as Localization from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      today: 'Today',
      calendar: 'Calendar',
      settings: 'Settings',
      profile: 'Profile',
      language: 'Language',
      theme: 'Dark Theme',
      stats: 'Statistics',
      about: 'About App',
    },
  },
  be: {
    translation: {
      today: 'Сёння',
      calendar: 'Каляндар',
      settings: 'Налады',
      profile: 'Профіль',
      language: 'Мова',
      theme: 'Цёмная тэма',
      stats: 'Статыстыка',
      about: 'Пра праграму',
    },
  },
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.getLocales()[0].languageCode === 'be' ? 'be' : 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;