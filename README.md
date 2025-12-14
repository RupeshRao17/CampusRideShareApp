# Campus RideShare App

A cross‑platform mobile app for campus commuters to post rides, find train buddies, request seats, chat, manage bookings, and rate each other — powered end‑to‑end by Supabase for auth, database, realtime, and row‑level security.

## Objectives
- Enable students to safely offer and request rides.
- Persist all actions to Supabase with RLS‑safe access.
- Show live availability and hide expired rides automatically.
- Provide chat between driver–passenger and train buddies.
- Support booking management (accept/deny/cancel) and mutual ratings.

## Features
- Post car rides and train buddy posts.
- Live “Available Rides” filtered by gender policy and time validity.
- Ride requests → driver can accept/deny; acceptance creates a booking and decrements seats.
- Upcoming vs Past classification based on ride end time.
- Manage posted rides: cancel a confirmed passenger, delete ride.
- Passenger can cancel their own booking; seat count restored.
- Ratings: both parties can rate each other; average rating shown on profile.
- Realtime updates using Supabase channel subscriptions.
- Auth with sessions persisted via AsyncStorage.

## Architecture
- Frontend: React Native (Expo), React Navigation.
- Backend: Supabase Auth, Postgres, Realtime, RLS policies.
- Data access layer maps camelCase (app) to snake_case (DB) and subscribes to table changes for live UI.

## Data Model (Supabase)
- `profiles`: user metadata (`id`, `name`, `department`, `year`, `rating`)
- `rides`: `driver_id`, `driver_name`, `from_location`, `to_destination`, `date`, `time`, `available_seats`, `cost`, `allowed_gender`, `status`
- `train_posts`: `user_id`, `user_name`, `train_name`, `from_station`, `to_station`, `arrival_station`, `arrival_time`, `passengers_count`, `allowed_gender`, `status`
- `ride_requests`: `ride_id`, `driver_id`, `passenger_id`, `passenger_name`, `status` (`PENDING|ACCEPTED|DENIED`)
- `bookings`: `ride_id`, `driver_id`, `passenger_id`, `status` (`CONFIRMED|CANCELLED|COMPLETED`), `date`, `time`
- `ratings`: `booking_id`, `rater_id`, `ratee_id`, `score`
- `messages`: `chat_id`, `sender_id`, `receiver_id`, `content`, `created_at` (policy restricts access to involved users)

## RLS (Summary)
- `rides`: authenticated can select active rows; insert only by driver; driver can update `available_seats`/`status`.
- `train_posts`: authenticated can select; insert only by `user_id`.
- `ride_requests`: insert only by `passenger_id`; select by `driver_id` or `passenger_id`; driver updates `status`.
- `bookings`: insert/select/update by `driver_id` or `passenger_id` in the row.
- `ratings`: insert by `rater_id`; select by `rater_id` or `ratee_id`.
- `messages`: insert/select where `auth.uid()` equals `sender_id` or `receiver_id`.

## User Flows
1. Post a ride
   - Driver fills form; app inserts into `rides` with `status='ACTIVE'`.
2. View rides and request
   - Home shows active rides filtered by allowed gender and future end time.
   - Passenger taps Request → creates PENDING `ride_requests`.
3. Accept/Deny request
   - Driver sees requests on My Rides → Posted tab, taps Accept.
   - On Accept: creates `bookings` row and decrements `available_seats`.
4. Upcoming/Past
   - Booked rides categorized based on computed end timestamp (date + end time).
5. Manage Ride (driver)
   - Cancel passenger (sets booking to `CANCELLED`, increments seats).
   - Delete ride (removes row; optionally can soft‑delete by `status`).
6. Passenger actions
   - Cancel booking from Upcoming card; seats restored.
7. Ratings
   - After completion, both parties can rate; average rating updates in `profiles`.
8. Chat
   - Ride chat or train buddy chat navigates to `ChatRoom` with `receiverId`.

## Code Map (Key Functions)
- Data layer
  - `src/services/data.ts`
    - `createRide` inserts `rides` with `status='ACTIVE'` (src/services/data.ts:3-5)
    - `getActiveRides` filters active, gender‑allowed, non‑expired rides (src/services/data.ts:11-28)
    - `requestRide` inserts `ride_requests` PENDING (src/services/data.ts:58-66)
    - `acceptRideAndCreateBooking` creates `bookings`, decrements seats (src/services/data.ts:78-92)
    - `denyRideRequest` sets `status='DENIED'` (src/services/data.ts:94-96)
    - `getMyRides` lists rides by driver (src/services/data.ts:36-40)
    - `getMyBookings` lists bookings for current user (src/services/data.ts:52-56)
    - `submitRating` inserts rating and updates average (src/services/data.ts:98-104)
    - `cancelBooking` marks booking `CANCELLED`, increments seats (src/services/data.ts:106-114)
    - `deleteRide` deletes a ride (src/services/data.ts:116-119)
- Supabase utils and mapping
  - `src/lib/firebase.ts`
    - Supabase client and `useAuthState` (src/lib/firebase.ts:10-17, 23-66)
    - Camel→snake and snake→camel mappers for tables (src/lib/firebase.ts:87-170, 172-215)
    - Realtime `listenCollection` with `postgres_changes` (src/lib/firebase.ts:217-258)
    - CRUD helpers `addToCollection` / `updateCollection` (src/lib/firebase.ts:260-296)
- Screens
  - Home: request and chat handlers (src/screens/HomeScreen.tsx:82-103)
  - My Rides:
    - Build booked cards with full driver/ride info (src/screens/MyRidesScreen.tsx:116-137)
    - Listen to rides to enrich bookings (src/screens/MyRidesScreen.tsx:42-49)
    - Fetch driver profiles for rating/department/year (src/screens/MyRidesScreen.tsx:51-68)
    - Passenger cancel booking (src/screens/MyRidesScreen.tsx:212-225)
    - Manage Ride (Cancel Booking / Delete Ride) (src/screens/MyRidesScreen.tsx:230-258)
    - Accept/Deny requests and chat with passenger (src/screens/MyRidesScreen.tsx:260-287)

## Setup
1. Prerequisites
   - Node.js 18+, npm
   - Expo CLI (`npx expo`)
   - Supabase project (URL + anon key)
2. Configure Supabase
   - Set in `app.json`:
     ```json
     {
       "expo": {
         "extra": {
           "supabase": {
             "url": "https://YOUR_PROJECT.supabase.co",
             "anonKey": "YOUR_ANON_KEY"
           }
         }
       }
     }
     ```
   - For production, rotate keys regularly and avoid committing secrets publicly.
3. Install and run
   - Install deps: `npm install`
   - Start dev: `npm run start`
   - Web: `npm run web`
   - Typecheck: `npm run typecheck`

## Supabase Schema & Policies
- Ensure the tables listed above exist with the noted columns.
- Enable RLS and apply the summarized policies. Use Supabase SQL editor to create them; adjust for your organization’s constraints.

## Notes
- Date and time are selected via native pickers; formatting is handled automatically.
- If you prefer soft‑delete for rides, update `status` to `INACTIVE` and filter accordingly.
- Realtime relies on `postgres_changes` subscriptions; verify database replication settings if events don’t stream.

## Screenshots
- Home — Rides tab  
  ![Home Rides](docs/screenshots/home-rides.png)
- Home — Train Buddies  
  ![Home Trains](docs/screenshots/home-trains.png)
- Post Ride  
  ![Post Ride](docs/screenshots/post-ride.png)
- Posted Ride — Requests (Accept / Deny / Chat)  
  ![Requests](docs/screenshots/posted-requests.png)
- Upcoming Booking card (passenger view)  
  ![Upcoming](docs/screenshots/upcoming-booking.png)
- Manage Ride (driver actions: Cancel Booking / Delete Ride)  
  ![Manage Ride](docs/screenshots/manage-ride.png)
- Chat Room  
  ![Chat](docs/screenshots/chat-room.png)
- Ratings flow  
  ![Ratings](docs/screenshots/ratings.png)

Place PNG files under `docs/screenshots/` with the names above. If you prefer different names, update the links here accordingly.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License
This project is licensed under the MIT License — see the LICENSE file for details.
