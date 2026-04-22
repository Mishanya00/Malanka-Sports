import { Redirect } from 'expo-router';

import { useAuth } from './context/auth-context';

export default function Index() {
  const { token, isAuthLoaded } = useAuth();
  if (!isAuthLoaded) return null;
  return <Redirect href={token ? ('/(tabs)' as any) : ('/login' as any)} />;
}
