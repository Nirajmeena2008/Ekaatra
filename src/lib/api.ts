import { Room, Booking, PromoCode, DynamicRateSettings, GalleryItem, ReviewItem } from '../data/hotelData.ts';

const API_BASE = '/api';

export const api = {
  // Mobile OTP Authentication
  async sendOtp(payload: { name: string; phone: string; email?: string }): Promise<{ success: boolean; message: string; demoOtp?: string }> {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async verifyOtp(payload: { phone: string; otp: string; name?: string; email?: string }): Promise<{ success: boolean; message: string; user?: any }> {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Config & Health
  async getConfig() {
    const res = await fetch(`${API_BASE}/config`);
    return res.json();
  },

  // Rooms
  async getRooms(): Promise<{ success: boolean; rooms: Room[] }> {
    const res = await fetch(`${API_BASE}/rooms`);
    return res.json();
  },

  async createRoom(room: Partial<Room>): Promise<{ success: boolean; room: Room }> {
    const res = await fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room)
    });
    return res.json();
  },

  async updateRoom(id: string, room: Partial<Room>): Promise<{ success: boolean; room: Room }> {
    const res = await fetch(`${API_BASE}/rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room)
    });
    return res.json();
  },

  async toggleRoom(id: string): Promise<{ success: boolean; room: Room }> {
    const res = await fetch(`${API_BASE}/rooms/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Availability & Dynamic Pricing
  async checkAvailability(params: { checkIn: string; checkOut: string; adults: number; children: number }) {
    const res = await fetch(`${API_BASE}/availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return res.json();
  },

  // Bookings
  async getBookings(filters?: { email?: string; phone?: string; status?: string }): Promise<{ success: boolean; bookings: Booking[] }> {
    const query = new URLSearchParams();
    if (filters?.email) query.set('email', filters.email);
    if (filters?.phone) query.set('phone', filters.phone);
    if (filters?.status) query.set('status', filters.status);
    const res = await fetch(`${API_BASE}/bookings?${query.toString()}`);
    return res.json();
  },

  async getBookingById(id: string): Promise<{ success: boolean; booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings/${id}`);
    return res.json();
  },

  async createBooking(bookingData: any): Promise<{ success: boolean; booking: Booking; message: string }> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    return res.json();
  },

  async updateBookingStatus(id: string, status: string, reason?: string): Promise<{ success: boolean; booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, cancellationReason: reason })
    });
    return res.json();
  },

  async uploadIdProof(id: string, payload: { idProofType: string; idProofNumber: string; idProofData?: string }): Promise<{ success: boolean; message: string; booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings/${id}/upload-id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Promos
  async validatePromo(code: string, amount?: number) {
    const res = await fetch(`${API_BASE}/promos/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, amount })
    });
    return res.json();
  },

  async getPromos(): Promise<{ success: boolean; promos: PromoCode[] }> {
    const res = await fetch(`${API_BASE}/promos`);
    return res.json();
  },

  async createPromo(promo: Partial<PromoCode>): Promise<{ success: boolean; promo: PromoCode }> {
    const res = await fetch(`${API_BASE}/promos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(promo)
    });
    return res.json();
  },

  // Rates
  async getRates(): Promise<{ success: boolean; rates: DynamicRateSettings }> {
    const res = await fetch(`${API_BASE}/rates`);
    return res.json();
  },

  async updateRates(rates: Partial<DynamicRateSettings>): Promise<{ success: boolean; rates: DynamicRateSettings }> {
    const res = await fetch(`${API_BASE}/rates`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rates)
    });
    return res.json();
  },

  // Gallery
  async getGallery(): Promise<{ success: boolean; gallery: GalleryItem[] }> {
    const res = await fetch(`${API_BASE}/gallery`);
    return res.json();
  },

  async addGalleryItem(item: Partial<GalleryItem>): Promise<{ success: boolean; item: GalleryItem }> {
    const res = await fetch(`${API_BASE}/gallery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    return res.json();
  },

  // Reviews
  async getReviews(): Promise<{ success: boolean; reviews: ReviewItem[] }> {
    const res = await fetch(`${API_BASE}/reviews`);
    return res.json();
  },

  async addReview(review: Partial<ReviewItem>): Promise<{ success: boolean; review: ReviewItem }> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    return res.json();
  }
};
