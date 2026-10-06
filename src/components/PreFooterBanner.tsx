import React from 'react';
import { CalendarDays, ShieldCheck } from 'lucide-react';

interface PreFooterBannerProps {
  onBookNow: () => void;
  lang: 'en' | 'hi';
}

export const PreFooterBanner: React.FC<PreFooterBannerProps> = ({ onBookNow, lang }) => {
  return (
    <section className="relative overflow-hidden bg-[#0c120f] py-20 sm:py-28 text-white">
      {/* Background Image: Evening illuminated courtyard and pool panorama */}
      <img
        src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1920&q=85"
        alt="Ekaatra Evening Resort Atmosphere"
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.45] contrast-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-left">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C08A3E] font-semibold mb-2">
            {lang === 'hi' ? 'सीधा आरक्षण लाभ' : 'DIRECT RESERVATION PRIVILEGE'}
          </p>
          
          <h2 className="font-serif-luxury text-3xl sm:text-5xl font-normal text-white tracking-wide mb-4 leading-tight">
            {lang === 'hi' ? 'अपनी संपूर्ण जयपुर यात्रा की योजना बनाएं' : 'Plan Your Perfect Getaway'}
          </h2>

          <p className="text-sm sm:text-base text-gray-200 font-light mb-8 max-w-lg leading-relaxed">
            {lang === 'hi'
              ? 'सर्वोत्तम दर गारंटी, बिना किसी अग्रिम छुपे शुल्क और त्वरित 90-सेकंड चेक-इन के साथ सीधे एकात्रा से बुक करें।'
              : 'Book directly with us for the best rates, exclusive seasonal privileges, and unforgettable Rajasthani memories.'}
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={onBookNow}
              className="bg-[#C08A3E] hover:bg-[#a67431] text-[#1E2B24] font-bold px-8 py-3.5 text-xs uppercase tracking-[0.25em] transition-all shadow-xl hover:scale-105 cursor-pointer flex items-center gap-2"
            >
              <CalendarDays className="w-4 h-4" />
              <span>{lang === 'hi' ? 'अभी कमरा बुक करें' : 'BOOK YOUR STAY'}</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-gray-300">
              <ShieldCheck className="w-4 h-4 text-[#C08A3E]" />
              <span>100% Best Rate Guarantee · Zero Booking Fees</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
