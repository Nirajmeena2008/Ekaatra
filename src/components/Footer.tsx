import React, { useState } from 'react';
import { HOTEL_INFO } from '../data/hotelData.ts';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Sparkles,
  Check,
  Facebook,
  Instagram,
  Compass
} from 'lucide-react';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenGuestPortal: () => void;
  lang: 'en' | 'hi';
}

export const Footer: React.FC<FooterProps> = ({
  onOpenBooking,
  onOpenGuestPortal,
  lang
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="bg-[#1E2B24] text-white text-xs border-t border-[#A3B8A0]/20 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        
        {/* 5-Column Grid inspired by Reference Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 pb-12 border-b border-white/10">
          
          {/* Column 1: Brand Logo & Mission */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="font-serif-luxury text-xl sm:text-2xl tracking-[0.18em] font-normal uppercase text-white">
                Ekaatra<span className="text-[#C08A3E]">.</span>
              </span>
              <span className="text-[10px] tracking-[0.25em] text-[#C08A3E] uppercase font-semibold mt-0.5">
                HOTEL & SUITES
              </span>
              <span className="text-[9px] tracking-widest text-gray-400 uppercase font-light">
                Kukas, Jaipur
              </span>
            </div>

            <p className="text-gray-300 font-light text-[11px] leading-relaxed">
              Boutique sanctuary resort in Kukas, Jaipur. Seven-star tranquility, modern cove lighting, and authentic Rajasthani hospitality.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-1">
              <a 
                href={HOTEL_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#C08A3E] text-white hover:text-[#1E2B24] flex items-center justify-center transition-colors"
                title="Google Maps"
              >
                <Compass className="w-3.5 h-3.5" />
              </a>
              <a 
                href="#"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#C08A3E] text-white hover:text-[#1E2B24] flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a 
                href="#"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#C08A3E] text-white hover:text-[#1E2B24] flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-2.5">
            <h4 className="font-serif-luxury text-sm font-semibold tracking-[0.18em] text-white uppercase mb-4">
              QUICK LINKS
            </h4>
            <ul className="space-y-2 text-gray-300 font-light">
              <li><a href="#" className="hover:text-[#C08A3E] transition-colors">Home</a></li>
              <li><a href="#rooms" className="hover:text-[#C08A3E] transition-colors">Suites & Rooms</a></li>
              <li><a href="#experiences" className="hover:text-[#C08A3E] transition-colors">Experiences</a></li>
              <li><a href="#about" className="hover:text-[#C08A3E] transition-colors">The Story</a></li>
              <li><a href="#gallery" className="hover:text-[#C08A3E] transition-colors">Gallery</a></li>
              <li>
                <button onClick={onOpenBooking} className="text-left text-[#C08A3E] font-semibold hover:underline cursor-pointer">
                  Reserve Direct
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Resort / Property */}
          <div className="space-y-2.5">
            <h4 className="font-serif-luxury text-sm font-semibold tracking-[0.18em] text-white uppercase mb-4">
              RESORT
            </h4>
            <div className="space-y-3 text-gray-300 font-light text-[11px]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#C08A3E] shrink-0 mt-0.5" />
                <span>RIICO Industrial Area, NH-48 Delhi-Jaipur Highway, Kukas, Jaipur 302028</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#C08A3E] shrink-0" />
                <a href={`tel:${HOTEL_INFO.phone}`} className="hover:text-[#C08A3E]">{HOTEL_INFO.phone}</a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#C08A3E] shrink-0" />
                <a href={`mailto:${HOTEL_INFO.email}`} className="hover:text-[#C08A3E]">{HOTEL_INFO.email}</a>
              </div>
            </div>
          </div>

          {/* Column 4: Hours */}
          <div className="space-y-2.5">
            <h4 className="font-serif-luxury text-sm font-semibold tracking-[0.18em] text-white uppercase mb-4">
              HOURS
            </h4>
            <div className="space-y-2.5 text-gray-300 font-light text-[11px]">
              <div>
                <strong className="text-white block font-medium">Front Desk & Concierge:</strong>
                <span>Open 24/7 (365 Days)</span>
              </div>
              <div>
                <strong className="text-white block font-medium">Express Check-in:</strong>
                <span>12:00 PM (90-Sec Key Handover)</span>
              </div>
              <div>
                <strong className="text-white block font-medium">Check-out:</strong>
                <span>11:00 AM (Late on Request)</span>
              </div>
              <div>
                <strong className="text-white block font-medium">Dining & Room Service:</strong>
                <span>7:00 AM – 11:00 PM</span>
              </div>
            </div>
          </div>

          {/* Column 5: Stay Connected */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury text-sm font-semibold tracking-[0.18em] text-white uppercase mb-4">
              STAY CONNECTED
            </h4>
            <p className="text-gray-300 font-light text-[11px] leading-relaxed">
              Subscribe to receive exclusive seasonal offers and private retreat rates.
            </p>

            {subscribed ? (
              <div className="bg-[#3E5C4A]/40 border border-[#A3B8A0] p-2.5 text-[11px] text-[#EDE9DF] flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#A3B8A0]" />
                <span>Subscribed to Ekaatra updates!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="w-full bg-white/10 border border-white/20 text-white placeholder:text-gray-400 px-3 py-2 text-xs outline-none focus:border-[#C08A3E] transition-colors"
                />
                <button
                  type="submit"
                  className="w-full bg-[#C08A3E] hover:bg-[#a67431] text-[#1E2B24] font-bold py-2 px-4 text-[11px] uppercase tracking-[0.2em] transition-colors cursor-pointer shadow-sm"
                >
                  SUBSCRIBE
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal links */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-gray-400 font-light">
          <p>
            © {new Date().getFullYear()} Ekaatra Hotel & Suites. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <span>|</span>
            <a href="#" className="hover:text-white transition-colors">Guest Guidelines</a>
          </div>
        </div>

      </div>
    </footer>
  );
};
