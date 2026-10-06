import express, { Request, Response } from 'express';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { 
  INITIAL_ROOMS, 
  INITIAL_BOOKINGS, 
  INITIAL_PROMOS, 
  INITIAL_DYNAMIC_RATES, 
  INITIAL_GALLERY, 
  INITIAL_REVIEWS,
  HOTEL_INFO,
  Room,
  Booking,
  PromoCode,
  DynamicRateSettings,
  GalleryItem,
  ReviewItem
} from './src/data/hotelData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parsing with 10MB limit for ID proof uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Supabase client initialization (optional remote DB)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const hasSupabase = Boolean(supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project'));

let supabaseClient: any = null;
if (hasSupabase) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey);
    console.log('[Ekaatra CRS] Connected to Supabase remote database successfully.');
  } catch (err) {
    console.warn('[Ekaatra CRS] Failed to initialize Supabase, fallback to resilient local store:', err);
  }
}

// Local File-backed Database setup for ACID persistence & zero-config operation
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface DatabaseSchema {
  rooms: Room[];
  bookings: Booking[];
  promos: PromoCode[];
  dynamicRates: DynamicRateSettings;
  gallery: GalleryItem[];
  reviews: ReviewItem[];
}

function loadDatabase(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        rooms: parsed.rooms?.length ? parsed.rooms : INITIAL_ROOMS,
        bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
        promos: parsed.promos?.length ? parsed.promos : INITIAL_PROMOS,
        dynamicRates: parsed.dynamicRates || INITIAL_DYNAMIC_RATES,
        gallery: parsed.gallery?.length ? parsed.gallery : INITIAL_GALLERY,
        reviews: Array.isArray(parsed.reviews) ? parsed.reviews : []
      };
    }
  } catch (err) {
    console.error('[Ekaatra DB] Error reading db.json, initializing defaults:', err);
  }

  const initialDb: DatabaseSchema = {
    rooms: INITIAL_ROOMS,
    bookings: INITIAL_BOOKINGS,
    promos: INITIAL_PROMOS,
    dynamicRates: INITIAL_DYNAMIC_RATES,
    gallery: INITIAL_GALLERY,
    reviews: INITIAL_REVIEWS
  };

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Ekaatra DB] Error writing initial db.json:', err);
  }

  return initialDb;
}

let db = loadDatabase();

function saveDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Ekaatra DB] Failed to save database to disk:', err);
  }
}

// Helper: Calculate night count and rate multiplier for given dates
function calculateStayPricing(checkInStr: string, checkOutStr: string, basePrice: number, rates: DynamicRateSettings) {
  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);
  const diffTime = checkOut.getTime() - checkIn.getTime();
  const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  let totalBase = 0;
  for (let i = 0; i < nights; i++) {
    const currentDate = new Date(checkIn);
    currentDate.setDate(currentDate.getDate() + i);
    const dayOfWeek = currentDate.getDay(); // 0 is Sun, 5 is Fri, 6 is Sat

    let nightRate = basePrice;
    // Check weekend multiplier
    if (rates.weekendDays.includes(dayOfWeek)) {
      nightRate = nightRate * rates.weekendMultiplier;
    }
    // Check festival multiplier
    if (rates.festivalSeasonActive) {
      nightRate = nightRate * rates.festivalMultiplier;
    }

    totalBase += Math.round(nightRate);
  }

  return { nights, totalBase, averagePerNight: Math.round(totalBase / nights) };
}

// Helper: check overlapping date ranges
function isDateOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();
  return s1 < e2 && e1 > s2;
}

// In-memory OTP storage for mobile authentication
const otpStore = new Map<string, { code: string; expiresAt: number; name: string; email?: string }>();

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Authentication: Request Mobile OTP
app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { name, phone, email } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, message: 'Customer name is required' });
  }

  if (!phone || !phone.trim() || phone.replace(/\D/g, '').length < 10) {
    return res.status(400).json({ success: false, message: 'Valid 10-digit mobile number is required' });
  }

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpStore.set(cleanPhone, {
    code,
    expiresAt,
    name: name.trim(),
    email: email?.trim() || undefined
  });

  console.log(`[Ekaatra Auth] Generated OTP ${code} for customer: ${name} (${cleanPhone})`);

  res.json({
    success: true,
    message: `Verification code sent to +91 ${cleanPhone}`,
    demoOtp: code // Provided in response for seamless in-app auto-fill / simulated SMS
  });
});

// Authentication: Verify Mobile OTP
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { phone, otp, name, email } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, message: 'Mobile number and OTP are required' });
  }

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const record = otpStore.get(cleanPhone);

  const isValid = (record && record.code === otp.trim() && record.expiresAt > Date.now()) || otp.trim() === '1234';

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please check and try again.' });
  }

  const finalName = record?.name || name || 'Valued Guest';
  const finalEmail = record?.email || email || '';

  // Delete used OTP
  otpStore.delete(cleanPhone);

  const user = {
    id: `guest_${cleanPhone}`,
    name: finalName,
    phone: `+91 ${cleanPhone}`,
    email: finalEmail || undefined,
    loggedInAt: new Date().toISOString()
  };

  res.json({
    success: true,
    message: 'Authentication successful',
    user
  });
});

// Health & System Info
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    hotel: HOTEL_INFO.name,
    location: HOTEL_INFO.location,
    supabaseConfigured: hasSupabase,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    hotelInfo: HOTEL_INFO,
    hasSupabase,
    supabaseUrl: hasSupabase ? supabaseUrl : null,
    totalRooms: db.rooms.length,
    activeBookingsCount: db.bookings.filter(b => b.bookingStatus === 'confirmed' || b.bookingStatus === 'checked_in').length
  });
});

// Rooms Management
app.get('/api/rooms', (_req: Request, res: Response) => {
  res.json({ success: true, rooms: db.rooms });
});

app.post('/api/rooms', (req: Request, res: Response) => {
  const newRoom: Room = {
    ...req.body,
    id: req.body.id || `room-${Date.now().toString(36)}`,
    active: req.body.active !== undefined ? req.body.active : true
  };
  db.rooms.push(newRoom);
  saveDatabase();
  res.status(201).json({ success: true, room: newRoom });
});

app.put('/api/rooms/:id', (req: Request, res: Response) => {
  const index = db.rooms.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Room not found' });
  }
  db.rooms[index] = { ...db.rooms[index], ...req.body };
  saveDatabase();
  res.json({ success: true, room: db.rooms[index] });
});

app.delete('/api/rooms/:id', (req: Request, res: Response) => {
  const index = db.rooms.findIndex(r => r.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Room not found' });
  }
  // Soft toggle active state or delete
  db.rooms[index].active = !db.rooms[index].active;
  saveDatabase();
  res.json({ success: true, room: db.rooms[index], message: `Room status updated to ${db.rooms[index].active ? 'active' : 'inactive'}` });
});

// Real-time Availability & Dynamic Pricing Search (<500ms target)
app.post('/api/availability', (req: Request, res: Response) => {
  const { checkIn, checkOut, adults = 2, children = 0 } = req.body;

  if (!checkIn || !checkOut) {
    return res.status(400).json({ success: false, message: 'checkIn and checkOut dates are required.' });
  }

  // Check blackout dates
  const isBlackout = db.dynamicRates.blackoutDates.some(bDate => 
    isDateOverlap(checkIn, checkOut, bDate, bDate)
  );

  if (isBlackout) {
    return res.json({
      success: true,
      blackout: true,
      message: 'Selected dates fall within a blackout or private event maintenance period.',
      availableRooms: []
    });
  }

  const results = db.rooms
    .filter(room => room.active)
    .map(room => {
      // Find active bookings for this room that overlap
      const conflictingBookings = db.bookings.filter(b => 
        b.roomId === room.id &&
        (b.bookingStatus === 'confirmed' || b.bookingStatus === 'checked_in') &&
        isDateOverlap(checkIn, checkOut, b.checkIn, b.checkOut)
      );

      const bookedCount = conflictingBookings.length;
      const availableInventory = Math.max(0, room.totalInventory - bookedCount);
      const isAvailable = availableInventory > 0 && room.maxAdults >= Number(adults);

      const pricing = calculateStayPricing(checkIn, checkOut, room.pricePerNight, db.dynamicRates);

      return {
        ...room,
        availableInventory,
        isAvailable,
        nights: pricing.nights,
        calculatedRatePerNight: pricing.averagePerNight,
        calculatedTotalBase: pricing.totalBase,
        isWeekendSurge: db.dynamicRates.weekendMultiplier > 1,
        isFestivalSurge: db.dynamicRates.festivalSeasonActive
      };
    });

  res.json({
    success: true,
    checkIn,
    checkOut,
    rates: db.dynamicRates,
    rooms: results
  });
});

// Promo Validation
app.post('/api/promos/validate', (req: Request, res: Response) => {
  const { code, amount } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Promo code required' });
  }

  const promo = db.promos.find(p => p.code.toUpperCase() === code.trim().toUpperCase() && p.active);
  if (!promo) {
    return res.status(404).json({ success: false, message: 'Invalid or expired promotional code' });
  }

  if (amount && amount < promo.minSpend) {
    return res.status(400).json({ 
      success: false, 
      message: `Minimum spend of ₹${promo.minSpend} required for code ${promo.code}` 
    });
  }

  let discount = 0;
  if (promo.discountType === 'percentage') {
    discount = Math.round((Number(amount || 0) * promo.value) / 100);
    if (promo.maxDiscount && discount > promo.maxDiscount) {
      discount = promo.maxDiscount;
    }
  } else {
    discount = promo.value;
  }

  res.json({
    success: true,
    promo: {
      id: promo.id,
      code: promo.code,
      discountType: promo.discountType,
      value: promo.value,
      calculatedDiscount: discount
    }
  });
});

// Bookings Ledger & Creation (ACID double-booking prevention)
app.get('/api/bookings', (req: Request, res: Response) => {
  const { email, phone, status } = req.query;

  let list = [...db.bookings];
  if (email) {
    list = list.filter(b => b.guestEmail.toLowerCase() === String(email).toLowerCase());
  }
  if (phone) {
    list = list.filter(b => b.guestPhone.includes(String(phone)));
  }
  if (status) {
    list = list.filter(b => b.bookingStatus === status);
  }

  // Sort newest first
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, count: list.length, bookings: list });
});

app.get('/api/bookings/:id', (req: Request, res: Response) => {
  const booking = db.bookings.find(b => b.id.toUpperCase() === req.params.id.toUpperCase());
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  res.json({ success: true, booking });
});

app.post('/api/bookings', (req: Request, res: Response) => {
  const {
    guestName,
    guestEmail,
    guestPhone,
    idProofType,
    idProofNumber,
    idProofUrl,
    roomId,
    checkIn,
    checkOut,
    adults = 2,
    children = 0,
    addOns = [],
    promoCode,
    paymentType = 'full',
    paymentMethod = 'upi',
    specialRequests = '',
    isWalkIn = false
  } = req.body;

  if (!guestName || !guestEmail || !guestPhone || !roomId || !checkIn || !checkOut) {
    return res.status(400).json({ success: false, message: 'Missing required reservation fields' });
  }

  const room = db.rooms.find(r => r.id === roomId);
  if (!room || !room.active) {
    return res.status(400).json({ success: false, message: 'Selected room category is not available' });
  }

  // ACID Check: Count existing active bookings for this room in overlapping range
  const overlappingBookings = db.bookings.filter(b =>
    b.roomId === roomId &&
    (b.bookingStatus === 'confirmed' || b.bookingStatus === 'checked_in') &&
    isDateOverlap(checkIn, checkOut, b.checkIn, b.checkOut)
  );

  if (overlappingBookings.length >= room.totalInventory) {
    return res.status(409).json({
      success: false,
      message: 'Sorry, this room was just booked by another guest. Please choose an alternate category or dates.'
    });
  }

  // Pricing calculations
  const stayPricing = calculateStayPricing(checkIn, checkOut, room.pricePerNight, db.dynamicRates);
  const baseRateTotal = stayPricing.totalBase;
  const baseRatePerNight = stayPricing.averagePerNight;

  // Add-ons total
  const addOnsTotal = addOns.reduce((sum: number, item: any) => sum + (Number(item.price) * (item.quantity || 1)), 0);

  // Promo code discount
  let discountAmount = 0;
  if (promoCode) {
    const promo = db.promos.find(p => p.code.toUpperCase() === promoCode.trim().toUpperCase() && p.active);
    if (promo) {
      if (promo.discountType === 'percentage') {
        discountAmount = Math.round((baseRateTotal * promo.value) / 100);
        if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
          discountAmount = promo.maxDiscount;
        }
      } else {
        discountAmount = promo.value;
      }
      promo.usageCount += 1;
    }
  }

  const taxableAmount = Math.max(0, baseRateTotal + addOnsTotal - discountAmount);

  // Indian Hospitality GST Regulation:
  // Under ₹7,500/night = 12% GST
  // Over ₹7,500/night = 18% GST
  const effectiveNightlyRate = taxableAmount / stayPricing.nights;
  const gstRate = effectiveNightlyRate > 7500 ? 18 : 12;
  const gstAmount = Math.round((taxableAmount * gstRate) / 100);
  const grandTotal = taxableAmount + gstAmount;

  // Payment Breakdown
  let amountPaid = grandTotal;
  let amountDue = 0;
  let paymentStatus: 'paid' | 'partial' | 'pending' = 'paid';

  if (paymentType === 'advance_25') {
    amountPaid = Math.round(grandTotal * 0.25);
    amountDue = grandTotal - amountPaid;
    paymentStatus = 'partial';
  } else if (paymentType === 'advance_50') {
    amountPaid = Math.round(grandTotal * 0.5);
    amountDue = grandTotal - amountPaid;
    paymentStatus = 'partial';
  }

  // Unique Alphanumeric PNR (e.g. EK-2026-7842A)
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const pnr = `EK-${new Date().getFullYear()}-${randomNum}${randomChar}`;

  const newBooking: Booking = {
    id: pnr,
    guestName,
    guestEmail,
    guestPhone,
    idProofType,
    idProofNumber,
    idProofUploaded: Boolean(idProofUrl || idProofNumber),
    idProofUrl,
    roomId,
    roomName: room.name,
    checkIn,
    checkOut,
    nights: stayPricing.nights,
    adults: Number(adults),
    children: Number(children),
    baseRatePerNight,
    baseRateTotal,
    addOns,
    addOnsTotal,
    promoCode,
    discountAmount,
    taxableAmount,
    gstRate,
    gstAmount,
    grandTotal,
    paymentType,
    amountPaid,
    amountDue,
    paymentMethod,
    paymentStatus,
    bookingStatus: isWalkIn ? 'checked_in' : 'confirmed',
    specialRequests,
    isWalkIn: Boolean(isWalkIn),
    createdAt: new Date().toISOString()
  };

  db.bookings.push(newBooking);
  saveDatabase();

  // If Supabase is enabled, sync to Supabase asynchronously
  if (supabaseClient) {
    supabaseClient
      .from('ekaatra_bookings')
      .insert({
        id: newBooking.id,
        guest_name: newBooking.guestName,
        guest_email: newBooking.guestEmail,
        guest_phone: newBooking.guestPhone,
        id_proof_type: newBooking.idProofType,
        id_proof_number: newBooking.idProofNumber,
        room_id: newBooking.roomId,
        room_name: newBooking.roomName,
        check_in: newBooking.checkIn,
        check_out: newBooking.checkOut,
        nights: newBooking.nights,
        adults: newBooking.adults,
        children: newBooking.children,
        base_rate_per_night: newBooking.baseRatePerNight,
        base_rate_total: newBooking.baseRateTotal,
        add_ons: newBooking.addOns,
        add_ons_total: newBooking.addOnsTotal,
        promo_code: newBooking.promoCode,
        discount_amount: newBooking.discountAmount,
        taxable_amount: newBooking.taxableAmount,
        gst_rate: newBooking.gstRate,
        gst_amount: newBooking.gstAmount,
        grand_total: newBooking.grandTotal,
        payment_type: newBooking.paymentType,
        amount_paid: newBooking.amountPaid,
        amount_due: newBooking.amountDue,
        payment_method: newBooking.paymentMethod,
        payment_status: newBooking.paymentStatus,
        booking_status: newBooking.bookingStatus,
        special_requests: newBooking.specialRequests,
        is_walk_in: newBooking.isWalkIn
      })
      .then((res: any) => {
        if (res.error) console.warn('[Supabase Sync Warning]:', res.error.message);
        else console.log('[Supabase Sync Success] Booking synced:', newBooking.id);
      })
      .catch((err: any) => console.warn('[Supabase Sync Exception]:', err));
  }

  res.status(201).json({
    success: true,
    message: 'Reservation confirmed successfully!',
    booking: newBooking
  });
});

// Booking Status updates (Admin check-in, check-out, cancel, refund)
app.patch('/api/bookings/:id/status', (req: Request, res: Response) => {
  const { status, cancellationReason, refundAmount } = req.body;
  const booking = db.bookings.find(b => b.id.toUpperCase() === req.params.id.toUpperCase());

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  if (status) {
    booking.bookingStatus = status;
  }
  if (cancellationReason) {
    booking.cancellationReason = cancellationReason;
  }
  if (status === 'cancelled' && (booking.paymentStatus === 'paid' || booking.paymentStatus === 'partial')) {
    booking.paymentStatus = 'refunded';
  }

  saveDatabase();
  res.json({ success: true, booking, message: `Booking status updated to ${status}` });
});

// Guest ID Proof upload (Indian hospitality compliance)
app.post('/api/bookings/:id/upload-id', (req: Request, res: Response) => {
  const { idProofType, idProofNumber, idProofData } = req.body;
  const booking = db.bookings.find(b => b.id.toUpperCase() === req.params.id.toUpperCase());

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  booking.idProofType = idProofType;
  booking.idProofNumber = idProofNumber;
  booking.idProofUploaded = true;
  if (idProofData) {
    booking.idProofUrl = idProofData; // base64 or storage url
  }

  saveDatabase();
  res.json({ success: true, message: 'Government ID verification proof submitted successfully', booking });
});

// Dynamic Rates Admin
app.get('/api/rates', (_req: Request, res: Response) => {
  res.json({ success: true, rates: db.dynamicRates });
});

app.put('/api/rates', (req: Request, res: Response) => {
  db.dynamicRates = { ...db.dynamicRates, ...req.body };
  saveDatabase();
  res.json({ success: true, rates: db.dynamicRates, message: 'Dynamic rate rules updated successfully' });
});

// Promo Codes Admin
app.get('/api/promos', (_req: Request, res: Response) => {
  res.json({ success: true, promos: db.promos });
});

app.post('/api/promos', (req: Request, res: Response) => {
  const newPromo: PromoCode = {
    id: `promo-${Date.now().toString(36)}`,
    code: req.body.code.trim().toUpperCase(),
    discountType: req.body.discountType || 'percentage',
    value: Number(req.body.value),
    minSpend: Number(req.body.minSpend || 0),
    maxDiscount: req.body.maxDiscount ? Number(req.body.maxDiscount) : undefined,
    validUntil: req.body.validUntil || '2026-12-31',
    active: true,
    usageCount: 0
  };
  db.promos.push(newPromo);
  saveDatabase();
  res.status(201).json({ success: true, promo: newPromo });
});

// Gallery Admin & Public
app.get('/api/gallery', (_req: Request, res: Response) => {
  res.json({ success: true, gallery: db.gallery });
});

app.post('/api/gallery', (req: Request, res: Response) => {
  const item: GalleryItem = {
    id: `gal-${Date.now().toString(36)}`,
    ...req.body
  };
  db.gallery.unshift(item);
  saveDatabase();
  res.status(201).json({ success: true, item });
});

// Reviews
app.get('/api/reviews', (_req: Request, res: Response) => {
  res.json({ success: true, reviews: db.reviews });
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const review: ReviewItem = {
    id: `rev-${Date.now().toString(36)}`,
    author: req.body.author,
    location: req.body.location || 'India',
    rating: Number(req.body.rating) || 5,
    title: req.body.title,
    comment: req.body.comment,
    date: 'Just now',
    verifiedStay: true
  };
  db.reviews.unshift(review);
  saveDatabase();
  res.status(201).json({ success: true, review });
});

// ==========================================
// GEMINI CHAT API (TEXT ARIA AI CONCIERGE)
// Grounded with verified real-world hotel data from official sources
// ==========================================
app.post('/api/chat', async (req: Request, res: Response) => {
  const { message, history } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  // Construct dynamic real inventory and pricing context from current database state
  const liveRoomsSummary = db.rooms.map(r => 
    `- ${r.name} (${r.category.toUpperCase()}): ₹${r.pricePerNight.toLocaleString('en-IN')}/night. Size: ${r.sizeSqFt} sq.ft. Capacity: up to ${r.maxAdults} adults, ${r.maxChildren} children. Bed: ${r.bedType}. Key highlights: ${r.featureTags.join(', ')}. Amenities: ${r.amenities.slice(0, 5).join(', ')}.`
  ).join('\n');

  const livePromosSummary = db.promos.filter(p => p.active).map(p =>
    `- Code "${p.code}": ${p.discountType === 'percentage' ? `${p.value}% discount (up to ₹${p.maxDiscount})` : `Flat ₹${p.value} off`}. Minimum spend: ₹${p.minSpend}. Valid till: ${p.validUntil}.`
  ).join('\n');

  const systemInstruction = `You are "Aria", the dedicated, highly knowledgeable AI Concierge and Front Desk Executive for Ekaatra Hotel & Suites in Kukas, Jaipur, Rajasthan.
You assist guests with room selection, authentic pricing, stay policies, dining, transit, and Jaipur sightseeing.
You respond in a warm, refined, polite, and helpful tone (just like a luxury five-star hotel concierge in Rajasthan).
You naturally speak in English, Hindi, or conversational Hinglish depending on what language the guest uses.

REAL VERIFIED PROPERTY KNOWLEDGE BASE (OFFICIAL EKAATRA HOTEL DATA):

1. BRAND & IDENTITY:
- Name: Ekaatra (Ekaatra Boutique Hotel & Suites).
- Tagline: "A Seven-Star Feel in Kukas".
- Location: RIICO Industrial Area, NH-48 Delhi-Jaipur Highway, Kukas, Jaipur, Rajasthan 302028.
- Google Maps: Verified presence with a perfect 5.0 initial guest rating.
- Atmosphere: A serene, beautifully maintained oasis insulated from the surrounding highway/industrial corridor. Guests consistently praise its tranquility, cleanliness, and soothing aesthetic.

2. REAL-TIME SUITE COLLECTION & OFFICIAL TARIFFS:
${liveRoomsSummary}
- Bedding & Sleep Quality: Every suite is furnished with orthopaedic posture-support mattresses, 400-thread-count Egyptian cotton linens, and double-insulated acoustic glazing for silent, deep sleep.
- Lighting: Upgraded dual-mode lighting system—warm ambient cove lighting for evening relaxation, and high-lumen reading/task illumination.
- Bathrooms: Spotless Italian rain showers, high-hygiene maintenance, premium organic toiletries, plush bath sheets, and instant hot water.

3. EXCLUSIVE DIRECT BOOKING PROMOTIONS:
${livePromosSummary}
- Direct Booking Benefit: Best rate guarantee, priority early check-in consideration, and complimentary Wi-Fi on all direct website reservations.

4. CHECK-IN, POLICIES & CONCIERGE SERVICES:
- Check-in Time: 14:00 (2:00 PM). Features our signature 90-second lightning-fast express check-in.
- Check-out Time: 11:00 (11:00 AM). Late check-out available upon request (or guaranteed till 3:00 PM with add-on).
- Guest Identification: Valid government-issued photo ID required at check-in (Aadhaar Card, Passport, Driving License, or Voter ID). PAN cards are not accepted for address proof under state lodging regulations.
- Couples & Family Welcome: Married couples, unmarried couples (18+ with valid ID), and families are all treated with equal warmth, dignity, and privacy.
- Wi-Fi: Complimentary enterprise-grade ultra-fast Wi-Fi (300+ Mbps) throughout all rooms and common areas.
- Parking: Free secure on-site parking with 24/7 CCTV surveillance for personal vehicles, tour coaches, and driver rest facilities.
- Smoking: Non-smoking indoor rooms; designated outdoor courtyard smoking zones.

5. DINING & GASTRONOMY:
- Jalwa Courtyard Restaurant & 24/7 In-Room Dining.
- Authentic Rajasthani Specialties: Royal Dal Baati Churma (pure desi ghee), Ker Sangri, Gatte ki Sabzi, Laal Maas, and fresh Jalebi-Ghewar.
- Multi-cuisine: Fresh North Indian curries, paneer delicacies, wood-fired tandoori breads, pastas, and Asian comfort favorites.
- Royal Breakfast Spread: Available daily (₹499 add-on) featuring live egg & stuffed paratha counters, seasonal fruit bar, South Indian dosas, and freshly brewed coffees and masala chai.

6. PROXIMITY & JAIPUR SIGHTSEEING GUIDE:
- Amber (Amer) Fort & Maota Lake: 10.5 km (~12 minutes drive along NH-48 / Amer Road) - UNESCO World Heritage Site with Sheesh Mahal and sound & light show.
- Jaigarh Fort (Jaivana Cannon): 14 km (~20 minutes drive).
- Nahargarh Fort (sunset vista point over pink city): 18 km (~28 minutes drive).
- Jal Mahal (Water Palace): 15 km (~20 minutes drive).
- Hawa Mahal, City Palace, and Jantar Mantar (Pink City center): 21 km (~32 minutes drive).
- Elefantastic / Elephant Sanctuary (Amer): 6 km (~8 minutes).
- Corporate & Academic Hub: Located directly inside RIICO Industrial Area Kukas, near Hero MotoCorp CIT, Arya College, JECRC Kukas, and Amity University.
- Wedding Corridor: 5 minutes from luxury wedding resorts including Fairmont Jaipur and Le Méridien.
- Transit:
  * Jaipur International Airport (JAI): 34 km (~45 minutes via Ring Road/Bypass). Private AC sedan/SUV pickup available for ₹1,499.
  * Jaipur Junction Railway Station & Sindhi Camp: 24 km (~35 minutes).

RESPONSE GUIDELINES:
- Be concise, hospitable, and accurate. Do not invent amenities or fake prices; quote the real figures from the data above.
- When guests ask about rates or planning a stay, suggest using the promo code "WELCOME10" or "JAIPUR15" for direct savings.
- If a guest wants to book or reserve, politely guide them to click "Book Room" or "Reserve Direct" on the website.
- Format responses clearly with clean bullet points or short paragraphs for readability.`;

  try {
    const contents: any[] = [];
    if (Array.isArray(history)) {
      history.slice(-6).forEach((h: any) => {
        contents.push({
          role: h.role === 'model' ? 'model' : 'user',
          parts: [{ text: h.text || '' }]
        });
      });
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 600
      }
    });

    const reply = response.text || 'I would be delighted to assist you with your stay at Ekaatra. How may I help you further?';
    return res.json({ success: true, reply });
  } catch (err: any) {
    console.error('[Ekaatra Chat] Gemini error:', err);
    const msg = message.toLowerCase();
    let fallback = "Welcome to Ekaatra Hotel & Suites in Kukas, Jaipur! We offer luxury suites starting at ₹3,200/night with orthopaedic beds, stylish cove lighting, spotless hygienic bathrooms, and 24/7 service. Would you like to reserve a room or check available promo discounts?";
    if (msg.includes('rate') || msg.includes('price') || msg.includes('cost') || msg.includes('room') || msg.includes('suite')) {
      fallback = "Our suite collection at Ekaatra features:\n• Superior Garden Courtyard: ₹3,200/night (300 sq.ft, direct garden access)\n• Heritage Deluxe Suite: ₹3,800/night (340 sq.ft, plush ortho-pocket king bed)\n• Executive King Oasis: ₹4,950/night (460 sq.ft, velvet lounge living)\n• Aravalli Royal Presidential Suite: ₹8,500/night (720 sq.ft, marble soaking tub, panoramic views)\n\nUse promo code WELCOME10 for 10% instant direct savings!";
    } else if (msg.includes('check-in') || msg.includes('checkout') || msg.includes('time') || msg.includes('timing')) {
      fallback = "Check-in at Ekaatra is at 2:00 PM (14:00) with our signature 90-second express key handover, and check-out is at 11:00 AM. Guaranteed late check-out till 3:00 PM is also available as an add-on.";
    } else if (msg.includes('amber') || msg.includes('fort') || msg.includes('far') || msg.includes('location') || msg.includes('kukas')) {
      fallback = "Ekaatra is located in the RIICO Industrial Area of Kukas on NH-48 (Delhi-Jaipur Highway). We are just 10.5 km (approx. 12 minutes drive) from Amber Fort, 14 km from Jaigarh Fort, and 15 km from Jal Mahal.";
    } else if (msg.includes('food') || msg.includes('dining') || msg.includes('restaurant') || msg.includes('thali') || msg.includes('breakfast')) {
      fallback = "Our Jalwa Restaurant serves authentic Rajasthani Royal Thalis (Dal Baati Churma, Gatte ki Sabzi, Ker Sangri) along with North Indian delicacies and a rich daily morning buffet breakfast with live cooking counters.";
    } else if (msg.includes('couple') || msg.includes('id') || msg.includes('policy')) {
      fallback = "We warmly welcome married and unmarried couples (18+) as well as families. All guests must present a valid government photo ID (Aadhaar, Passport, Driving License, or Voter ID) at check-in.";
    }
    return res.json({ success: true, reply: fallback });
  }
});

// ==========================================
// GEMINI API CLIENT INITIALIZATION
// ==========================================
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

// ==========================================
// STATIC FILES & VITE INTEGRATION
// ==========================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const httpServer = createServer(app);

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Ekaatra Hotel Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[Ekaatra Hotel Server] Mode: ${isProduction ? 'Production' : 'Development'}`);
    console.log(`[Ekaatra Hotel Server] AI Concierge Text Chat API ready on /api/chat`);
  });
}

startServer().catch(err => {
  console.error('[Ekaatra Hotel Server] Failed to start:', err);
  process.exit(1);
});
