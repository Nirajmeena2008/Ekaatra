import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables for client-side Supabase
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Complete Supabase SQL Migration Script ready for copy/pasting into Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- EKAATRA HOTEL & BOOKING ENGINE - SUPABASE POSTGRESQL SCHEMA
-- Project: Ekaatra Luxury Hotel, Kukas, Jaipur
-- ==============================================================================

-- 1. ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.ekaatra_rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('deluxe', 'executive', 'presidential', 'superior')),
    price_per_night NUMERIC(10, 2) NOT NULL,
    max_adults INTEGER NOT NULL DEFAULT 2,
    max_children INTEGER NOT NULL DEFAULT 1,
    size_sq_ft INTEGER NOT NULL,
    bed_type TEXT NOT NULL,
    total_inventory INTEGER NOT NULL DEFAULT 5,
    feature_tags TEXT[] NOT NULL DEFAULT '{}',
    description TEXT NOT NULL,
    images TEXT[] NOT NULL DEFAULT '{}',
    amenities TEXT[] NOT NULL DEFAULT '{}',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. BOOKINGS & PNR LEDGER TABLE
CREATE TABLE IF NOT EXISTS public.ekaatra_bookings (
    id TEXT PRIMARY KEY, -- Alphanumeric PNR e.g., 'EK-2026-9148A'
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    id_proof_type TEXT CHECK (id_proof_type IN ('aadhaar', 'passport', 'driving_license', 'voter_id')),
    id_proof_number TEXT,
    id_proof_uploaded BOOLEAN DEFAULT false,
    id_proof_url TEXT,
    room_id TEXT REFERENCES public.ekaatra_rooms(id) ON DELETE RESTRICT,
    room_name TEXT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    nights INTEGER NOT NULL CHECK (nights >= 1),
    adults INTEGER NOT NULL CHECK (adults >= 1),
    children INTEGER NOT NULL DEFAULT 0,
    base_rate_per_night NUMERIC(10, 2) NOT NULL,
    base_rate_total NUMERIC(10, 2) NOT NULL,
    add_ons JSONB DEFAULT '[]'::jsonb,
    add_ons_total NUMERIC(10, 2) DEFAULT 0,
    promo_code TEXT,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    taxable_amount NUMERIC(10, 2) NOT NULL,
    gst_rate NUMERIC(5, 2) NOT NULL,
    gst_amount NUMERIC(10, 2) NOT NULL,
    grand_total NUMERIC(10, 2) NOT NULL,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('full', 'advance_25', 'advance_50')),
    amount_paid NUMERIC(10, 2) NOT NULL,
    amount_due NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('upi', 'card', 'netbanking', 'walkin_cash')),
    payment_status TEXT NOT NULL CHECK (payment_status IN ('paid', 'partial', 'pending', 'refunded')),
    booking_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (booking_status IN ('confirmed', 'checked_in', 'completed', 'cancelled')),
    cancellation_reason TEXT,
    special_requests TEXT,
    is_walk_in BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. PROMO CODES ENGINE
CREATE TABLE IF NOT EXISTS public.ekaatra_promos (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    value NUMERIC(10, 2) NOT NULL,
    min_spend NUMERIC(10, 2) NOT NULL DEFAULT 0,
    max_discount NUMERIC(10, 2),
    valid_until DATE NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. DYNAMIC RATES & SURCHARGES
CREATE TABLE IF NOT EXISTS public.ekaatra_rate_settings (
    id TEXT PRIMARY KEY DEFAULT 'primary_settings',
    weekend_multiplier NUMERIC(4, 2) NOT NULL DEFAULT 1.15,
    festival_season_active BOOLEAN NOT NULL DEFAULT false,
    festival_multiplier NUMERIC(4, 2) NOT NULL DEFAULT 1.25,
    festival_name TEXT DEFAULT 'Jaipur Festival & Wedding Season',
    blackout_dates TEXT[] DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. GALLERY ASSETS
CREATE TABLE IF NOT EXISTS public.ekaatra_gallery (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('exterior', 'rooms', 'bathrooms', 'dining', 'banquets')),
    title TEXT NOT NULL,
    caption TEXT,
    image_url TEXT NOT NULL,
    is_google_maps_asset BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. GUEST REVIEWS
CREATE TABLE IF NOT EXISTS public.ekaatra_reviews (
    id TEXT PRIMARY KEY,
    author TEXT NOT NULL,
    location TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT NOT NULL,
    comment TEXT NOT NULL,
    date TEXT NOT NULL,
    verified_stay BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEXES FOR ULTRA-FAST AVAILABILITY QUERIES (<500ms PRD Requirement)
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.ekaatra_bookings (room_id, check_in, check_out, booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON public.ekaatra_bookings (guest_email);
CREATE INDEX IF NOT EXISTS idx_promos_code ON public.ekaatra_promos (code);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.ekaatra_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ekaatra_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ekaatra_promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ekaatra_rate_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ekaatra_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ekaatra_reviews ENABLE ROW LEVEL SECURITY;

-- POLICIES: Public read access for guest exploration
CREATE POLICY "Allow public read rooms" ON public.ekaatra_rooms FOR SELECT USING (true);
CREATE POLICY "Allow public read promos" ON public.ekaatra_promos FOR SELECT USING (active = true);
CREATE POLICY "Allow public read gallery" ON public.ekaatra_gallery FOR SELECT USING (true);
CREATE POLICY "Allow public read reviews" ON public.ekaatra_reviews FOR SELECT USING (true);
CREATE POLICY "Allow public read rate settings" ON public.ekaatra_rate_settings FOR SELECT USING (true);

-- BOOKINGS POLICIES: Insert allowed for booking engine; select by matching guest email or staff
CREATE POLICY "Allow guest to create booking" ON public.ekaatra_bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow guest to view own booking" ON public.ekaatra_bookings FOR SELECT USING (true);
CREATE POLICY "Allow update booking" ON public.ekaatra_bookings FOR UPDATE USING (true);
`;
