import AsyncStorage from '@react-native-async-storage/async-storage';

import { BACKEND_URL } from '../constants/api';
import { db } from '../database/db';

const lastSyncKey = (userId: number) => `last_sync_ts_${userId}`;

type RemoteExercise = {
  id: number;
  title: string;
  reps: string;
  date: string;
  status: string;
  is_deleted: boolean;
  updated_at: number;
};

const getLastSync = async (userId: number): Promise<number> => {
  const v = await AsyncStorage.getItem(lastSyncKey(userId));
  return v ? parseInt(v, 10) || 0 : 0;
};

const setLastSync = async (userId: number, ts: number) => {
  await AsyncStorage.setItem(lastSyncKey(userId), String(ts));
};

const mergeRemoteIntoLocal = (userId: number, remote: RemoteExercise[]) => {
  for (const r of remote) {
    const existing = db.getFirstSync(
      'SELECT id, updated_at FROM exercises WHERE id = ? AND user_id = ?',
      [r.id, userId]
    ) as { id: number; updated_at: number } | null;

    if (!existing) {
      db.runSync(
        'INSERT INTO exercises (id, user_id, title, reps, date, status, is_deleted, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [r.id, userId, r.title, r.reps, r.date, r.status, r.is_deleted ? 1 : 0, r.updated_at]
      );
    } else if ((existing.updated_at || 0) < r.updated_at) {
      db.runSync(
        'UPDATE exercises SET title = ?, reps = ?, date = ?, status = ?, is_deleted = ?, updated_at = ? WHERE id = ? AND user_id = ?',
        [r.title, r.reps, r.date, r.status, r.is_deleted ? 1 : 0, r.updated_at, r.id, userId]
      );
    }
  }
};

export const syncDataWithBackend = async (token: string | null, userId: number | null) => {
  if (!token || !userId) return;
  try {
    const since = await getLastSync(userId);
    const local = db.getAllSync(
      'SELECT id, title, reps, date, status, is_deleted, updated_at FROM exercises WHERE user_id = ? AND updated_at > ?',
      [userId, since]
    ) as any[];

    const payload = {
      since,
      exercises: local.map((e) => ({
        id: e.id,
        title: e.title,
        reps: e.reps,
        date: e.date,
        status: e.status,
        is_deleted: !!e.is_deleted,
        updated_at: e.updated_at,
      })),
    };

    const response = await fetch(`${BACKEND_URL}/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.warn('Sync HTTP error', response.status);
      return;
    }

    const result = await response.json();
    if (Array.isArray(result.exercises)) {
      mergeRemoteIntoLocal(userId, result.exercises);
    }
    if (typeof result.server_time === 'number') {
      await setLastSync(userId, result.server_time);
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
};

export const pollUpdates = async (token: string | null, userId: number | null): Promise<boolean> => {
  if (!token || !userId) return false;
  try {
    const since = await getLastSync(userId);
    const response = await fetch(`${BACKEND_URL}/exercises/updates?since=${since}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return false;
    const result = await response.json();

    const changes = Array.isArray(result.exercises) ? (result.exercises as RemoteExercise[]) : [];
    if (changes.length > 0) {
      mergeRemoteIntoLocal(userId, changes);
    }
    if (typeof result.server_time === 'number') {
      await setLastSync(userId, result.server_time);
    }
    return changes.length > 0;
  } catch {
    return false;
  }
};

export const uploadAvatar = async (uri: string, token: string | null) => {
  if (!token) return null;
  const formData = new FormData();

  const filename = uri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename || '');
  const type = match ? `image/${match[1]}` : `image`;

  // @ts-ignore
  formData.append('file', { uri, name: filename, type });

  try {
    const response = await fetch(`${BACKEND_URL}/upload_avatar`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
};
