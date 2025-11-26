import { addToCollection, listenCollection } from '@lib/firebase';

export function createRide(ride: any) {
  return addToCollection('rides', { status: 'ACTIVE', ...ride });
}

export function createTrainPost(post: any) {
  return addToCollection('trainPosts', { status: 'ACTIVE', ...post });
}

export function getActiveRides(userGender: string, set: (docs: any[]) => void) {
  return listenCollection('rides', (docs) => {
    const filtered = docs.filter((d) => d.status === 'ACTIVE' && (d.allowedGender === 'Any' || d.allowedGender === userGender));
    set(filtered);
  });
}

export function getActiveTrainPosts(set: (docs: any[]) => void) {
  return listenCollection('trainPosts', (docs) => {
    set(docs.filter((d) => d.status === 'ACTIVE'));
  });
}

export function getMyRides(uid: string, set: (docs: any[]) => void) {
  return listenCollection('rides', (docs) => {
    set(docs.filter((d) => d.driverId === uid));
  });
}

export function getMyTrainPosts(uid: string, set: (docs: any[]) => void) {
  return listenCollection('trainPosts', (docs) => {
    set(docs.filter((d) => d.userId === uid));
  });
}