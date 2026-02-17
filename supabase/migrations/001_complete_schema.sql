-- ============================================================
-- Voyager Travel App — Complete Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────
-- 1. USERS (synced from Firebase Auth)
-- ──────────────────────────────────────────────
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_users_firebase_uid ON public.users (firebase_uid);
CREATE INDEX idx_users_username ON public.users (username);

-- ──────────────────────────────────────────────
-- 2. USER PREFERENCES
-- ──────────────────────────────────────────────
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  budget TEXT DEFAULT 'moderate' CHECK (budget IN ('budget', 'moderate', 'luxury')),
  travel_style TEXT DEFAULT 'balanced' CHECK (travel_style IN ('relaxed', 'balanced', 'adventurous')),
  travel_pace TEXT DEFAULT 'moderate' CHECK (travel_pace IN ('slow', 'moderate', 'fast')),
  group_size TEXT DEFAULT 'solo' CHECK (group_size IN ('solo', 'couple', 'small_group', 'large_group')),
  interests TEXT[] DEFAULT '{}',
  accommodation TEXT DEFAULT 'hotel' CHECK (accommodation IN ('hostel', 'hotel', 'resort', 'airbnb', 'other')),
  transportation TEXT[] DEFAULT '{}',
  dietary_preferences TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_user_preferences_user_id ON public.user_preferences (user_id);

-- ──────────────────────────────────────────────
-- 3. VISITED LOCATIONS
-- ──────────────────────────────────────────────
CREATE TABLE public.visited_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  visited_at DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_visited_locations_user_id ON public.visited_locations (user_id);

-- ──────────────────────────────────────────────
-- 4. TRIPS
-- ──────────────────────────────────────────────
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_trips_owner_id ON public.trips (owner_id);

-- ──────────────────────────────────────────────
-- 5. TRIP DAYS
-- ──────────────────────────────────────────────
CREATE TABLE public.trip_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  date DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (trip_id, day_number)
);

CREATE INDEX idx_trip_days_trip_id ON public.trip_days (trip_id);

-- ──────────────────────────────────────────────
-- 6. ACTIVITIES
-- ──────────────────────────────────────────────
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_day_id UUID REFERENCES public.trip_days(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_time TIME,
  duration_minutes INTEGER,
  location_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  notes TEXT,
  notes_private BOOLEAN DEFAULT true NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_activities_trip_day_id ON public.activities (trip_day_id);

-- ──────────────────────────────────────────────
-- 7. TRIP COLLABORATORS
-- ──────────────────────────────────────────────
CREATE TABLE public.trip_collaborators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (trip_id, user_id)
);

CREATE INDEX idx_trip_collaborators_trip_id ON public.trip_collaborators (trip_id);
CREATE INDEX idx_trip_collaborators_user_id ON public.trip_collaborators (user_id);

-- ──────────────────────────────────────────────
-- 8. FRIEND REQUESTS
-- ──────────────────────────────────────────────
CREATE TABLE public.friend_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

CREATE INDEX idx_friend_requests_sender_id ON public.friend_requests (sender_id);
CREATE INDEX idx_friend_requests_receiver_id ON public.friend_requests (receiver_id);
CREATE INDEX idx_friend_requests_status ON public.friend_requests (status);

-- ──────────────────────────────────────────────
-- 9. REVIEWS
-- ──────────────────────────────────────────────
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  photo_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_reviews_user_id ON public.reviews (user_id);
CREATE INDEX idx_reviews_city ON public.reviews (city);
CREATE INDEX idx_reviews_created_at ON public.reviews (created_at DESC);

-- ──────────────────────────────────────────────
-- 10. COMMENTS
-- ──────────────────────────────────────────────
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_comments_review_id ON public.comments (review_id);
CREATE INDEX idx_comments_user_id ON public.comments (user_id);

-- ──────────────────────────────────────────────
-- AUTO-UPDATE updated_at TRIGGER
-- ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.friend_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ──────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visited_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- ── USERS: anyone can read profiles, only owner can update ──
CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub');

-- ── USER PREFERENCES: owner only ──
CREATE POLICY "Preferences viewable by owner"
  ON public.user_preferences FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Preferences insertable by owner"
  ON public.user_preferences FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Preferences updatable by owner"
  ON public.user_preferences FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'));

-- ── VISITED LOCATIONS: owner can CRUD, others can view ──
CREATE POLICY "Visited locations viewable by everyone"
  ON public.visited_locations FOR SELECT USING (true);

CREATE POLICY "Visited locations manageable by owner"
  ON public.visited_locations FOR ALL
  USING (user_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'));

-- ── TRIPS: owner + collaborators can access ──
CREATE POLICY "Public trips viewable by everyone"
  ON public.trips FOR SELECT
  USING (
    is_public = true
    OR owner_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub')
    OR id IN (
      SELECT trip_id FROM public.trip_collaborators
      WHERE user_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub')
    )
  );

CREATE POLICY "Trips manageable by owner"
  ON public.trips FOR ALL
  USING (owner_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'));

-- ── TRIP DAYS: accessible if trip is accessible ──
CREATE POLICY "Trip days accessible via trip"
  ON public.trip_days FOR SELECT
  USING (trip_id IN (SELECT id FROM public.trips));

CREATE POLICY "Trip days manageable by trip owner or editors"
  ON public.trip_days FOR ALL
  USING (
    trip_id IN (
      SELECT id FROM public.trips
      WHERE owner_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub')
    )
    OR trip_id IN (
      SELECT trip_id FROM public.trip_collaborators
      WHERE user_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub')
      AND role = 'editor'
    )
  );

-- ── ACTIVITIES: accessible if trip day is accessible ──
CREATE POLICY "Activities viewable via trip"
  ON public.activities FOR SELECT
  USING (trip_day_id IN (SELECT id FROM public.trip_days));

CREATE POLICY "Activities manageable by trip owner or editors"
  ON public.activities FOR ALL
  USING (
    trip_day_id IN (
      SELECT td.id FROM public.trip_days td
      JOIN public.trips t ON td.trip_id = t.id
      WHERE t.owner_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub')
    )
    OR trip_day_id IN (
      SELECT td.id FROM public.trip_days td
      JOIN public.trip_collaborators tc ON td.trip_id = tc.trip_id
      WHERE tc.user_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub')
      AND tc.role = 'editor'
    )
  );

-- ── TRIP COLLABORATORS: trip owner manages ──
CREATE POLICY "Collaborators viewable by trip participants"
  ON public.trip_collaborators FOR SELECT
  USING (
    trip_id IN (
      SELECT id FROM public.trips
      WHERE owner_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub')
    )
    OR user_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub')
  );

CREATE POLICY "Collaborators manageable by trip owner"
  ON public.trip_collaborators FOR ALL
  USING (
    trip_id IN (
      SELECT id FROM public.trips
      WHERE owner_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub')
    )
  );

-- ── FRIEND REQUESTS: participants can view ──
CREATE POLICY "Friend requests viewable by participants"
  ON public.friend_requests FOR SELECT
  USING (
    sender_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub')
    OR receiver_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub')
  );

CREATE POLICY "Friend requests insertable by sender"
  ON public.friend_requests FOR INSERT
  WITH CHECK (sender_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Friend requests updatable by receiver"
  ON public.friend_requests FOR UPDATE
  USING (receiver_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Friend requests deletable by participants"
  ON public.friend_requests FOR DELETE
  USING (
    sender_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub')
    OR receiver_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub')
  );

-- ── REVIEWS: anyone can read, owner can CRUD ──
CREATE POLICY "Reviews viewable by everyone"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Reviews insertable by owner"
  ON public.reviews FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Reviews updatable by owner"
  ON public.reviews FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Reviews deletable by owner"
  ON public.reviews FOR DELETE
  USING (user_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'));

-- ── COMMENTS: anyone can read, owner can CRUD ──
CREATE POLICY "Comments viewable by everyone"
  ON public.comments FOR SELECT USING (true);

CREATE POLICY "Comments insertable by authenticated users"
  ON public.comments FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Comments updatable by owner"
  ON public.comments FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'));

CREATE POLICY "Comments deletable by owner"
  ON public.comments FOR DELETE
  USING (user_id IN (SELECT id FROM public.users WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'));
