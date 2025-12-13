import { addToCollection, listenCollection, updateCollection, supabase } from '@lib/firebase';

export function createRide(ride: any) {
  return addToCollection('rides', { status: 'ACTIVE', ...ride });
}

export function createTrainPost(post: any) {
  return addToCollection('trainPosts', { status: 'ACTIVE', ...post });
}

export function getActiveRides(userGender: string, set: (docs: any[]) => void) {
  return listenCollection('rides', (docs) => {
    const filtered = docs.filter((d) => {
      if (!(d.status === 'ACTIVE')) return false;
      if (!(d.allowedGender === 'Any' || !userGender || d.allowedGender === userGender)) return false;
      const [start, end] = String(d.time || '').split(' - ');
      const dateStr = String(d.date || '');
      const toDate = (ds: string, ts: string) => {
        const [dd, mm, yyyy] = ds.split('/').map((x: any) => parseInt(x, 10));
        const [hh, min] = ts.split(':').map((x: any) => parseInt(x, 10));
        return new Date(yyyy, mm - 1, dd, hh || 0, min || 0).getTime();
      };
      const endTime = (dateStr && end) ? toDate(dateStr, end) : 0;
      return endTime === 0 || endTime > Date.now();
    });
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

export function createBooking(data: { rideId: string; driverId: string; passengerId: string; date: string; time: string }) {
  return addToCollection('bookings', { status: 'CONFIRMED', ...data });
}

export function getMyBookings(uid: string, set: (docs: any[]) => void) {
  return listenCollection('bookings', (docs) => {
    set(docs.filter((d) => d.passengerId === uid || d.driverId === uid));
  });
}

export function requestRide(ride: { id: string; driverId: string }, passenger: { id: string; name: string }) {
  return addToCollection('rideRequests', {
    rideId: ride.id,
    driverId: ride.driverId,
    passengerId: passenger.id,
    passengerName: passenger.name,
    status: 'PENDING',
  });
}

export function getRideRequestsForDriver(driverId: string, set: (docs: any[]) => void) {
  return listenCollection('rideRequests', (docs) => {
    set(docs.filter((d) => d.driverId === driverId));
  });
}

export function acceptRideRequest(req: { id: string }) {
  return updateCollection('rideRequests', req.id, { status: 'ACCEPTED' });
}

export async function acceptRideAndCreateBooking(request: { id: string; rideId: string; driverId: string; passengerId: string }) {
  await updateCollection('rideRequests', request.id, { status: 'ACCEPTED' });
  const { data: rideRow } = await supabase.from('rides').select('*').eq('id', request.rideId).single();
  const ride = rideRow ? {
    id: rideRow.id,
    driverId: rideRow.driver_id,
    date: rideRow.date,
    time: rideRow.time,
    availableSeats: rideRow.available_seats,
  } : null;
  await createBooking({ rideId: request.rideId, driverId: request.driverId, passengerId: request.passengerId, date: ride?.date || '', time: ride?.time || '' });
  if (ride && typeof ride.availableSeats === 'number' && ride.availableSeats > 0) {
    await updateCollection('rides', request.rideId, { availableSeats: ride.availableSeats - 1 });
  }
}

export function denyRideRequest(req: { id: string }) {
  return updateCollection('rideRequests', req.id, { status: 'DENIED' });
}

export async function submitRating(bookingId: string, raterId: string, rateeId: string, score: number) {
  await addToCollection('ratings', { bookingId, raterId, rateeId, score });
  const { data } = await supabase.from('ratings').select('score').eq('ratee_id', rateeId);
  const scores = (data || []).map((d: any) => d.score || 5);
  const avg = scores.length ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1) : '5.0';
  await supabase.from('profiles').update({ rating: avg }).eq('id', rateeId);
}

export async function cancelBooking(bookingId: number) {
  const { data: booking } = await supabase.from('bookings').select('*').eq('id', bookingId).single();
  if (!booking) return;
  const rideId = booking.ride_id;
  await supabase.from('bookings').update({ status: 'CANCELLED' }).eq('id', bookingId);
  const { data: rideRow } = await supabase.from('rides').select('*').eq('id', rideId).single();
  const currentSeats = rideRow?.available_seats ?? 0;
  await supabase.from('rides').update({ available_seats: currentSeats + 1 }).eq('id', rideId);
}

export async function deleteRide(rideId: string) {
  const { error } = await supabase.from('rides').delete().eq('id', rideId);
  if (error) throw error;
}
