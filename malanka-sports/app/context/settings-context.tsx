import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { i18n } from '../i18n';

type SettingsContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  locale: string;
  changeLocale: (lang: 'en' | 'be') => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = useColorScheme() === 'dark';
  const [isDark, setIsDark] = useState(systemTheme);
  const [locale, setLocale] = useState(i18n.locale);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const appTheme = await AsyncStorage.getItem('theme');
        const appLang = await AsyncStorage.getItem('language');
        
        if (appTheme) setIsDark(appTheme === 'dark');
        if (appLang) {
          setLocale(appLang);
          i18n.locale = appLang;
        }
      } catch (e) {
        console.error("Failed to load application settings");
      }
    };
    loadSettings();
  }, []);

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const changeLocale = async (lang: 'en' | 'be') => {
    setLocale(lang);
    i18n.locale = lang;
    await AsyncStorage.setItem('language', lang);
  };

  return (
    <SettingsContext.Provider value={{ isDark, toggleTheme, locale, changeLocale }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
};