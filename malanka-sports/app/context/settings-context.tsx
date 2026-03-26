import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { i18n } from '../i18n';

type SettingsContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  locale: string;
  changeLocale: (lang: 'en' | 'be') => void;
  isSettingsLoaded: boolean;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = useColorScheme() === 'dark';
  const [isDark, setIsDark] = useState(systemTheme);
  const [locale, setLocale] = useState(i18n.locale);
  const [isSettingsLoaded, setIsSettingsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        const savedLang = await AsyncStorage.getItem('language');
        
        if (savedTheme !== null) setIsDark(savedTheme === 'dark');
        if (savedLang !== null) {
          setLocale(savedLang);
          i18n.locale = savedLang;
        }
      } catch (e) {
        console.error("Settings load error", e);
      } finally {
        setIsSettingsLoaded(true);
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
    i18n.locale = lang;
    setLocale(lang);
    await AsyncStorage.setItem('language', lang);
  };

  return (
    <SettingsContext.Provider value={{ isDark, toggleTheme, locale, changeLocale, isSettingsLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
};