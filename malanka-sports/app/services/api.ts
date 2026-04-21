import { BACKEND_URL } from '../constants/api';
import { db } from '../database/db';

export const syncDataWithBackend = async () => {
  try {
    const exercises = db.getAllSync('SELECT * FROM exercises');

    if (exercises.length === 0) return;

    const response = await fetch(`${BACKEND_URL}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exercises),
    });

    const result = await response.json();
    console.log('Sync success:', result);
  } catch (error) {
    console.error('Sync failed:', error);
  }
};

export const uploadAvatar = async (uri: string) => {
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
      },
    });
    return await response.json();
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
};