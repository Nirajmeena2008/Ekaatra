import React, { useState, useRef, useEffect } from 'react';
import { 
  Bed, 
  Calendar, 
  Users, 
  ChevronDown, 
  Plus, 
  Minus,
  Sparkles,
  ArrowRight,
  Image as ImageIcon
} from 'lucide-react';

// Curated high-resolution boutique resort & hotel banners for Ekaatra in Kukas, Jaipur
const BANNER_SLIDES = [
  {
    id: 'facade',
    url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=85',
    alt: 'Ekaatra Boutique Resort Facade & Grounds'
  },
  {
    id: 'suite',
    url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1920&q=85',
    alt: 'Luxury Suite with Architectural Ceiling & Ambient Cove Lighting'
  },
  {
    id: 'courtyard',
    url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=85',
    alt: 'Serene Desert Oasis Courtyard & Stone Architecture'
  },
  {
    id: 'executive',
    url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1920&q=85',
    alt: 'Executive King Suite with Relaxing Velvet Lounge'
  }
];

interface HeroProps {
  onCheckAvailability: (searchParams: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    category?: string;
  }) => void;
  onExploreSuites: () => void;
  onOpenBookingModal: () => void;
  lang: 'en' | 'hi';
}

export const Hero: React.FC<HeroProps> = ({ 
  onCheckAvailability, 
  onExploreSuites, 
  onOpenBookingModal,
  lang 
}) => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const formatDisplayDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-');
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const [checkIn, setCheckIn] = useState<string>(formatDate(today));
  const [checkOut, setCheckOut] = useState<string>(formatDate(tomorrow));
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [rooms, setRooms] = useState<number>(1);

  // Auto sliding
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  // Dropdown states
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [isRoomsOpen, setIsRoomsOpen] = useState(false);
  const guestsRef = useRef<HTMLDivElement>(null);
  const roomsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (guestsRef.current && !guestsRef.current.contains(event.target as Node)) {
        setIsGuestsOpen(false);
      }
      if (roomsRef.current && !roomsRef.current.contains(event.target as Node)) {
        setIsRoomsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsGuestsOpen(false);
    setIsRoomsOpen(false);
    onCheckAvailability({
      checkIn,
      checkOut,
      adults,
      children
    });

    const el = document.getElementById('rooms');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative bg-[#FAF9F5]">
      {/* 1. Main Hero Canvas */}
      <div 
        className="relative min-h-[540px] sm:min-h-[600px] lg:min-h-[660px] w-full overflow-hidden flex flex-col justify-center bg-[#0d1410]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Images Crossfade */}
        {BANNER_SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.url}
                alt={slide.alt}
                className="w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.04]"
              />
            </div>
          );
        })}

        {/* Cinematic Luxury Vignette - Seamless photographic grading inspired by Aman / Oberoi / Taj */}
        {/* Lateral gradient for optimal typography readability while preserving photo radiance */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent pointer-events-none z-[1]" />
        {/* Bottom vignette anchoring the floating reservation bar */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none z-[1]" />
        {/* Top section background extension: solid olive matching header, stopping just before the text with a slight fade */}
        <div 
          className="absolute top-0 left-0 right-0 h-16 sm:h-20 lg:h-24 pointer-events-none z-[2]" 
          style={{
            background: 'linear-gradient(to bottom, #1E2B24 0%, #1E2B24 72%, rgba(30, 43, 36, 0.72) 86%, rgba(30, 43, 36, 0) 100%)'
          }}
        />

        {/* Editorial Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-16 sm:pt-20 lg:pt-24 pb-24 sm:pb-28">
          <div className="max-w-3xl text-left">
            {/* Kicker */}
            <div className="inline-flex items-center gap-2.5 mb-3.5">
              <span className="w-8 h-px bg-[#C08A3E]" />
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.32em] text-[#C08A3E] font-bold">
                {lang === 'hi' ? 'शांति · भव्यता · आतिथ्य' : 'SERENE · LUXURIOUS · TIMELESS'}
              </p>
            </div>

            {/* Headline with Calligraphic Script Accent */}
            <h1 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl text-white font-normal tracking-wide leading-[1.14] mb-3.5 drop-shadow-sm">
              {lang === 'hi' ? 'जयपुर के प्रवेश द्वार पर शाही विश्राम' : 'Your Royal Sanctuary Awaits'}
              <span className="font-script text-4xl sm:text-6xl lg:text-7xl text-[#C08A3E] block sm:inline sm:ml-3.5 mt-1 sm:mt-0 lowercase font-normal drop-shadow-sm">
                {lang === 'hi' ? 'कूकस, जयपुर' : 'in Kukas, Jaipur'}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-gray-200/95 font-light max-w-xl mb-8 leading-relaxed drop-shadow-xs">
              {lang === 'hi'
                ? 'कूकस में सात-सितारा सत्कार, ऑर्थोपेडिक आराम, आधुनिक सीलिंग डिजाइन और अरावली की शांत तलहटी का संगम।'
                : 'Boutique luxury, orthopaedic comfort, and tranquil Aravalli hospitality at the gateway to Rajasthan\'s Pink City.'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={onExploreSuites}
                className="bg-[#C08A3E] hover:bg-[#a67431] text-[#1E2B24] text-xs sm:text-sm uppercase tracking-[0.2em] font-bold px-6 sm:px-7 py-3.5 transition-all shadow-xl active:scale-95 inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{lang === 'hi' ? 'कमरे एवं सुइट्स देखें' : 'EXPLORE THE SUITES'}</span>
                <ArrowRight className="w-4 h-4 text-[#1E2B24]" />
              </button>

              <a
                href="#gallery"
                className="bg-black/30 hover:bg-black/50 text-white border border-white/40 hover:border-[#C08A3E] text-xs sm:text-sm uppercase tracking-[0.18em] font-semibold px-6 py-3.5 transition-all backdrop-blur-md inline-flex items-center gap-2.5 active:scale-95 shadow-md cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-[#C08A3E] text-[#1E2B24] flex items-center justify-center">
                  <ImageIcon className="w-2.5 h-2.5 stroke-[2.2]" />
                </div>
                <span>{lang === 'hi' ? 'फोटो गैलरी देखें' : 'EXPLORE GALLERY'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Minimalist Luxury Slide Progress Indicators */}
        <div className="absolute right-4 sm:right-8 bottom-16 sm:bottom-20 z-10 hidden sm:flex items-center gap-2 select-none">
          {BANNER_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1 transition-all duration-300 cursor-pointer rounded-full ${
                idx === currentSlide ? 'w-8 bg-[#C08A3E]' : 'w-3 bg-white/40 hover:bg-white/70'
              }`}
              title={slide.alt}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 2. Signature Floating Reservation Bar (Overlapping Hero bottom) */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-14 mb-4">
        <div className="bg-[#1E2B24] text-white border border-[#C08A3E]/40 shadow-2xl overflow-visible">
          <form 
            onSubmit={handleSearch} 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-white/10 items-stretch"
          >
            {/* 1. CHECK IN */}
            <div className="p-3.5 sm:p-4 flex flex-col justify-center relative hover:bg-white/5 transition-colors">
              <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mb-1">
                {lang === 'hi' ? 'आगमन' : 'CHECK IN'}
              </span>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#C08A3E] shrink-0" />
                <input
                  type="date"
                  value={checkIn}
                  min={formatDate(new Date())}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-white bg-transparent outline-none cursor-pointer"
                />
              </div>
              <span className="text-[11px] text-gray-400 font-light mt-0.5 hidden sm:block">
                {formatDisplayDate(checkIn)}
              </span>
            </div>

            {/* 2. CHECK OUT */}
            <div className="p-3.5 sm:p-4 flex flex-col justify-center relative hover:bg-white/5 transition-colors">
              <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mb-1">
                {lang === 'hi' ? 'प्रस्थान' : 'CHECK OUT'}
              </span>
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#C08A3E] shrink-0" />
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn || formatDate(new Date())}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold text-white bg-transparent outline-none cursor-pointer"
                />
              </div>
              <span className="text-[11px] text-gray-400 font-light mt-0.5 hidden sm:block">
                {formatDisplayDate(checkOut)}
              </span>
            </div>

            {/* 3. GUESTS */}
            <div className="p-3.5 sm:p-4 flex flex-col justify-center relative hover:bg-white/5 transition-colors" ref={guestsRef}>
              <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mb-1">
                {lang === 'hi' ? 'अतिथि' : 'GUESTS'}
              </span>
              <button
                type="button"
                onClick={() => setIsGuestsOpen(!isGuestsOpen)}
                className="flex items-center justify-between gap-2 text-left cursor-pointer w-full text-xs sm:text-sm font-semibold text-white"
              >
                <div className="flex items-center gap-2 truncate">
                  <Users className="w-4 h-4 text-[#C08A3E] shrink-0" />
                  <span className="truncate">{adults} Adults{children > 0 ? `, ${children} Children` : ''}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isGuestsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Guests Dropdown Popover */}
              {isGuestsOpen && (
                <div className="absolute top-full left-0 right-0 lg:w-64 mt-2 bg-white text-[#1E2B24] border border-gray-200 shadow-2xl p-4 z-50 text-xs animate-fade-in">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <span className="font-semibold text-gray-900 block">Adults</span>
                      <span className="text-[10px] text-gray-500">Ages 18 or above</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        disabled={adults <= 1}
                        className="w-7 h-7 border border-gray-300 disabled:opacity-40 flex items-center justify-center font-bold hover:bg-gray-100"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center font-bold">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="w-7 h-7 border border-gray-300 flex items-center justify-center font-bold hover:bg-gray-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 mb-3">
                    <div>
                      <span className="font-semibold text-gray-900 block">Children</span>
                      <span className="text-[10px] text-gray-500">Ages 0 – 17</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        disabled={children <= 0}
                        className="w-7 h-7 border border-gray-300 disabled:opacity-40 flex items-center justify-center font-bold hover:bg-gray-100"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center font-bold">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren(children + 1)}
                        className="w-7 h-7 border border-gray-300 flex items-center justify-center font-bold hover:bg-gray-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsGuestsOpen(false)}
                    className="w-full bg-[#1E2B24] text-white py-2 font-semibold uppercase tracking-wider text-[11px] hover:bg-[#2c3d33]"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* 4. ROOMS */}
            <div className="p-3.5 sm:p-4 flex flex-col justify-center relative hover:bg-white/5 transition-colors" ref={roomsRef}>
              <span className="block text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em] mb-1">
                {lang === 'hi' ? 'कक्ष' : 'ROOMS'}
              </span>
              <button
                type="button"
                onClick={() => setIsRoomsOpen(!isRoomsOpen)}
                className="flex items-center justify-between gap-2 text-left cursor-pointer w-full text-xs sm:text-sm font-semibold text-white"
              >
                <div className="flex items-center gap-2 truncate">
                  <Bed className="w-4 h-4 text-[#C08A3E] shrink-0" />
                  <span className="truncate">{rooms} {rooms === 1 ? 'Room' : 'Rooms'}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isRoomsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Rooms Dropdown Popover */}
              {isRoomsOpen && (
                <div className="absolute top-full left-0 right-0 lg:w-56 mt-2 bg-white text-[#1E2B24] border border-gray-200 shadow-2xl p-4 z-50 text-xs animate-fade-in">
                  <div className="flex items-center justify-between py-2 mb-3">
                    <span className="font-semibold text-gray-900">Total Rooms</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRooms(Math.max(1, rooms - 1))}
                        disabled={rooms <= 1}
                        className="w-7 h-7 border border-gray-300 disabled:opacity-40 flex items-center justify-center font-bold hover:bg-gray-100"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-5 text-center font-bold">{rooms}</span>
                      <button
                        type="button"
                        onClick={() => setRooms(rooms + 1)}
                        className="w-7 h-7 border border-gray-300 flex items-center justify-center font-bold hover:bg-gray-100"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsRoomsOpen(false)}
                    className="w-full bg-[#1E2B24] text-white py-2 font-semibold uppercase tracking-wider text-[11px] hover:bg-[#2c3d33]"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* 5. CHECK AVAILABILITY CTA BUTTON */}
            <div className="p-2 sm:p-2.5 flex items-center">
              <button
                type="submit"
                className="w-full h-full min-h-[50px] bg-[#C08A3E] hover:bg-[#a67431] text-[#1E2B24] font-bold text-xs sm:text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-95 shadow-lg cursor-pointer"
              >
                <span>{lang === 'hi' ? 'उपलब्धता जांचें' : 'CHECK AVAILABILITY'}</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
