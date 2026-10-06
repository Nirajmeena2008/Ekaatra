import React, { useState, useEffect } from 'react';
import { 
  Room, 
  Booking, 
  PromoCode, 
  DynamicRateSettings, 
  INITIAL_ROOMS 
} from '../data/hotelData.ts';
import { api } from '../lib/api.ts';
import { SUPABASE_SQL_SCHEMA, isSupabaseConfigured } from '../lib/supabase.ts';
import { 
  X, 
  ShieldCheck, 
  BedDouble, 
  BookOpen, 
  TrendingUp, 
  Tag, 
  Database, 
  Plus, 
  Check, 
  Edit, 
  ToggleLeft, 
  ToggleRight, 
  Copy, 
  CheckCircle2, 
  UserPlus, 
  Filter,
  DollarSign
} from 'lucide-react';

interface AdminCrsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'hi';
}

export const AdminCrsModal: React.FC<AdminCrsModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  // Tabs: 'ledger' | 'walkin' | 'inventory' | 'rates' | 'promos' | 'supabase'
  const [activeTab, setActiveTab] = useState<'ledger' | 'walkin' | 'inventory' | 'rates' | 'promos' | 'supabase'>('ledger');
  const [loading, setLoading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Data states
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [rates, setRates] = useState<DynamicRateSettings | null>(null);
  const [promos, setPromos] = useState<PromoCode[]>([]);

  // Walk-in form state
  const [walkinGuestName, setWalkinGuestName] = useState('');
  const [walkinGuestPhone, setWalkinGuestPhone] = useState('');
  const [walkinGuestEmail, setWalkinGuestEmail] = useState('');
  const [walkinRoomId, setWalkinRoomId] = useState('');
  const [walkinNights, setWalkinNights] = useState(1);
  const [walkinSuccess, setWalkinSuccess] = useState<string | null>(null);

  // New Promo form
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoValue, setNewPromoValue] = useState(15);
  const [newPromoType, setNewPromoType] = useState<'percentage' | 'fixed'>('percentage');
  const [newPromoMin, setNewPromoMin] = useState(3000);

  // Rates edit state
  const [weekendMultiplier, setWeekendMultiplier] = useState(1.15);
  const [festivalActive, setFestivalActive] = useState(false);
  const [festivalMultiplier, setFestivalMultiplier] = useState(1.25);
  const [rateSuccess, setRateSuccess] = useState<string | null>(null);

  // Filter for ledger
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [bRes, rRes, rateRes, pRes] = await Promise.all([
        api.getBookings(),
        api.getRooms(),
        api.getRates(),
        api.getPromos()
      ]);
      if (bRes.success) setBookings(bRes.bookings);
      if (rRes.success) {
        setRooms(rRes.rooms);
        if (rRes.rooms.length > 0 && !walkinRoomId) {
          setWalkinRoomId(rRes.rooms[0].id);
        }
      }
      if (rateRes.success) {
        setRates(rateRes.rates);
        setWeekendMultiplier(rateRes.rates.weekendMultiplier);
        setFestivalActive(rateRes.rates.festivalSeasonActive);
        setFestivalMultiplier(rateRes.rates.festivalMultiplier);
      }
      if (pRes.success) setPromos(pRes.promos);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      const res = await api.updateBookingStatus(id, status);
      if (res.success) {
        setBookings(bookings.map(b => b.id === id ? res.booking : b));
      }
    } catch {
      alert('Failed to update booking status.');
    }
  };

  const handleToggleRoom = async (roomId: string) => {
    try {
      const res = await api.toggleRoom(roomId);
      if (res.success) {
        setRooms(rooms.map(r => r.id === roomId ? res.room : r));
      }
    } catch {
      alert('Failed to update room status.');
    }
  };

  const handleSaveRates = async () => {
    try {
      const res = await api.updateRates({
        weekendMultiplier: Number(weekendMultiplier),
        festivalSeasonActive: festivalActive,
        festivalMultiplier: Number(festivalMultiplier)
      });
      if (res.success) {
        setRates(res.rates);
        setRateSuccess('Dynamic rate rules saved successfully.');
        setTimeout(() => setRateSuccess(null), 4000);
      }
    } catch {
      alert('Failed to update rate rules.');
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode) return;
    try {
      const res = await api.createPromo({
        code: newPromoCode,
        discountType: newPromoType,
        value: Number(newPromoValue),
        minSpend: Number(newPromoMin),
        validUntil: '2026-12-31'
      });
      if (res.success) {
        setPromos([...promos, res.promo]);
        setNewPromoCode('');
      }
    } catch {
      alert('Failed to create promo code.');
    }
  };

  const handleCreateWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinGuestName || !walkinGuestPhone || !walkinRoomId) return;

    const today = new Date();
    const checkOut = new Date(today);
    checkOut.setDate(checkOut.getDate() + Number(walkinNights));
    const formatDate = (d: Date) => d.toISOString().split('T')[0];

    try {
      const res = await api.createBooking({
        guestName: walkinGuestName,
        guestEmail: walkinGuestEmail || `${walkinGuestPhone.replace(/\D/g, '')}@walkin.ekaatra.com`,
        guestPhone: walkinGuestPhone,
        idProofType: 'aadhaar',
        idProofNumber: 'WALK-IN-VERIFIED',
        roomId: walkinRoomId,
        checkIn: formatDate(today),
        checkOut: formatDate(checkOut),
        adults: 2,
        children: 0,
        paymentType: 'full',
        paymentMethod: 'walkin_cash',
        isWalkIn: true
      });

      if (res.success && res.booking) {
        setWalkinSuccess(`Walk-in guest registered & key issued! PNR: ${res.booking.id}`);
        setWalkinGuestName('');
        setWalkinGuestPhone('');
        setWalkinGuestEmail('');
        loadAllData();
      }
    } catch {
      alert('Failed to register walk-in booking.');
    }
  };

  const copySqlSchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  if (!isOpen) return null;

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : bookings.filter(b => b.bookingStatus === statusFilter);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative w-full max-w-6xl bg-white text-[#1E2B24] shadow-2xl border-t-4 border-[#C08A3E] my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#1E2B24] text-white p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#C08A3E]/20 text-[#C08A3E]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury text-xl sm:text-2xl font-normal tracking-wide">
                  Central Reservation System (CRS)
                </h3>
                <span className="text-[10px] bg-[#C08A3E] text-white font-bold uppercase tracking-wider px-2 py-0.5">
                  Staff Admin
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Ekaatra Luxury Hotel · Kukas, Jaipur · Inventory, Rates, Ledger & Supabase
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#EDE9DF] px-4 sm:px-6 flex flex-wrap border-b border-gray-200">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'ledger' ? 'border-[#1E2B24] text-[#1E2B24] bg-white' : 'border-transparent text-gray-600 hover:text-[#1E2B24]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Bookings Ledger ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('walkin')}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'walkin' ? 'border-[#1E2B24] text-[#1E2B24] bg-white' : 'border-transparent text-gray-600 hover:text-[#1E2B24]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-[#C08A3E]" />
            <span>Process Walk-in</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'inventory' ? 'border-[#1E2B24] text-[#1E2B24] bg-white' : 'border-transparent text-gray-600 hover:text-[#1E2B24]'
            }`}
          >
            <BedDouble className="w-3.5 h-3.5" />
            <span>Room Inventory ({rooms.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rates')}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'rates' ? 'border-[#1E2B24] text-[#1E2B24] bg-white' : 'border-transparent text-gray-600 hover:text-[#1E2B24]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Dynamic Rate Management</span>
          </button>

          <button
            onClick={() => setActiveTab('promos')}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'promos' ? 'border-[#1E2B24] text-[#1E2B24] bg-white' : 'border-transparent text-gray-600 hover:text-[#1E2B24]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Promos & Coupons</span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'supabase' ? 'border-[#1E2B24] text-[#1E2B24] bg-white' : 'border-transparent text-gray-600 hover:text-[#1E2B24]'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Supabase Database Hub</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* 1. BOOKINGS LEDGER */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-xs uppercase tracking-wider font-semibold text-gray-600">Filter Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-1.5 text-xs border border-gray-300 bg-white"
                  >
                    <option value="all">All ({bookings.length})</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="checked_in">Checked In</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <span className="text-xs text-gray-500">
                  Showing {filteredBookings.length} reservations
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 uppercase tracking-wider border-b border-gray-300">
                      <th className="p-3">PNR / Ref</th>
                      <th className="p-3">Guest</th>
                      <th className="p-3">Suite</th>
                      <th className="p-3">Dates</th>
                      <th className="p-3">Paid / Due</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="p-3 font-mono font-bold text-[#1E2B24]">{b.id}</td>
                        <td className="p-3">
                          <strong className="block text-gray-900">{b.guestName}</strong>
                          <span className="text-gray-500 text-[11px]">{b.guestPhone}</span>
                        </td>
                        <td className="p-3 font-medium text-gray-800">{b.roomName}</td>
                        <td className="p-3 text-gray-600 whitespace-nowrap">
                          {b.checkIn} → {b.checkOut} ({b.nights}n)
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="text-emerald-700 font-semibold block">₹{b.amountPaid.toLocaleString('en-IN')}</span>
                          {b.amountDue > 0 && (
                            <span className="text-amber-700 text-[10px] font-bold">Due: ₹{b.amountDue.toLocaleString('en-IN')}</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                            b.bookingStatus === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            b.bookingStatus === 'checked_in' ? 'bg-emerald-100 text-emerald-800' :
                            b.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-200 text-gray-800'
                          }`}>
                            {b.bookingStatus}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap space-x-1">
                          {b.bookingStatus === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'checked_in')}
                              className="px-2 py-1 bg-emerald-600 text-white text-[10px] font-bold uppercase hover:bg-emerald-700"
                            >
                              Check-In
                            </button>
                          )}
                          {b.bookingStatus === 'checked_in' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                              className="px-2 py-1 bg-[#1E2B24] text-white text-[10px] font-bold uppercase hover:bg-gray-800"
                            >
                              Check-Out
                            </button>
                          )}
                          {b.bookingStatus !== 'cancelled' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                              className="px-2 py-1 text-red-600 border border-red-300 text-[10px] font-bold uppercase hover:bg-red-50"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. WALK-IN RESERVATION */}
          {activeTab === 'walkin' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center pb-2">
                <h4 className="font-serif-luxury text-xl font-normal text-[#1E2B24]">
                  Instant Walk-in Guest Check-In (90-Second Key Issue)
                </h4>
                <p className="text-xs text-gray-500">
                  Quick offline reservation form for guests arriving directly at Ekaatra front desk.
                </p>
              </div>

              {walkinSuccess && (
                <div className="bg-emerald-50 border border-emerald-400 p-4 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>{walkinSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateWalkin} className="space-y-4 bg-gray-50 p-6 border border-gray-200">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Guest Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohit Rathore"
                    value={walkinGuestName}
                    onChange={(e) => setWalkinGuestName(e.target.value)}
                    className="w-full p-2.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#C08A3E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                      Guest Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98290 00000"
                      value={walkinGuestPhone}
                      onChange={(e) => setWalkinGuestPhone(e.target.value)}
                      className="w-full p-2.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#C08A3E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="guest@example.com"
                      value={walkinGuestEmail}
                      onChange={(e) => setWalkinGuestEmail(e.target.value)}
                      className="w-full p-2.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#C08A3E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                      Select Suite Category
                    </label>
                    <select
                      value={walkinRoomId}
                      onChange={(e) => setWalkinRoomId(e.target.value)}
                      className="w-full p-2.5 text-xs border border-gray-300 bg-white"
                    >
                      {rooms.filter(r => r.active).map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name} (₹{r.pricePerNight.toLocaleString('en-IN')}/night)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                      Duration of Stay
                    </label>
                    <select
                      value={walkinNights}
                      onChange={(e) => setWalkinNights(Number(e.target.value))}
                      className="w-full p-2.5 text-xs border border-gray-300 bg-white"
                    >
                      {[1, 2, 3, 4, 5, 7, 10].map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'Night' : 'Nights'}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C08A3E] hover:bg-[#a67431] text-white py-3 text-xs font-semibold uppercase tracking-[0.2em] shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Issue Key & Confirm Walk-in Check-in</span>
                </button>
              </form>
            </div>
          )}

          {/* 3. ROOM INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <div>
                  <h4 className="font-serif-luxury text-lg font-normal text-[#1E2B24]">
                    Property Room Categories & Inventory
                  </h4>
                  <p className="text-xs text-gray-500">
                    Adjust base rates, total available room units, and status.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rooms.map((room) => (
                  <div key={room.id} className="p-4 border border-gray-200 bg-gray-50 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold text-[#1E2B24]">{room.id}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${room.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-300 text-gray-700'}`}>
                          {room.active ? 'Active' : 'Maintenance'}
                        </span>
                      </div>
                      <h5 className="font-serif-luxury text-base font-semibold text-[#1E2B24]">{room.name}</h5>
                      <p className="text-xs text-gray-600 mt-1">{room.description}</p>
                      
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs py-2 border-y border-gray-200">
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase block">Base Rate</span>
                          <strong>₹{room.pricePerNight.toLocaleString('en-IN')}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase block">Total Units</span>
                          <strong>{room.totalInventory} Rooms</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase block">Size</span>
                          <strong>{room.sizeSqFt} sq. ft.</strong>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 flex items-center justify-between">
                      <button
                        onClick={() => handleToggleRoom(room.id)}
                        className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
                          room.active ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {room.active ? 'Disable Room' : 'Activate Room'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. DYNAMIC RATE MANAGEMENT */}
          {activeTab === 'rates' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h4 className="font-serif-luxury text-xl font-normal text-[#1E2B24] mb-1">
                  Dynamic Pricing & Surcharge Engine
                </h4>
                <p className="text-xs text-gray-500">
                  Control automatic rate multipliers for weekend surges and Jaipur festival periods.
                </p>
              </div>

              {rateSuccess && (
                <div className="bg-emerald-50 border border-emerald-400 p-3 text-xs text-emerald-800">
                  {rateSuccess}
                </div>
              )}

              <div className="space-y-4 bg-gray-50 p-6 border border-gray-200">
                {/* Weekend Surge */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                    Weekend Multiplier (Friday & Saturday)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.05"
                      min="1.0"
                      max="2.0"
                      value={weekendMultiplier}
                      onChange={(e) => setWeekendMultiplier(Number(e.target.value))}
                      className="p-2 text-xs border border-gray-300 w-32 bg-white"
                    />
                    <span className="text-xs text-gray-600">
                      = {Math.round((weekendMultiplier - 1) * 100)}% surge over base rate
                    </span>
                  </div>
                </div>

                {/* Festival Season */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs uppercase tracking-wider font-semibold text-gray-700">
                      Jaipur / Kukas Festival Surcharge Season
                    </label>
                    <button
                      type="button"
                      onClick={() => setFestivalActive(!festivalActive)}
                      className={`px-3 py-1 text-xs font-bold uppercase ${festivalActive ? 'bg-[#C08A3E] text-white' : 'bg-gray-300 text-gray-700'}`}
                    >
                      {festivalActive ? 'Active' : 'Disabled'}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.05"
                      min="1.0"
                      max="2.5"
                      value={festivalMultiplier}
                      onChange={(e) => setFestivalMultiplier(Number(e.target.value))}
                      className="p-2 text-xs border border-gray-300 w-32 bg-white"
                    />
                    <span className="text-xs text-gray-600">
                      = {Math.round((festivalMultiplier - 1) * 100)}% festival surge (Diwali, Pushkar, Royal Weddings)
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveRates}
                    className="bg-[#1E2B24] text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-gray-800"
                  >
                    Save Rate Rules
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. PROMOS & COUPONS */}
          {activeTab === 'promos' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-serif-luxury text-xl font-normal text-[#1E2B24] mb-1">
                  Promotional Voucher Engine
                </h4>
                <p className="text-xs text-gray-500">
                  Manage active discount codes for direct website bookings.
                </p>
              </div>

              {/* Create new promo */}
              <form onSubmit={handleCreatePromo} className="p-4 bg-gray-50 border border-gray-200 flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LUXURY20"
                    value={newPromoCode}
                    onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                    className="p-2 text-xs border border-gray-300 uppercase bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Discount Type</label>
                  <select
                    value={newPromoType}
                    onChange={(e: any) => setNewPromoType(e.target.value)}
                    className="p-2 text-xs border border-gray-300 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Value</label>
                  <input
                    type="number"
                    required
                    value={newPromoValue}
                    onChange={(e) => setNewPromoValue(Number(e.target.value))}
                    className="p-2 text-xs border border-gray-300 w-24 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Min Spend (₹)</label>
                  <input
                    type="number"
                    value={newPromoMin}
                    onChange={(e) => setNewPromoMin(Number(e.target.value))}
                    className="p-2 text-xs border border-gray-300 w-28 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#C08A3E] hover:bg-[#a67431] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Promo</span>
                </button>
              </form>

              {/* Promo List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {promos.map((p) => (
                  <div key={p.id} className="p-3 border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm font-bold text-[#1E2B24]">{p.code}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 uppercase">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {p.discountType === 'percentage' ? `${p.value}% Off` : `₹${p.value} Flat Off`}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1">Min Spend: ₹{p.minSpend.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-gray-400 mt-2">Redemptions: {p.usageCount}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. SUPABASE DATABASE HUB */}
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-emerald-50 border border-emerald-300">
                <div className="flex items-center gap-3">
                  <Database className="w-8 h-8 text-emerald-700" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
                        Supabase PostgreSQL Architecture
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-200 text-emerald-900 font-bold uppercase">
                        {isSupabaseConfigured ? 'Connected to Remote DB' : 'Ready / Active Fallback Store'}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Tables for Rooms, Bookings, Promos, Dynamic Rates, Gallery, and Reviews with Row Level Security.
                    </p>
                  </div>
                </div>

                <button
                  onClick={copySqlSchema}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'SQL Copied!' : 'Copy Supabase DDL SQL'}</span>
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-gray-50 p-4 border border-gray-200 text-xs text-gray-700 space-y-2">
                <p className="font-semibold text-gray-900">How to connect your own Supabase project:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-600">
                  <li>Click <strong>Copy Supabase DDL SQL</strong> above.</li>
                  <li>In your Supabase project dashboard, open the <strong>SQL Editor</strong> and run the script.</li>
                  <li>Add <code className="bg-gray-200 px-1 py-0.5">VITE_SUPABASE_URL</code> and <code className="bg-gray-200 px-1 py-0.5">VITE_SUPABASE_ANON_KEY</code> to your environment.</li>
                  <li>All room bookings, rates, and guest ID proofs will automatically sync in real-time!</li>
                </ol>
              </div>

              {/* Code Preview */}
              <div>
                <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                  Preview of PostgreSQL Migration Script:
                </span>
                <pre className="bg-[#1E2B24] text-emerald-400 p-4 text-[11px] font-mono overflow-x-auto max-h-60 border border-gray-700">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
