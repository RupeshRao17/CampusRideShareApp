import 'react-native-url-polyfill/auto';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (Constants.expoConfig as any)?.extra?.supabase?.url || '';
const supabaseAnonKey = (Constants.expoConfig as any)?.extra?.supabase?.anonKey || '';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const auth = supabase as any;
export const db = supabase as any;
export const rtdb = supabase as any;

export function useAuthState() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }: any) => {
      const u = data.session?.user || null;
      if (!active) return;
      setUser(u ? { uid: u.id, email: u.email } : null);
      if (u) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', u.id)
          .single()
          .then(({ data: p }: any) => {
            if (!active) return;
            setProfile(p || null);
          });
      } else {
        setProfile(null);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      const u = session?.user || null;
      setUser(u ? { uid: u.id, email: u.email } : null);
      if (u) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', u.id)
          .single()
          .then(({ data: p }: any) => setProfile(p || null));
      } else {
        setProfile(null);
      }
    });
    return () => {
      active = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);
  return { user, profile };
}

export async function signUpWithProfile(email: string, password: string, profile: any) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  const uid = data.user?.id;
  if (uid) {
    await supabase.from('profiles').upsert({ id: uid, ...profile });
  }
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function listenCollection(path: string, cb: (docs: any[]) => void) {
  const map: Record<string, string> = {
    users: 'profiles',
    rides: 'rides',
    trainPosts: 'train_posts',
  };
  const table = map[path] || path;
  let stopped = false;
  const fetchAndNotify = async () => {
    const { data } = await supabase.from(table).select('*');
    if (!stopped) cb((data || []).map((d: any) => ({ id: d.id, ...d })));
  };
  fetchAndNotify();
  const channel = supabase
    .channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
      fetchAndNotify();
    })
    .subscribe();
  return () => {
    stopped = true;
    supabase.removeChannel(channel);
  };
}

export async function addToCollection(path: string, data: any) {
  const map: Record<string, string> = {
    users: 'profiles',
    rides: 'rides',
    trainPosts: 'train_posts',
  };
  const table = map[path] || path;
  const { error } = await supabase.from(table).insert(data);
  if (error) throw error;
}
