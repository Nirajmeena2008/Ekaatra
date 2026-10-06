import React, { useState, useEffect } from 'react';
import { 
  Room, 
  AVAILABLE_ADDONS, 
  HOTEL_INFO, 
  Booking,
  INITIAL_ROOMS
} from '../data/hotelData.ts';
import { api } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  X, 
  Calendar, 
  Users, 
  Check, 
  ShieldCheck, 
  CreditCard, 
  QrCode, 
  Tag, 
  Car, 
  Utensils, 
  Bed, 
  Heart, 
  Clock, 
  Printer, 
  CheckCircle2, 
  AlertTriangle,
  Upload,
  ArrowRight,
  ChevronLeft,
  Share2,
  FileCheck
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoom: Room | null;
  initialParams?: { checkIn: string; checkOut: string; adults: number; children: number };
  currency: 'INR' | 'USD';
  lang: 'en' | 'hi';
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedRoom,
  initialParams,
  currency,
  lang
}) => {
  const { user, isLoggedIn, openLoginModal } = useAuth();

  // Steps: 1: Details & Dates, 2: Add-ons & Promos, 3: Payment & Advance, 4: Confirmation Voucher
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Today and tomorrow defaults
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const [activeRoom, setActiveRoom] = useState<Room>(selectedRoom || INITIAL_ROOMS[0]);
  const [checkIn, setCheckIn] = useState<string>(initialParams?.checkIn || formatDate(today));
  const [checkOut, setCheckOut] = useState<string>(initialParams?.checkOut || formatDate(tomorrow));
  const [adults, setAdults] = useState<number>(initialParams?.adults || 2);
  const [children, setChildren] = useState<number>(initialParams?.children || 0);

  // Guest Details initialized from logged in user
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (user) {
      if (!guestName) setGuestName(user.name);
      if (!guestPhone) setGuestPhone(user.phone);
      if (!guestEmail && user.email) setGuestEmail(user.email);
    }
  }, [user]);
  
  // ID Proof compliance
  const [idProofType, setIdProofType] = useState<'aadhaar' | 'passport' | 'driving_license' | 'voter_id'>('aadhaar');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [idFileUploaded, setIdFileUploaded] = useState(false);
  const [idFilePreview, setIdFilePreview] = useState<string | null>(null);

  // Add-ons selected
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});

  // Promo code
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Payment method & partial advance
  const [paymentType, setPaymentType] = useState<'full' | 'advance_50' | 'advance_25'>('full');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiVpa, setUpiVpa] = useState('');

  // Confirmed booking
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (selectedRoom) {
      setActiveRoom(selectedRoom);
    }
  }, [selectedRoom]);

  if (!isOpen) return null;

  // Nights calculation
  const dIn = new Date(checkIn);
  const dOut = new Date(checkOut);
  const nights = Math.max(1, Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24)));

  // Pricing calculations
  const baseRateTotal = activeRoom.pricePerNight * nights;

  // Addons total
  const addOnsList = AVAILABLE_ADDONS.filter(a => selectedAddons[a.id]).map(a => ({
    id: a.id,
    name: a.name,
    price: a.price,
    quantity: a.id === 'royal_breakfast' ? adults : 1
  }));
  const addOnsTotal = addOnsList.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  // Promo discount
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.discountType === 'percentage') {
      discountAmount = Math.round((baseRateTotal * appliedPromo.value) / 100);
      if (appliedPromo.maxDiscount && discountAmount > appliedPromo.maxDiscount) {
        discountAmount = appliedPromo.maxDiscount;
      }
    } else {
      discountAmount = appliedPromo.value;
    }
  }

  const taxableAmount = Math.max(0, baseRateTotal + addOnsTotal - discountAmount);
  const effectiveNightly = taxableAmount / nights;
  const gstRate = effectiveNightly > 7500 ? 18 : 12;
  const gstAmount = Math.round((taxableAmount * gstRate) / 100);
  const grandTotal = taxableAmount + gstAmount;

  let amountToPayNow = grandTotal;
  let amountPayAtCheckin = 0;
  if (paymentType === 'advance_50') {
    amountToPayNow = Math.round(grandTotal * 0.5);
    amountPayAtCheckin = grandTotal - amountToPayNow;
  } else if (paymentType === 'advance_25') {
    amountToPayNow = Math.round(grandTotal * 0.25);
    amountPayAtCheckin = grandTotal - amountToPayNow;
  }

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError(null);
    try {
      const res = await api.validatePromo(promoInput, baseRateTotal);
      if (res.success && res.promo) {
        setAppliedPromo(res.promo);
      } else {
        setPromoError(res.message || 'Invalid promotional code');
      }
    } catch {
      setPromoError('Failed to validate code');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdFilePreview(reader.result as string);
        setIdFileUploaded(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBooking = async () => {
    if (!guestName || !guestEmail || !guestPhone) {
      setErrorMsg('Please enter your full name, email, and phone number.');
      setStep(1);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        guestName,
        guestEmail,
        guestPhone,
        idProofType,
        idProofNumber: idProofNumber || 'VERIFIED-AT-CHECKIN',
        idProofUrl: idFilePreview,
        roomId: activeRoom.id,
        checkIn,
        checkOut,
        adults,
        children,
        addOns: addOnsList,
        promoCode: appliedPromo?.code,
        paymentType,
        paymentMethod,
        specialRequests
      };

      const res = await api.createBooking(payload);
      if (res.success && res.booking) {
        setConfirmedBooking(res.booking);
        setStep(4);
      } else {
        setErrorMsg(res.message || 'Failed to complete reservation. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred during reservation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative w-full max-w-4xl bg-white text-[#1E2B24] shadow-2xl border-t-4 border-[#C08A3E] my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#1E2B24] text-white p-4 sm:p-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-luxury text-xl sm:text-2xl tracking-[0.2em] font-normal uppercase">
                EKAATRA
              </span>
              <span className="text-[10px] text-[#C08A3E] uppercase tracking-[0.3em] font-semibold border-l border-white/20 pl-2">
                Direct Booking Engine
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1 font-light">
              Kukas, Jaipur · Best Rate Guarantee with Zero Booking Fees
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close booking modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        {step < 4 && (
          <div className="bg-[#EDE9DF] px-6 py-3 border-b border-gray-200 flex items-center justify-between text-xs font-semibold uppercase tracking-wider">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#1E2B24]' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-[#C08A3E] text-[#1E2B24] font-bold' : 'bg-gray-300 text-gray-600'}`}>1</span>
              <span>Stay & Guest</span>
            </div>
            <span className="text-gray-300">/</span>
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#1E2B24]' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-[#C08A3E] text-[#1E2B24] font-bold' : 'bg-gray-300 text-gray-600'}`}>2</span>
              <span>Add-ons & Promos</span>
            </div>
            <span className="text-gray-300">/</span>
            <div className={`flex items-center gap-2 ${step >= 3 ? 'text-[#1E2B24]' : 'text-gray-400'}`}>
              <span className={`w-5 h-5 flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-[#C08A3E] text-[#1E2B24] font-bold' : 'bg-gray-300 text-gray-600'}`}>3</span>
              <span>Payment</span>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4 text-xs text-red-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[72vh] overflow-y-auto">
          {/* STEP 1: Dates, Suite selection, Guest info & ID proof */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Selected Suite summary */}
              <div className="p-4 bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={activeRoom.images[0]}
                    alt={activeRoom.name}
                    className="w-20 h-16 object-cover"
                  />
                  <div>
                    <h4 className="font-serif-luxury text-lg font-medium text-[#1E2B24]">{activeRoom.name}</h4>
                    <p className="text-xs text-gray-500">{activeRoom.bedType} · {activeRoom.sizeSqFt} sq. ft.</p>
                    <div className="flex gap-1 mt-1">
                      {activeRoom.featureTags.slice(0, 2).map((t, idx) => (
                        <span key={idx} className="text-[10px] bg-white px-1.5 py-0.5 border text-[#C08A3E] font-semibold">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-serif-luxury text-xl font-bold text-[#1E2B24]">
                    ₹{activeRoom.pricePerNight.toLocaleString('en-IN')}
                  </span>
                  <p className="text-[10px] text-gray-500 uppercase">per night + GST</p>
                </div>
              </div>

              {/* Dates & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    min={formatDate(new Date())}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full p-2.5 text-xs border border-gray-300 font-medium focus:border-[#C08A3E] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    min={checkIn || formatDate(new Date())}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full p-2.5 text-xs border border-gray-300 font-medium focus:border-[#C08A3E] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-1">
                    Adults (12+ yrs)
                  </label>
                  <select
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    className="w-full p-2.5 text-xs border border-gray-300 font-medium focus:border-[#C08A3E] outline-none bg-white"
                  >
                    {[1, 2, 3, 4].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-1">
                    Children (0-11 yrs)
                  </label>
                  <select
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    className="w-full p-2.5 text-xs border border-gray-300 font-medium focus:border-[#C08A3E] outline-none bg-white"
                  >
                    {[0, 1, 2].map(n => (
                      <option key={n} value={n}>{n} Children</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guest Primary Details */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-[#1E2B24] mb-3">
                  Lead Guest Information (Required for Check-in)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 font-medium mb-1">Full Legal Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Arun Sharma"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full p-2.5 text-xs border border-gray-300 focus:border-[#C08A3E] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 font-medium mb-1">Email (For Booking Voucher) *</label>
                    <input
                      type="email"
                      placeholder="guest@example.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full p-2.5 text-xs border border-gray-300 focus:border-[#C08A3E] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 font-medium mb-1">Mobile Number (For WhatsApp / SMS) *</label>
                    <input
                      type="tel"
                      placeholder="+91 98290 00000"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full p-2.5 text-xs border border-gray-300 focus:border-[#C08A3E] outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Government ID Compliance (Indian Hospitality Law) */}
              <div className="p-4 bg-[#EDE9DF]/60 border border-[#C08A3E]/30">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-4 h-4 text-[#C08A3E]" />
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1E2B24]">
                    Indian Hospitality Compliance: Government ID Proof
                  </h4>
                </div>
                <p className="text-[11px] text-gray-600 mb-3">
                  Under local government regulations, all Indian and international guests must present a valid government ID upon arrival. You may provide it now for 90-second express check-in.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">ID Document Type</label>
                    <select
                      value={idProofType}
                      onChange={(e: any) => setIdProofType(e.target.value)}
                      className="w-full p-2 text-xs border border-gray-300 bg-white"
                    >
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="passport">Passport</option>
                      <option value="driving_license">Driving License</option>
                      <option value="voter_id">Voter ID</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">ID Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. XXXX-XXXX-1234"
                      value={idProofNumber}
                      onChange={(e) => setIdProofNumber(e.target.value)}
                      className="w-full p-2 text-xs border border-gray-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">Upload Photo / Document</label>
                    <label className="flex items-center justify-center gap-1.5 p-2 text-xs border border-dashed border-[#C08A3E] bg-white cursor-pointer hover:bg-gray-50 text-gray-700">
                      <Upload className="w-3.5 h-3.5 text-[#C08A3E]" />
                      <span>{idFileUploaded ? 'File Attached ✓' : 'Upload ID'}</span>
                      <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {idFilePreview && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2 border border-emerald-200">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>ID proof attached. Your digital key will be pre-activated for express entry.</span>
                  </div>
                )}
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-600 mb-1">
                  Special Requests (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Quiet upper floor room, twin beds, late arrival at 9 PM"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-300 focus:border-[#C08A3E] outline-none"
                />
              </div>

              {/* Continue to Step 2 */}
              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (!guestName || !guestEmail || !guestPhone) {
                      setErrorMsg('Please enter your full name, email, and mobile number.');
                      return;
                    }
                    setErrorMsg(null);
                    setStep(2);
                  }}
                  className="bg-[#C08A3E] hover:bg-[#a67431] text-[#1E2B24] font-bold px-6 py-3 text-xs uppercase tracking-[0.2em] flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Select Add-ons & Coupons</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Add-ons & Promo Code */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="font-serif-luxury text-xl font-normal text-[#1E2B24] mb-1">
                  Enhance Your Stay at Ekaatra
                </h4>
                <p className="text-xs text-gray-500">
                  Select optional bespoke services to elevate your Kukas luxury experience.
                </p>
              </div>

              {/* Add-ons List */}
              <div className="space-y-3">
                {AVAILABLE_ADDONS.map((addon) => {
                  const isChecked = Boolean(selectedAddons[addon.id]);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => setSelectedAddons({ ...selectedAddons, [addon.id]: !isChecked })}
                      className={`p-4 border transition-all cursor-pointer flex items-center justify-between ${
                        isChecked ? 'border-[#C08A3E] bg-[#EDE9DF]/40 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 border flex items-center justify-center ${isChecked ? 'bg-[#C08A3E] border-[#C08A3E] text-white' : 'border-gray-400 bg-white'}`}>
                          {isChecked && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <h5 className="text-xs sm:text-sm font-semibold text-[#1E2B24]">{addon.name}</h5>
                          <p className="text-xs text-gray-500 font-light mt-0.5">{addon.description}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-4">
                        <span className="text-xs sm:text-sm font-bold text-[#1E2B24]">
                          + ₹{addon.price.toLocaleString('en-IN')}
                        </span>
                        {addon.id === 'royal_breakfast' && (
                          <p className="text-[10px] text-gray-500">per guest/day</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code Input */}
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-2">
                  Apply Promotional / Privilege Code
                </label>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10, KUKASROYAL"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    className="flex-1 p-2.5 text-xs uppercase tracking-wider font-semibold border border-gray-300 focus:border-[#C08A3E] outline-none"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="bg-[#1E2B24] text-white px-5 py-2.5 text-xs uppercase tracking-wider font-semibold hover:bg-gray-800"
                  >
                    Apply
                  </button>
                </div>

                {appliedPromo && (
                  <div className="mt-2 text-xs text-emerald-700 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Code <strong>{appliedPromo.code}</strong> applied! You save ₹{discountAmount.toLocaleString('en-IN')}.
                    </span>
                  </div>
                )}
                {promoError && (
                  <p className="mt-2 text-xs text-red-600">{promoError}</p>
                )}

                <div className="mt-2 text-[11px] text-gray-500">
                  Try <strong>WELCOME10</strong> for 10% off or <strong>KUKASROYAL</strong> for ₹1,000 off!
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 text-xs uppercase tracking-wider text-gray-600 border border-gray-300 hover:bg-gray-50 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  onClick={() => setStep(3)}
                  className="bg-[#C08A3E] hover:bg-[#a67431] text-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] flex items-center gap-2"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Transparent Pricing Breakdown & Payment Options */}
          {step === 3 && (
            <div className="space-y-6">
              {/* Pricing Ledger Breakdown */}
              <div className="bg-[#EDE9DF]/60 border border-[#A3B8A0]/40 p-5">
                <h4 className="font-serif-luxury text-lg font-medium text-[#1E2B24] mb-3 pb-2 border-b border-[#A3B8A0]/30">
                  Price Calculation & Tax Breakdown
                </h4>

                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex justify-between">
                    <span>{activeRoom.name} ({nights} {nights === 1 ? 'night' : 'nights'})</span>
                    <span className="font-medium">₹{baseRateTotal.toLocaleString('en-IN')}</span>
                  </div>

                  {addOnsList.map((addon) => (
                    <div key={addon.id} className="flex justify-between text-gray-600">
                      <span>{addon.name} (x{addon.quantity})</span>
                      <span>+ ₹{(addon.price * addon.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Promo Discount ({appliedPromo?.code})</span>
                      <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600 pt-1 border-t border-gray-200">
                    <span>Taxable Base Value</span>
                    <span>₹{taxableAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>GST (Indian Hospitality {gstRate}%)</span>
                    <span>+ ₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex justify-between text-sm font-bold text-[#1E2B24] pt-2 border-t-2 border-[#1E2B24]">
                    <span>Grand Total</span>
                    <span className="font-serif-luxury text-base text-[#C08A3E]">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Partial Advance Payment Selection */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-2">
                  Flexible Payment Plan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setPaymentType('full')}
                    className={`p-3 border cursor-pointer ${paymentType === 'full' ? 'border-[#C08A3E] bg-[#EDE9DF]/50 shadow-sm' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#1E2B24]">100% Full Payment</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 font-bold">Fastest</span>
                    </div>
                    <p className="text-xs text-gray-600">Pay ₹{grandTotal.toLocaleString('en-IN')} now</p>
                    <p className="text-[10px] text-gray-500">₹0 due at check-in</p>
                  </div>

                  <div
                    onClick={() => setPaymentType('advance_50')}
                    className={`p-3 border cursor-pointer ${paymentType === 'advance_50' ? 'border-[#C08A3E] bg-[#EDE9DF]/50 shadow-sm' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#1E2B24]">50% Advance</span>
                    </div>
                    <p className="text-xs text-gray-600">Pay ₹{Math.round(grandTotal * 0.5).toLocaleString('en-IN')} now</p>
                    <p className="text-[10px] text-gray-500">Balance ₹{Math.round(grandTotal * 0.5).toLocaleString('en-IN')} at check-in</p>
                  </div>

                  <div
                    onClick={() => setPaymentType('advance_25')}
                    className={`p-3 border cursor-pointer ${paymentType === 'advance_25' ? 'border-[#C08A3E] bg-[#EDE9DF]/50 shadow-sm' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#1E2B24]">25% Token Advance</span>
                    </div>
                    <p className="text-xs text-gray-600">Pay ₹{Math.round(grandTotal * 0.25).toLocaleString('en-IN')} now</p>
                    <p className="text-[10px] text-gray-500">Balance ₹{Math.round(grandTotal * 0.75).toLocaleString('en-IN')} at check-in</p>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-2">
                  Select Payment Gateway Mode (PCI-DSS Tokenized)
                </label>
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex-1 py-2 px-3 text-xs font-semibold uppercase tracking-wider border flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'upi' ? 'bg-[#1E2B24] text-white border-[#1E2B24]' : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-2 px-3 text-xs font-semibold uppercase tracking-wider border flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'card' ? 'bg-[#1E2B24] text-white border-[#1E2B24]' : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Credit / Debit Card</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`flex-1 py-2 px-3 text-xs font-semibold uppercase tracking-wider border flex items-center justify-center gap-1.5 ${
                      paymentMethod === 'netbanking' ? 'bg-[#1E2B24] text-white border-[#1E2B24]' : 'border-gray-300 text-gray-700'
                    }`}
                  >
                    <span>Net Banking</span>
                  </button>
                </div>

                {/* Simulated UPI Screen */}
                {paymentMethod === 'upi' && (
                  <div className="p-4 bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center gap-6">
                    <div className="p-3 bg-white border border-gray-300 text-center shrink-0">
                      <div className="w-32 h-32 bg-gray-900 flex items-center justify-center text-white text-xs p-2 text-center">
                        <QrCode className="w-24 h-24 text-white" />
                      </div>
                      <span className="text-[10px] text-gray-500 mt-1 block">Scan with any UPI App</span>
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-800">Supported:</span>
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold border">GPay</span>
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold border">PhonePe</span>
                          <span className="px-2 py-0.5 bg-sky-50 text-sky-700 text-[10px] font-bold border">Paytm</span>
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-bold border">BHIM</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">Or enter your UPI ID (VPA)</label>
                        <input
                          type="text"
                          placeholder="e.g. mobile@okaxis"
                          value={upiVpa}
                          onChange={(e) => setUpiVpa(e.target.value)}
                          className="w-full p-2 text-xs border border-gray-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulated Card Screen */}
                {paymentMethod === 'card' && (
                  <div className="p-4 bg-gray-50 border border-gray-200 space-y-3">
                    <div>
                      <label className="block text-[11px] text-gray-600 mb-1">Card Number (Tokenized - 256-bit Encrypted)</label>
                      <input
                        type="text"
                        placeholder="16-digit card number"
                        className="w-full p-2 text-xs border border-gray-300 bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full p-2 text-xs border border-gray-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-600 mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          placeholder="CVV"
                          className="w-full p-2 text-xs border border-gray-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Simulated Net Banking */}
                {paymentMethod === 'netbanking' && (
                  <div className="p-4 bg-gray-50 border border-gray-200">
                    <label className="block text-[11px] text-gray-600 mb-1">Select Bank</label>
                    <select className="w-full p-2 text-xs border border-gray-300 bg-white">
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 text-xs uppercase tracking-wider text-gray-600 border border-gray-300 hover:bg-gray-50 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  onClick={handleCreateBooking}
                  disabled={loading}
                  className="bg-[#C08A3E] hover:bg-[#a67431] text-[#1E2B24] font-bold px-8 py-3.5 text-xs uppercase tracking-[0.2em] shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>Securing PNR...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Confirm & Pay ₹{amountToPayNow.toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Official Booking Voucher & PNR Receipt */}
          {step === 4 && confirmedBooking && (
            <div className="space-y-6">
              {/* Success Badge */}
              <div className="bg-emerald-50 border border-emerald-300 p-4 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h3 className="font-serif-luxury text-2xl font-bold text-emerald-900">
                  Reservation Confirmed!
                </h3>
                <p className="text-xs text-emerald-800 mt-1">
                  We look forward to welcoming you with warmth and humility to Kukas, Jaipur.
                </p>
                <div className="mt-3 inline-block bg-white px-4 py-1.5 border border-emerald-300 text-emerald-950 text-xs font-mono font-bold tracking-widest">
                  PNR: {confirmedBooking.id}
                </div>
              </div>

              {/* Printable Voucher Paper */}
              <div id="printable-voucher" className="border-2 border-gray-300 p-6 bg-white shadow-sm font-sans">
                {/* Voucher Top Brand */}
                <div className="flex items-start justify-between pb-4 border-b-2 border-[#1E2B24]">
                  <div>
                    <h2 className="font-serif-luxury text-2xl tracking-[0.2em] font-normal uppercase text-[#1E2B24]">
                      EKAATRA
                    </h2>
                    <p className="text-[10px] text-[#C08A3E] uppercase tracking-[0.3em] font-semibold">
                      Boutique Hotel & Suites · Kukas, Jaipur
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {HOTEL_INFO.location} · Tel: {HOTEL_INFO.phone}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold block">Official Booking PNR</span>
                    <span className="text-base font-mono font-bold text-[#1E2B24]">{confirmedBooking.id}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold uppercase block mt-1">
                      Status: {confirmedBooking.bookingStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Guest & Stay Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-gray-200 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-semibold block">Guest Name</span>
                    <strong className="text-[#1E2B24]">{confirmedBooking.guestName}</strong>
                    <p className="text-[11px] text-gray-500">{confirmedBooking.guestPhone}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-semibold block">Suite Category</span>
                    <strong className="text-[#1E2B24]">{confirmedBooking.roomName}</strong>
                    <p className="text-[11px] text-gray-500">{confirmedBooking.adults} Adults, {confirmedBooking.children} Child</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-semibold block">Check-in</span>
                    <strong className="text-[#1E2B24]">{confirmedBooking.checkIn}</strong>
                    <p className="text-[11px] text-gray-500">From 14:00 (90s Key)</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-semibold block">Check-out</span>
                    <strong className="text-[#1E2B24]">{confirmedBooking.checkOut}</strong>
                    <p className="text-[11px] text-gray-500">Until 11:00 AM</p>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="py-4 border-b border-gray-200">
                  <div className="flex justify-between text-xs py-1">
                    <span>Base Rate ({confirmedBooking.nights} nights)</span>
                    <span>₹{confirmedBooking.baseRateTotal.toLocaleString('en-IN')}</span>
                  </div>
                  {confirmedBooking.addOnsTotal > 0 && (
                    <div className="flex justify-between text-xs py-1 text-gray-600">
                      <span>Selected Add-ons & Transfers</span>
                      <span>+ ₹{confirmedBooking.addOnsTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {confirmedBooking.discountAmount > 0 && (
                    <div className="flex justify-between text-xs py-1 text-emerald-700">
                      <span>Promo Discount ({confirmedBooking.promoCode})</span>
                      <span>- ₹{confirmedBooking.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs py-1 text-gray-600">
                    <span>Indian Hospitality GST ({confirmedBooking.gstRate}%)</span>
                    <span>+ ₹{confirmedBooking.gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#1E2B24] pt-2 border-t border-gray-200">
                    <span>Total Amount Paid ({confirmedBooking.paymentMethod.toUpperCase()})</span>
                    <span className="text-emerald-700">₹{confirmedBooking.amountPaid.toLocaleString('en-IN')}</span>
                  </div>
                  {confirmedBooking.amountDue > 0 && (
                    <div className="flex justify-between text-xs text-amber-800 font-semibold mt-1">
                      <span>Balance Due at Front Desk</span>
                      <span>₹{confirmedBooking.amountDue.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                <div className="pt-3 text-[11px] text-gray-500 space-y-1">
                  <p>• <strong>Arrival:</strong> Show this voucher or your PNR at the front desk for 90-second express check-in.</p>
                  <p>• <strong>Cancellation:</strong> Free cancellation up to 48 hours prior to check-in date.</p>
                  <p>• <strong>Directions:</strong> Located on Delhi-Jaipur Highway NH 48, RIICO Kukas Industrial Area (opposite college road).</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-800 border border-gray-300 hover:bg-gray-100 flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4 text-[#C08A3E]" />
                  <span>Print Voucher</span>
                </button>

                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`My booking at Ekaatra Hotel (Kukas, Jaipur) is confirmed! PNR: ${confirmedBooking.id}. Check-in: ${confirmedBooking.checkIn}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share on WhatsApp</span>
                  </a>

                  <button
                    onClick={onClose}
                    className="bg-[#1E2B24] text-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-gray-800"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
