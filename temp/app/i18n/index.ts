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
      profileDetails: 'Profile Details',
      addExercise: 'Add Exercise',
      title: 'Exercise Name',
      reps: 'Reps (e.g., 3x20)',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      noExercises: 'No exercises planned for today. Tap + to add!',
      editExercise: 'Edit Exercise',
      edit: 'Edit',
      news: 'Sports News',
      offlineMode: 'Offline Mode (Cached Data)',
      readMore: 'Read More',
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
      profileDetails: 'Дэталі профілю',
      addExercise: 'Дадаць практыкаванне',
      title: 'Назва практыкавання',
      reps: 'Паўторы (напр. 3x20)',
      save: 'Захаваць',
      cancel: 'Адмена',
      delete: 'Выдаліць',
      noExercises: 'На сёння няма практыкаванняў. Націсніце + каб дадаць!',
      editExercise: 'Змяніць практыкаванне',
      edit: 'Змяніць',
      news: 'Спартыўныя навіны',
      offlineMode: 'Афлайн рэжым (Кэш)',
      readMore: 'Чытаць далей',
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