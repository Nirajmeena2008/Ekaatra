import React, { useState, useEffect } from 'react';
import { Booking } from '../data/hotelData.ts';
import { api } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  X, 
  Search, 
  User, 
  Calendar, 
  ShieldCheck, 
  Upload, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText,
  Clock,
  Printer
} from 'lucide-react';

interface GuestDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'hi';
}

export const GuestDashboardModal: React.FC<GuestDashboardModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  // ID Upload inside dashboard
  const [idType, setIdType] = useState('aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [idUploadedSuccess, setIdUploadedSuccess] = useState(false);

  // Cancellation feedback
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (user) {
        loadBookings(user.phone || user.email);
      } else {
        loadBookings();
      }
    }
  }, [isOpen, user]);

  const loadBookings = async (query?: string) => {
    setLoading(true);
    try {
      const res = await api.getBookings(query ? { email: query, phone: query } : undefined);
      if (res.success) {
        setBookings(res.bookings);
        if (res.bookings.length > 0 && !selectedBooking) {
          setSelectedBooking(res.bookings[0]);
        }
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Filter by PNR or email
      const found = bookings.find(b => b.id.toLowerCase() === searchQuery.trim().toLowerCase());
      if (found) {
        setSelectedBooking(found);
      } else {
        loadBookings(searchQuery.trim());
      }
    } else {
      loadBookings();
    }
  };

  const handleUploadIdProof = async () => {
    if (!selectedBooking || !idNumber) return;
    try {
      const res = await api.uploadIdProof(selectedBooking.id, {
        idProofType: idType,
        idProofNumber: idNumber
      });
      if (res.success && res.booking) {
        setSelectedBooking(res.booking);
        setIdUploadedSuccess(true);
        setTimeout(() => setIdUploadedSuccess(false), 4000);
      }
    } catch {
      alert('Failed to upload ID proof. Please try again.');
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;
    try {
      const res = await api.updateBookingStatus(selectedBooking.id, 'cancelled', cancellationReason || 'Guest requested cancellation');
      if (res.success && res.booking) {
        setSelectedBooking(res.booking);
        setCancelModalOpen(false);
        setActionSuccess('Booking cancelled according to hotel policy. Refund initiated if eligible.');
        setTimeout(() => setActionSuccess(null), 5000);
        loadBookings();
      }
    } catch {
      alert('Failed to cancel booking.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative w-full max-w-4xl bg-white text-[#1E2B24] shadow-2xl border-t-4 border-[#C08A3E] my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#1E2B24] text-white p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#C08A3E]/20 text-[#C08A3E]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-xl font-normal tracking-wide">
                Guest Portal & Reservations
              </h3>
              <p className="text-xs text-gray-400">
                View your stays, manage government ID proofs, and track payments
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4 bg-[#FAF9F5] border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by PNR (e.g. EK-2026-9148A) or Email / Phone"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#C08A3E]"
              />
            </div>
            <button
              type="submit"
              className="bg-[#1E2B24] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-[#283830] cursor-pointer"
            >
              Lookup
            </button>
          </form>
        </div>

        {/* Success Message Banner */}
        {actionSuccess && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 mx-4 mt-4 text-xs text-emerald-800">
            {actionSuccess}
          </div>
        )}

        {/* Content Body: Sidebar List + Selected View */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[420px] max-h-[70vh] overflow-y-auto">
          {/* Left: Bookings list */}
          <div className="md:col-span-4 border-r border-gray-200 p-4 bg-gray-50 space-y-3 overflow-y-auto">
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
              Your Reservations ({bookings.length})
            </h4>

            {loading ? (
              <p className="text-xs text-gray-400 py-4">Checking reservations...</p>
            ) : bookings.length === 0 ? (
              <div className="text-center py-10 px-4 text-gray-500 text-xs">
                <Calendar className="w-8 h-8 text-[#C08A3E] mx-auto mb-2 opacity-60" />
                <p className="font-semibold text-gray-800">No Reservations Found</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Once you reserve a suite, your booking voucher, PNR, and government ID details will appear here.
                </p>
              </div>
            ) : (
              bookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className={`p-3 border cursor-pointer transition-all ${
                    selectedBooking?.id === b.id ? 'bg-white border-[#C08A3E] shadow-sm' : 'border-gray-200 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-bold text-[#1E2B24]">{b.id}</span>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 ${
                      b.bookingStatus === 'confirmed' ? 'bg-blue-50 text-blue-700' :
                      b.bookingStatus === 'checked_in' ? 'bg-emerald-50 text-emerald-700' :
                      b.bookingStatus === 'cancelled' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {b.bookingStatus}
                    </span>
                  </div>
                  <h5 className="text-xs font-semibold text-gray-800">{b.roomName}</h5>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {b.checkIn} to {b.checkOut} ({b.nights} {b.nights === 1 ? 'night' : 'nights'})
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Right: Selected Booking Detail */}
          <div className="md:col-span-8 p-6 overflow-y-auto">
            {selectedBooking ? (
              <div className="space-y-6">
                {/* Top Status & PNR */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-gray-200">
                  <div>
                    <span className="text-[10px] uppercase text-gray-400 font-semibold block">Booking Reference</span>
                    <span className="font-mono text-xl font-bold text-[#1E2B24]">{selectedBooking.id}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 border border-gray-300 text-xs font-medium hover:bg-gray-50 flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#C08A3E]" />
                      <span>Print</span>
                    </button>
                    {selectedBooking.bookingStatus === 'confirmed' && (
                      <button
                        onClick={() => setCancelModalOpen(true)}
                        className="px-3 py-1.5 border border-red-300 text-red-600 text-xs font-medium hover:bg-red-50"
                      >
                        Cancel Stay
                      </button>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Guest Name</span>
                    <strong className="text-gray-900">{selectedBooking.guestName}</strong>
                    <p className="text-[11px] text-gray-500">{selectedBooking.guestEmail}</p>
                    <p className="text-[11px] text-gray-500">{selectedBooking.guestPhone}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Suite Category</span>
                    <strong className="text-gray-900">{selectedBooking.roomName}</strong>
                    <p className="text-[11px] text-gray-500">{selectedBooking.adults} Adults, {selectedBooking.children} Children</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold block">Dates of Stay</span>
                    <strong className="text-gray-900">{selectedBooking.checkIn} → {selectedBooking.checkOut}</strong>
                    <p className="text-[11px] text-gray-500">{selectedBooking.nights} Nights</p>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-4 bg-gray-50 border border-gray-200 text-xs space-y-1.5">
                  <div className="flex justify-between text-gray-700">
                    <span>Base Room Charges</span>
                    <span>₹{selectedBooking.baseRateTotal.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedBooking.addOnsTotal > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Add-ons / Transfers</span>
                      <span>+ ₹{selectedBooking.addOnsTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {selectedBooking.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700">
                      <span>Promo Discount ({selectedBooking.promoCode})</span>
                      <span>- ₹{selectedBooking.discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>GST ({selectedBooking.gstRate}%)</span>
                    <span>+ ₹{selectedBooking.gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#1E2B24] pt-2 border-t border-gray-200">
                    <span>Amount Paid ({selectedBooking.paymentMethod.toUpperCase()})</span>
                    <span className="text-emerald-700">₹{selectedBooking.amountPaid.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedBooking.amountDue > 0 && (
                    <div className="flex justify-between text-xs text-amber-800 font-semibold pt-1">
                      <span>Balance Due upon arrival</span>
                      <span>₹{selectedBooking.amountDue.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Indian Hospitality ID Verification Box */}
                <div className="p-4 border border-[#C08A3E]/40 bg-[#EDE9DF]/40">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#C08A3E]" />
                      <h5 className="text-xs uppercase tracking-wider font-semibold text-[#1E2B24]">
                        Government ID Proof Verification
                      </h5>
                    </div>
                    {selectedBooking.idProofUploaded ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 font-bold uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified for Express Check-in
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 font-bold uppercase">
                        Pending Upload
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-gray-600 mb-3">
                    Ensure swift 90-second key handover by keeping your Government ID on file.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={idType}
                      onChange={(e) => setIdType(e.target.value)}
                      className="p-2 text-xs border border-gray-300 bg-white"
                    >
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="passport">Passport</option>
                      <option value="driving_license">Driving License</option>
                      <option value="voter_id">Voter ID</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Enter ID Number"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      className="flex-1 p-2 text-xs border border-gray-300 bg-white"
                    />

                    <button
                      onClick={handleUploadIdProof}
                      className="bg-[#C08A3E] hover:bg-[#a67431] text-white px-4 py-2 text-xs font-semibold uppercase tracking-wider"
                    >
                      Save ID
                    </button>
                  </div>

                  {idUploadedSuccess && (
                    <p className="text-xs text-emerald-700 mt-2 font-medium">
                      ✓ ID Proof recorded successfully. Your room key will be pre-allocated.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400 text-xs">
                Select a booking to view voucher details and hospitality documents.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancellation confirmation modal */}
      {cancelModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl border-t-4 border-red-600">
            <h4 className="font-serif-luxury text-lg font-bold text-gray-900 mb-2">
              Cancel Reservation {selectedBooking.id}?
            </h4>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              According to Ekaatra policy, cancellations requested more than 48 hours prior to check-in are eligible for a 100% refund.
            </p>

            <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for cancellation:</label>
            <input
              type="text"
              placeholder="e.g. Change of travel plans"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full p-2 text-xs border border-gray-300 mb-4 outline-none focus:border-red-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold uppercase text-gray-600 border border-gray-300"
              >
                Keep Stay
              </button>
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 text-xs font-semibold uppercase text-white bg-red-600 hover:bg-red-700"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
