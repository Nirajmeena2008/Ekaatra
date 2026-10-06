import React, { useState } from 'react';
import { Star, CheckCircle, Quote } from 'lucide-react';
import { INITIAL_REVIEWS, HOTEL_INFO } from '../data/hotelData.ts';

interface ReviewsSectionProps {
  lang: 'en' | 'hi';
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ lang }) => {
  const [activePageIndex, setActivePageIndex] = useState(0);

  // Guest avatars matching real hospitality travelers
  const guestAvatars: Record<string, string> = {
    'rev-1': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    'rev-2': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    'rev-3': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80'
  };

  return (
    <section id="reviews" className="py-20 sm:py-28 bg-[#FAF9F5] border-t border-[#A3B8A0]/30 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header: Inspired by Reference Image */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C08A3E] font-semibold mb-2">
            {lang === 'hi' ? 'अतिथियों के अनुभव' : 'WHAT OUR GUESTS SAY'}
          </p>
          <div className="flex items-center justify-center gap-3 text-[#C08A3E] mb-2 opacity-80">
            <span className="w-8 h-px bg-[#C08A3E]" />
            <span className="text-xs font-serif italic">❦</span>
            <span className="w-8 h-px bg-[#C08A3E]" />
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-[#1E2B24] tracking-wide">
            {lang === 'hi' ? 'जीवन भर की सुखद स्मृतियां' : 'Memories That Last a Lifetime'}
          </h2>
          <p className="text-xs sm:text-sm text-[#3E5C4A] mt-3 font-light max-w-lg mx-auto">
            {lang === 'hi'
              ? 'हमारे सभी प्रारंभिक अतिथियों ने शांति, स्वच्छता, ऑर्थोपेडिक बिस्तरों और सेवा को 5.0 पूर्ण रेटिंग प्रदान की है।'
              : 'Real verified reviews from guests who experienced our soothing ambiance, modern rooms, and heartfelt hospitality.'}
          </p>
        </div>

        {/* 3 Editorial Review Cards (matching the layout in the image) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-10">
          {INITIAL_REVIEWS.map((rev) => {
            const avatarUrl = guestAvatars[rev.id] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80';

            return (
              <div
                key={rev.id}
                className="bg-white p-7 sm:p-8 border border-[#A3B8A0]/40 hover:border-[#C08A3E] flex flex-col justify-between shadow-xs hover:shadow-md transition-all relative"
              >
                <div>
                  {/* Decorative Quotation Mark */}
                  <div className="text-[#C08A3E] opacity-75 mb-3">
                    <span className="font-serif text-4xl sm:text-5xl leading-none select-none block">“</span>
                  </div>

                  {/* Comment */}
                  <p className="text-xs sm:text-sm text-[#1E2B24] font-light leading-relaxed mb-6 italic">
                    {rev.comment}
                  </p>
                </div>

                {/* Guest Profile & 5 Gold Stars */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={avatarUrl}
                      alt={rev.author}
                      className="w-10 h-10 rounded-full object-cover border border-[#C08A3E]/40"
                    />
                    <div>
                      <h4 className="font-serif-luxury text-sm font-semibold text-[#1E2B24] leading-tight">
                        {rev.author}
                      </h4>
                      <p className="text-[11px] text-[#3E5C4A] font-light">
                        {rev.location}
                      </p>
                    </div>
                  </div>

                  {/* 5 Stars */}
                  <div className="flex items-center text-[#C08A3E] gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#C08A3E]" />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActivePageIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activePageIndex === idx ? 'w-6 bg-[#1E2B24]' : 'w-2 bg-[#A3B8A0]/50 hover:bg-[#A3B8A0]'
              }`}
              aria-label={`Page ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
