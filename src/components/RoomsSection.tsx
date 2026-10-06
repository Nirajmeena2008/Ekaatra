import React, { useState, useEffect } from 'react';
import { Room, INITIAL_ROOMS } from '../data/hotelData.ts';
import { api } from '../lib/api.ts';
import { 
  Check, 
  Users, 
  Maximize2, 
  Bed, 
  Wifi, 
  Sparkles, 
  CalendarCheck, 
  Star, 
  ShieldCheck, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  MapPin,
  Coffee,
  X
} from 'lucide-react';

interface RoomsSectionProps {
  onBookRoom: (room: Room, searchCriteria?: { checkIn: string; checkOut: string; adults: number; children: number }) => void;
  searchParams?: { checkIn: string; checkOut: string; adults: number; children: number; category?: string };
  currency: 'INR' | 'USD';
  lang: 'en' | 'hi';
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({
  onBookRoom,
  searchParams,
  currency,
  lang
}) => {
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [loading, setLoading] = useState(false);
  const [showAllAccommodations, setShowAllAccommodations] = useState(false);
  const [activeDetailRoom, setActiveDetailRoom] = useState<Room | null>(null);

  useEffect(() => {
    if (searchParams?.checkIn && searchParams?.checkOut) {
      setLoading(true);
      api.checkAvailability({
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        adults: searchParams.adults,
        children: searchParams.children
      })
      .then((res) => {
        if (res.success && res.rooms) {
          setRooms(res.rooms);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    } else {
      api.getRooms().then((res) => {
        if (res.success && res.rooms?.length) {
          setRooms(res.rooms.filter(r => r.active));
        }
      }).catch(() => {});
    }
  }, [searchParams]);

  const formatPrice = (inrPrice: number) => {
    if (currency === 'USD') {
      const usd = Math.round(inrPrice / 85);
      return `$${usd}`;
    }
    return `₹${inrPrice.toLocaleString('en-IN')}`;
  };

  // Featured 3 rooms for primary editorial display
  const displayedRooms = showAllAccommodations ? rooms : rooms.slice(0, 3);

  return (
    <section id="rooms" className="py-20 sm:py-24 bg-[#FAF9F5] border-t border-[#A3B8A0]/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Inspired by Editorial Resort Typography */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C08A3E] font-semibold mb-2">
            {lang === 'hi' ? 'शाही अंदाज में विश्राम' : 'STAY IN STYLE'}
          </p>
          <div className="flex items-center justify-center gap-3 text-[#C08A3E] mb-2 opacity-80">
            <span className="w-8 h-px bg-[#C08A3E]" />
            <span className="text-xs font-serif italic">❦</span>
            <span className="w-8 h-px bg-[#C08A3E]" />
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-[#1E2B24] tracking-wide">
            {lang === 'hi' ? 'आपके अनुरूप सुसज्जित कक्ष एवं सुइट्स' : 'Rooms & Suites Designed for You'}
          </h2>
          <p className="text-xs sm:text-sm text-[#3E5C4A] mt-3 font-light max-w-lg mx-auto">
            {lang === 'hi'
              ? 'आधुनिक सीलिंग डिजाइन, ऑर्थोपेडिक आराम, स्वच्छ बाथरूम और 24/7 कक्ष सेवा।'
              : 'Spacious boutique suites featuring orthopaedic beds, stylish false ceiling cove lighting, and restful Aravalli peace.'}
          </p>
        </div>

        {/* Active Search Banner Indicator */}
        {searchParams && (
          <div className="mb-8 bg-[#EDE9DF] border border-[#A3B8A0]/50 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#1E2B24]">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-[#C08A3E]" />
              <span>
                Verified dates: <strong>{searchParams.checkIn}</strong> to <strong>{searchParams.checkOut}</strong> (
                {searchParams.adults} Adults{searchParams.children > 0 ? `, ${searchParams.children} Children` : ''})
              </span>
            </div>
            <span className="font-semibold text-[#1E2B24] bg-[#C08A3E]/20 border border-[#C08A3E]/40 px-3 py-1">
              Direct Booking 100% Rate Guarantee
            </span>
          </div>
        )}

        {/* 3-Column Editorial Grid: Matching the Inspiration Resort Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayedRooms.map((room) => {
            const price = (room as any).calculatedRatePerNight || room.pricePerNight;
            const currentImage = room.images[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80';

            return (
              <div
                key={room.id}
                className="bg-white border border-[#A3B8A0]/40 hover:border-[#C08A3E] transition-all flex flex-col justify-between group shadow-xs hover:shadow-lg"
              >
                <div>
                  {/* Photo container */}
                  <div className="relative aspect-[16/11] overflow-hidden bg-[#1E2B24]">
                    <img
                      src={currentImage}
                      alt={room.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-40 group-hover:opacity-60 transition-opacity" />

                    {/* Feature badge */}
                    <div className="absolute top-3 left-3 bg-[#1E2B24]/90 backdrop-blur-xs text-[#C08A3E] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 border border-[#C08A3E]/30">
                      {room.bedType}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 font-light">
                      {room.sizeSqFt} sq. ft.
                    </div>
                  </div>

                  {/* Body: Centered Editorial Style */}
                  <div className="p-6 text-center">
                    <h3 className="font-serif-luxury text-xl font-normal text-[#1E2B24] tracking-wide mb-2 group-hover:text-[#C08A3E] transition-colors">
                      {room.name}
                    </h3>
                    <p className="text-xs text-[#3E5C4A] font-light leading-relaxed mb-6 line-clamp-2 max-w-xs mx-auto">
                      {room.description}
                    </p>

                    {/* Price Block */}
                    <div className="mb-6 pt-2">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-[#3E5C4A] font-semibold block mb-0.5">
                        FROM
                      </span>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="font-serif-luxury text-2xl font-bold text-[#1E2B24]">
                          {formatPrice(price)}
                        </span>
                        <span className="text-xs text-gray-500 uppercase font-light">
                          / NIGHT
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-light block mt-0.5">
                        + Taxes · Free High-Speed Wi-Fi
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="px-6 pb-6 pt-0 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => onBookRoom(room, searchParams)}
                    className="w-full bg-[#1E2B24] hover:bg-[#2e4036] text-white py-3 px-4 text-xs uppercase tracking-[0.2em] font-semibold transition-all shadow-sm hover:shadow cursor-pointer flex items-center justify-center gap-2 group-hover:bg-[#1E2B24]"
                  >
                    <span>{lang === 'hi' ? 'सुइट बुक करें' : 'BOOK SUITE'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C08A3E]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveDetailRoom(room)}
                    className="text-[11px] font-semibold text-[#3E5C4A] hover:text-[#1E2B24] uppercase tracking-wider py-1 cursor-pointer transition-colors"
                  >
                    {lang === 'hi' ? 'विवरण एवं सुविधाएं देखें' : 'VIEW DETAILS'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Accommodations Toggle Button */}
        {rooms.length > 3 && (
          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowAllAccommodations(!showAllAccommodations)}
              className="border-2 border-[#1E2B24] text-[#1E2B24] hover:bg-[#1E2B24] hover:text-white px-8 py-3 text-xs uppercase tracking-[0.22em] font-semibold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <span>
                {showAllAccommodations 
                  ? (lang === 'hi' ? 'कम सुइट्स दिखाएं' : 'SHOW FEATURED SUITES') 
                  : (lang === 'hi' ? 'सभी कक्ष एवं सुइट्स देखें' : 'VIEW ALL ACCOMMODATIONS')}
              </span>
              {showAllAccommodations ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Room Detail Modal if User Clicks VIEW DETAILS */}
        {activeDetailRoom && (
          <div 
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setActiveDetailRoom(null)}
          >
            <div 
              className="relative w-full max-w-2xl bg-white text-[#1E2B24] border border-[#A3B8A0] shadow-2xl p-6 sm:p-8 animate-fade-in my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveDetailRoom(null)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-[#1E2B24] transition-colors"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2 text-[#C08A3E] text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Boutique Sanctuary Suite</span>
              </div>

              <h3 className="font-serif-luxury text-2xl sm:text-3xl text-[#1E2B24] mb-3">
                {activeDetailRoom.name}
              </h3>

              <div className="aspect-video w-full overflow-hidden mb-5 bg-[#1E2B24]">
                <img
                  src={activeDetailRoom.images[0]}
                  alt={activeDetailRoom.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <p className="text-sm text-gray-700 font-light leading-relaxed mb-5">
                {activeDetailRoom.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-gray-100 text-xs mb-6">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Bed Type</span>
                  <strong className="text-[#1E2B24]">{activeDetailRoom.bedType}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Suite Area</span>
                  <strong className="text-[#1E2B24]">{activeDetailRoom.sizeSqFt} sq. ft.</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Max Guests</span>
                  <strong className="text-[#1E2B24]">{activeDetailRoom.maxAdults} Adults, {activeDetailRoom.maxChildren} Child</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Starting Rate</span>
                  <strong className="text-[#C08A3E]">{formatPrice(activeDetailRoom.pricePerNight)}</strong>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-xs uppercase font-semibold text-gray-900 block mb-2 tracking-wider">
                  Suite Amenities & Inclusions
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-700">
                  {activeDetailRoom.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#C08A3E] shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <span className="text-xs text-gray-500 uppercase block">Total Nightly Rate</span>
                  <span className="font-serif-luxury text-2xl font-bold text-[#1E2B24]">
                    {formatPrice(activeDetailRoom.pricePerNight)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const r = activeDetailRoom;
                    setActiveDetailRoom(null);
                    onBookRoom(r, searchParams);
                  }}
                  className="bg-[#C08A3E] hover:bg-[#a67431] text-[#1E2B24] font-bold px-8 py-3 text-xs uppercase tracking-[0.2em] shadow-lg transition-transform hover:scale-105"
                >
                  Reserve This Suite
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
};
