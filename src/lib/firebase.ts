import { useEffect, useState } from 'react';

type Listener = (docs: any[]) => void;
const collections: Record<string, any[]> = { users: [], rides: [], trainPosts: [] };
const subscriptions: Record<string, Set<Listener>> = {};
let currentUser: any = null;
const profiles: Record<string, any> = {};
const authSubscribers: Set<(u: any) => void> = new Set();

export const auth = {} as any;
export const db = {} as any;
export const rtdb = {} as any;

function notify(path: string) {
  const subs = subscriptions[path];
  if (!subs) return;
  const docs = (collections[path] || []).map((d, i) => ({ id: d.id || String(i), ...d }));
  subs.forEach((cb) => cb(docs));
}

export function useAuthState() {
  const [user, setUser] = useState<any>(currentUser);
  const [profile, setProfile] = useState<any>(currentUser ? profiles[currentUser.uid] : null);
  useEffect(() => {
    const cb = (u: any) => {
      setUser(u);
      setProfile(u ? profiles[u.uid] : null);
    };
    authSubscribers.add(cb);
    // initialize
    cb(currentUser);
    return () => authSubscribers.delete(cb);
  }, []);
  return { user, profile };
}

export async function signUpWithProfile(email: string, password: string, profile: any) {
  const uid = 'uid-' + Math.random().toString(36).slice(2);
  currentUser = { uid, email };
  profiles[uid] = { ...profile, uid };
  collections['users'].push(profiles[uid]);
  notify('users');
  authSubscribers.forEach((cb) => cb(currentUser));
}

export async function signIn(email: string, password: string) {
  const uid = 'uid-' + Math.random().toString(36).slice(2);
  currentUser = { uid, email };
  profiles[uid] = profiles[uid] || { name: email.split('@')[0], email, uid, gender: 'Any' };
  collections['users'].push(profiles[uid]);
  notify('users');
  authSubscribers.forEach((cb) => cb(currentUser));
}

export function listenCollection(path: string, cb: (docs: any[]) => void) {
  collections[path] = collections[path] || [];
  subscriptions[path] = subscriptions[path] || new Set();
  subscriptions[path].add(cb);
  cb(collections[path].map((d, i) => ({ id: d.id || String(i), ...d })));
  return () => {
    subscriptions[path].delete(cb);
  };
}

export async function addToCollection(path: string, data: any) {
  collections[path] = collections[path] || [];
  const doc = { ...data, id: String(Date.now()) };
  collections[path].push(doc);
  notify(path);
}