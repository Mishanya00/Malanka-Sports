import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { BACKEND_URL } from '../constants/api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export type AuthUser = {
  user_id: number;
  username: string;
  avatar_url: string | null;
};

type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  isAuthLoaded: boolean;
  isAuthenticating: boolean;
  signIn: (username: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => Promise<void>;
  setAvatarUrl: (url: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [t, u] = await Promise.all([
          AsyncStorage.getItem(TOKEN_KEY),
          AsyncStorage.getItem(USER_KEY),
        ]);
        if (t) setToken(t);
        if (u) setUser(JSON.parse(u));
      } catch (e) {
        console.error('Auth load error', e);
      } finally {
        setIsAuthLoaded(true);
      }
    })();
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    setIsAuthenticating(true);
    try {
      const resp = await fetch(`${BACKEND_URL}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (!resp.ok) {
        const detail = await resp.json().catch(() => ({ detail: 'Auth failed' }));
        return { ok: false as const, error: detail.detail || `HTTP ${resp.status}` };
      }

      const data = await resp.json();
      const nextUser: AuthUser = {
        user_id: data.user_id,
        username: data.username,
        avatar_url: data.avatar_url ?? null,
      };

      await AsyncStorage.setItem(TOKEN_KEY, data.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(nextUser));

      setToken(data.token);
      setUser(nextUser);

      return { ok: true as const };
    } catch (e: any) {
      return { ok: false as const, error: e?.message || 'Network error' };
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setToken(null);
    setUser(null);
  }, []);

  const setAvatarUrl = useCallback(async (url: string) => {
    setUser((prev) => {
      const next = prev ? { ...prev, avatar_url: url } : prev;
      if (next) AsyncStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isAuthLoaded, isAuthenticating, signIn, signOut, setAvatarUrl }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
