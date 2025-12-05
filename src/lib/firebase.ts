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

function toCamelFromRides(row: any) {
  return {
    id: row.id,
    driverId: row.driver_id,
    driverName: row.driver_name,
    from: row.from_location,
    to: row.to_destination,
    date: row.date,
    time: row.time,
    availableSeats: row.available_seats,
    cost: row.cost,
    allowedGender: row.allowed_gender,
    status: row.status,
    createdAt: row.created_at,
  };
}

function toCamelFromTrainPosts(row: any) {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    trainName: row.train_name,
    fromStation: row.from_station,
    toStation: row.to_station,
    arrivalStation: row.arrival_station,
    arrivalTime: row.arrival_time,
    passengersCount: row.passengers_count,
    allowedGender: row.allowed_gender,
    status: row.status,
    createdAt: row.created_at,
  };
}

function toCamelFromRideRequests(row: any) {
  return {
    id: row.id,
    rideId: row.ride_id,
    driverId: row.driver_id,
    passengerId: row.passenger_id,
    passengerName: row.passenger_name,
    status: row.status,
    createdAt: row.created_at,
  };
}

function toSnakeForRides(data: any) {
  return {
    driver_id: data.driverId,
    driver_name: data.driverName,
    from_location: data.from,
    to_destination: data.to,
    date: data.date,
    time: data.time,
    available_seats: data.availableSeats,
    cost: data.cost,
    allowed_gender: data.allowedGender,
    status: data.status,
  };
}

function toSnakeForTrainPosts(data: any) {
  return {
    user_id: data.userId,
    user_name: data.userName,
    train_name: data.trainName,
    from_station: data.fromStation,
    to_station: data.toStation,
    arrival_station: data.arrivalStation,
    arrival_time: data.arrivalTime,
    passengers_count: data.passengersCount,
    allowed_gender: data.allowedGender,
    status: data.status,
  };
}

function toSnakeForRideRequests(data: any) {
  return {
    ride_id: data.rideId,
    driver_id: data.driverId,
    passenger_id: data.passengerId,
    passenger_name: data.passengerName,
    status: data.status,
  };
}

export function listenCollection(path: string, cb: (docs: any[]) => void) {
  const map: Record<string, string> = {
    users: 'profiles',
    rides: 'rides',
    trainPosts: 'train_posts',
    rideRequests: 'ride_requests',
  };
  const table = map[path] || path;
  let stopped = false;
  const fetchAndNotify = async () => {
    const { data } = await supabase.from(table).select('*');
    if (!stopped) {
      const rows = data || [];
      if (table === 'rides') {
        cb(rows.map(toCamelFromRides));
      } else if (table === 'train_posts') {
        cb(rows.map(toCamelFromTrainPosts));
      } else if (table === 'ride_requests') {
        cb(rows.map(toCamelFromRideRequests));
      } else {
        cb(rows.map((d: any) => ({ id: d.id, ...d })));
      }
    }
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
    rideRequests: 'ride_requests',
  };
  const table = map[path] || path;
  let payload = data;
  if (table === 'rides') payload = toSnakeForRides(data);
  else if (table === 'train_posts') payload = toSnakeForTrainPosts(data);
  else if (table === 'ride_requests') payload = toSnakeForRideRequests(data);
  const { error } = await supabase.from(table).insert(payload);
  if (error) throw error;
}

export async function updateCollection(path: string, id: string, data: any) {
  const map: Record<string, string> = {
    users: 'profiles',
    rides: 'rides',
    trainPosts: 'train_posts',
    rideRequests: 'ride_requests',
  };
  const table = map[path] || path;
  let payload = data;
  if (table === 'rides') payload = toSnakeForRides({ ...data });
  else if (table === 'train_posts') payload = toSnakeForTrainPosts({ ...data });
  else if (table === 'ride_requests') payload = toSnakeForRideRequests({ ...data });
  const { error } = await supabase.from(table).update(payload).eq('id', id);
  if (error) throw error;
}
