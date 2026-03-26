import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

const translations = {
  en: {
    today: 'Today',
    calendar: 'Calendar',
    settings: 'Settings',
    profile: 'Profile',
    language: 'Language',
    theme: 'Dark Theme',
    stats: 'Statistics',
    about: 'About App',
  },
  be: {
    today: 'Сёння',
    calendar: 'Каляндар',
    settings: 'Налады',
    profile: 'Профіль',
    language: 'Мова',
    theme: 'Цёмная тэма',
    stats: 'Статыстыка',
    about: 'Пра праграму',
  },
};

export const i18n = new I18n(translations);

i18n.locale = Localization.getLocales()[0].languageCode === 'be' ? 'be' : 'en';
i18n.enableFallback = true;