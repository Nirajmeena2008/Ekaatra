export interface Room {
  id: string;
  name: string;
  category: 'deluxe' | 'executive' | 'presidential' | 'superior';
  pricePerNight: number;
  maxAdults: number;
  maxChildren: number;
  sizeSqFt: number;
  bedType: string;
  totalInventory: number;
  featureTags: string[];
  description: string;
  images: string[];
  active: boolean;
  amenities: string[];
}

export interface Booking {
  id: string; // PNR e.g. "EK-2026-9142A"
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  idProofType?: 'aadhaar' | 'passport' | 'driving_license' | 'voter_id';
  idProofNumber?: string;
  idProofUploaded?: boolean;
  idProofUrl?: string;
  roomId: string;
  roomName: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  adults: number;
  children: number;
  baseRatePerNight: number;
  baseRateTotal: number;
  addOns: { id: string; name: string; price: number; quantity?: number }[];
  addOnsTotal: number;
  promoCode?: string;
  discountAmount: number;
  taxableAmount: number;
  gstRate: number; // 12 or 18 percent
  gstAmount: number;
  grandTotal: number;
  paymentType: 'full' | 'advance_25' | 'advance_50';
  amountPaid: number;
  amountDue: number;
  paymentMethod: 'upi' | 'card' | 'netbanking' | 'walkin_cash';
  paymentStatus: 'paid' | 'partial' | 'pending' | 'refunded';
  bookingStatus: 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
  cancellationReason?: string;
  specialRequests?: string;
  isWalkIn?: boolean;
  createdAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number;
  minSpend: number;
  maxDiscount?: number;
  validUntil: string;
  active: boolean;
  usageCount: number;
}

export interface DynamicRateSettings {
  weekendMultiplier: number;
  weekendDays: number[]; // 5=Friday, 6=Saturday, 0=Sunday
  festivalSeasonActive: boolean;
  festivalMultiplier: number;
  festivalName: string;
  blackoutDates: string[]; // ['2026-10-24', '2026-11-01']
}

export interface GalleryItem {
  id: string;
  category: 'all' | 'exterior' | 'rooms' | 'bathrooms' | 'dining' | 'banquets';
  title: string;
  caption: string;
  imageUrl: string;
  isGoogleMapsAsset?: boolean;
}

export interface ReviewItem {
  id: string;
  author: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedStay: boolean;
}

export const HOTEL_INFO = {
  name: "Ekaatra",
  legalName: "Ekaatra Boutique Hotel & Suites",
  tagline: "A Seven-Star Feel in Kukas",
  subtitle: "Serene Escape & Modern Luxury in RIICO Industrial Area, Kukas, Rajasthan",
  welcomeQuote: "With humility and warmth we welcome you!",
  location: "RIICO Industrial Area, Kukas, Jaipur, Rajasthan 302028",
  phone: "+91 98290 84721",
  secondaryPhone: "+91 141 289 4400",
  email: "reservations@ekaatrahotel.com",
  frontDeskEmail: "frontdesk@ekaatrahotel.com",
  googleMapsUrl: "https://www.google.com/maps/place/Ekaatra/@27.0292071,75.8913548,3a,75y/data=!3m8!1e2!3m6!1sCIABIhDN7dFSa1BY8MLO3L07XIBE!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fgps-cs-s%2FANWiy9Q_JqZdpzoeCKvXrGS7u0nYwXaOgjcnd30-Cg94Kj2lb5Fkxe9qRBpwDFSc6UGFUJAmJFkYmN-oVYp7A14gCpeEzrIkRnjlayvSeV_Ti2toaB0BX35QtJDFlchucdiMnSur4RXE5-Jaf08%3Dw203-h360-k-no!7i2252!8i4000!4m7!3m6!1s0x396daf000b606d1b:0x650af462d5d0462d!8m2!3d27.0291666!4d75.8913217!10e5!16s%2Fg%2F11z3m9j1p2",
  googleMapsDirectEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3554.407238634863!2d75.88874677610055!3d27.02917135565551!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x396daf000b606d1b%3A0x650af462d5d0462d!2sEkaatra!5e0!3m2!1sen!2sin!4v1711612000000!5m2!1sen!2sin",
  rating: 5.0,
  ratingScale: "5.0",
  ratingLabel: "Perfect 5.0 Rating from Initial Reviews",
  checkInTime: "14:00 (2:00 PM)",
  checkOutTime: "11:00 (11:00 AM)",
  highlights: [
    "Perfect 5.0 Rating from Initial Guest Reviews",
    "Serene Escape with a 'Seven-Star' Atmosphere in RIICO Kukas",
    "Modern, Clean & Spacious Rooms with Comfortable Beds",
    "Stylish Ceiling Designs & Dual-Mode In-Room Lighting",
    "Pristine Hygienic Bathrooms with Essential Amenities",
    "Heartwarming Hospitality — Warm, Welcoming & Eager Staff",
    "Seamless & Lightning-Fast Check-in & Check-out Procedures",
    "Official Direct Channels & Google Maps Verified Presence"
  ]
};

// Hotel add-ons available during booking checkout
export const AVAILABLE_ADDONS = [
  {
    id: "airport_transfer",
    name: "Jaipur Airport / Railway Station Private Transfer (Sedan/SUV)",
    price: 1499,
    description: "Chauffeured AC car pickup directly from Jaipur International Airport (JAI) or Jaipur Junction.",
    icon: "Car"
  },
  {
    id: "royal_breakfast",
    name: "Royal Rajasthani & Continental Buffet Breakfast",
    price: 499,
    description: "Daily sumptuous breakfast spread at our Jalwa Restaurant including live egg & paratha counters.",
    icon: "Utensils"
  },
  {
    id: "extra_bed",
    name: "Luxury Rollaway Extra Bed with Premium Mattress",
    price: 800,
    description: "High-comfort rollaway bed with sanitized luxury bedding and fresh pillows.",
    icon: "Bed"
  },
  {
    id: "celebration_setup",
    name: "Romantic Celebration Decor & Artisanal Cake",
    price: 1299,
    description: "Handcrafted rose petal arrangement, ambient scented candles, and fresh chef-crafted cake.",
    icon: "Heart"
  },
  {
    id: "late_checkout",
    name: "Guaranteed Late Check-Out (up to 3:00 PM)",
    price: 699,
    description: "Extend your leisure stay with relaxed afternoon departure.",
    icon: "Clock"
  }
];

// Initial Rooms data
export const INITIAL_ROOMS: Room[] = [
  {
    id: "room-deluxe",
    name: "Heritage Deluxe Suite",
    category: "deluxe",
    pricePerNight: 3800,
    maxAdults: 2,
    maxChildren: 1,
    sizeSqFt: 340,
    bedType: "Plush Ortho-Comfort King Bed",
    totalInventory: 12,
    featureTags: ["Clean & Spacious", "Stylish Ceiling Design", "Ultra-Comfort Bed", "Dual-Mode Lighting", "Hygienic Bathroom"],
    description: "Modern, clean, and spacious sanctuary with a tranquil atmosphere. Highlights bespoke architectural false ceilings with designer cove lighting, an exceptionally comfortable king-size bed for restful sleep, and a well-maintained hygienic bathroom with essential amenities and walk-in rain shower. Features dual-mode lighting (soft warm cove and bright task illumination).",
    images: [
      "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9Q_JqZdpzoeCKvXrGS7u0nYwXaOgjcnd30-Cg94Kj2lb5Fkxe9qRBpwDFSc6UGFUJAmJFkYmN-oVYp7A14gCpeEzrIkRnjlayvSeV_Ti2toaB0BX35QtJDFlchucdiMnSur4RXE5-Jaf08=w1200-h800-k-no",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: [
      "Ultra-Comfortable 12-inch Ortho-Pocket King Bed",
      "Stylish Ceiling Design with Architectural Cove Lights",
      "Dual-Mode In-Room Lighting (Cozy Ambient & Bright Clarity)",
      "Spotless Hygienic Bathroom with Walk-in Rain Shower",
      "Essential Guest Toiletries & Sanitized Bath Linen",
      "55-inch 4K Smart TV with Streaming Apps",
      "High-Speed Wi-Fi (300+ Mbps)",
      "Daily Housekeeping & Mineral Water Bottles"
    ],
    active: true
  },
  {
    id: "room-executive",
    name: "Executive King Oasis",
    category: "executive",
    pricePerNight: 4950,
    maxAdults: 3,
    maxChildren: 2,
    sizeSqFt: 460,
    bedType: "California King Comfort Bed + Sofa Lounge",
    totalInventory: 8,
    featureTags: ["Clean & Spacious", "Stylish Ceiling Design", "Ultra-Comfort Bed", "Dual-Mode Lighting", "Lounge Living"],
    description: "Tailored for guests seeking a comforting seven-star feel inside Kukas. Features an expansive open floor plan, custom geometric ceiling lighting with enhanced brightness controls, a plush California king mattress, cozy velvet lounge seating, and an impeccably clean, hygienic bathroom.",
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: [
      "California King Bed with 400TC Egyptian Cotton Linens",
      "Dedicated Cozy Velvet Living / Lounge Area",
      "Geometric Ceiling Design with Adjustable Brightness",
      "Hygienic En-Suite Bathroom with Rain Shower",
      "Complimentary Lavazza Espresso Pod Machine",
      "Acoustic Soundproofing for Deep, Relaxing Sleep",
      "Lightning-Fast Room Service 24/7",
      "Complimentary Iron & Garment Steamer"
    ],
    active: true
  },
  {
    id: "room-presidential",
    name: "Aravalli Royal Presidential Suite",
    category: "presidential",
    pricePerNight: 8500,
    maxAdults: 4,
    maxChildren: 2,
    sizeSqFt: 720,
    bedType: "Emperor King Bed + Separate Dining & Living",
    totalInventory: 4,
    featureTags: ["Spacious", "Stylish Ceiling Design", "Panoramic Views", "Luxury Soaking Tub", "Butler On-Demand"],
    description: "The pinnacle of serenity and royal grandeur at Ekaatra. Featuring an expansive master bedroom with handpicked Rajasthani accents, separate private dining hall, panoramic Aravalli valley views, a freestanding deep soaking tub, and priority express check-in.",
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: [
      "Private Panoramic Sun Balcony",
      "Master Emperor Bed with Feather Duvets",
      "Freestanding Italian Marble Soaking Tub",
      "Separate Living Room & 6-Seater Dining Space",
      "65-inch Curved OLED Home Theater Setup",
      "VIP Dedicated Butler Concierge",
      "Complimentary Premium Airport Pick & Drop",
      "Artisanal Fruit Basket & Welcome Sweets"
    ],
    active: true
  },
  {
    id: "room-superior",
    name: "Superior Garden Courtyard Room",
    category: "superior",
    pricePerNight: 3200,
    maxAdults: 2,
    maxChildren: 1,
    sizeSqFt: 300,
    bedType: "Queen Comfort Bed / Twin",
    totalInventory: 10,
    featureTags: ["Clean & Quiet", "Stylish Ceiling Design", "Courtyard Access", "Dual-Mode Lighting"],
    description: "Intimate and comforting retreat with direct ground-floor access to Ekaatra's manicured garden pathway. Ideal for professionals visiting the RIICO Industrial hub and travelers seeking peaceful rejuvenation in clean, beautifully maintained spaces.",
    images: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: [
      "Direct Step-Out Access to Tranquil Garden",
      "Ergonomic Workspace with Universal Power Ports",
      "Custom Cove Ambient Ceiling Lights with High-Lumen Toggle",
      "Lightning-Fast Express Check-in",
      "Clean Bathroom with Essential Toiletries",
      "Sound-Insulated Walls for Deep Sleep",
      "Tea & Coffee Maker with Herbal Blends"
    ],
    active: true
  }
];

// Initial Promo Codes
export const INITIAL_PROMOS: PromoCode[] = [
  {
    id: "promo-1",
    code: "WELCOME10",
    discountType: "percentage",
    value: 10,
    minSpend: 2500,
    maxDiscount: 1500,
    validUntil: "2026-12-31",
    active: true,
    usageCount: 42
  },
  {
    id: "promo-2",
    code: "KUKASROYAL",
    discountType: "fixed",
    value: 1000,
    minSpend: 6000,
    validUntil: "2026-12-31",
    active: true,
    usageCount: 28
  },
  {
    id: "promo-3",
    code: "JAIPUR15",
    discountType: "percentage",
    value: 15,
    minSpend: 5000,
    maxDiscount: 2000,
    validUntil: "2026-12-31",
    active: true,
    usageCount: 19
  }
];

// Initial Dynamic Rate settings
export const INITIAL_DYNAMIC_RATES: DynamicRateSettings = {
  weekendMultiplier: 1.15, // 15% increase on Friday/Saturday
  weekendDays: [5, 6],
  festivalSeasonActive: false,
  festivalMultiplier: 1.25,
  festivalName: "Pushkar & Diwali Royal Season",
  blackoutDates: ["2026-11-12", "2026-11-13", "2026-12-31"]
};

// Gallery Items
export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: "gal-1",
    category: "exterior",
    title: "Ekaatra Twilight Facade",
    caption: "The illuminated architectural entrance welcoming travelers to Kukas, Jaipur.",
    imageUrl: "https://lh3.googleusercontent.com/gps-cs-s/ANWiy9Q_JqZdpzoeCKvXrGS7u0nYwXaOgjcnd30-Cg94Kj2lb5Fkxe9qRBpwDFSc6UGFUJAmJFkYmN-oVYp7A14gCpeEzrIkRnjlayvSeV_Ti2toaB0BX35QtJDFlchucdiMnSur4RXE5-Jaf08=w1200-h800-k-no",
    isGoogleMapsAsset: true
  },
  {
    id: "gal-2",
    category: "rooms",
    title: "Architectural Ceiling & Ambient Suite",
    caption: "Showcasing modern false ceiling cove lighting and pristine Egyptian linens.",
    imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "gal-3",
    category: "exterior",
    title: "Tranquil Stone Courtyard",
    caption: "A peaceful oasis insulated from the surrounding industrial corridor.",
    imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "gal-4",
    category: "bathrooms",
    title: "Ensuite Italian Rain Shower",
    caption: "Modern glass walk-in shower with designer LED mirrors and organic toiletries.",
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "gal-5",
    category: "rooms",
    title: "Executive King Living Area",
    caption: "Velvet sofa lounger with warm sand textures and acoustic double glazing.",
    imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80"
  }
];

// Guest Reviews - Authentic Initial Reviews reflecting the Perfect 5.0 Rating & Guest Feedback
export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    author: "Siddharth & Priya M.",
    location: "New Delhi (NH-48 Road Trip)",
    rating: 5,
    title: "A Serene Escape with a Genuine Seven-Star Feel",
    comment: "Situated in the RIICO Industrial Area of Kukas, Ekaatra is an unexpected, beautifully maintained sanctuary. The overarching vibe is comforting and relaxing. Despite being near the industrial hub, the property delivers an authentic high-end, seven-star atmosphere.",
    date: "2026-03-12",
    verifiedStay: true
  },
  {
    id: "rev-2",
    author: "Vikramaditya Rathore",
    location: "Jaipur, Rajasthan",
    rating: 5,
    title: "Modern, Clean & Spacious with Very Comfortable Beds",
    comment: "The rooms are modern, spotlessly clean, and noticeably spacious. We loved the stylish ceiling designs with warm cove lighting. The beds are exceptionally comfortable—best sleep in weeks. Also, check-in and check-out were seamless and lightning-fast.",
    date: "2026-03-19",
    verifiedStay: true
  },
  {
    id: "rev-3",
    author: "Ananya Deshmukh",
    location: "Mumbai, Maharashtra",
    rating: 5,
    title: "Heartwarming Hospitality & Eager, Attentive Staff",
    comment: "The staff's hospitality was heartwarming—every team member was warm, welcoming, and eager to assist us at every step. Bathrooms are very clean with essential toiletries. We appreciated that the rooms now have upgraded bright lighting alongside the ambient ceiling glow!",
    date: "2026-03-24",
    verifiedStay: true
  }
];

// Clean Booking Ledger (no mock or fake guest data)
export const INITIAL_BOOKINGS: Booking[] = [];

