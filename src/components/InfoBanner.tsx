import React from 'react';
import { Sparkles, CalendarDays } from 'lucide-react';

interface InfoBannerProps {
  onBookNow: () => void;
  lang: 'en' | 'hi';
}

export const InfoBanner: React.FC<InfoBannerProps> = ({ onBookNow, lang }) => {
  return (
    <section className="bg-[#EDE9DF] border-y border-[#A3B8A0]/40 py-16 sm:py-20 text-center px-4">
      <div className="max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C08A3E]/15 text-[#C08A3E] text-[11px] font-semibold uppercase tracking-[0.25em] mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{lang === 'hi' ? 'सीधा आरक्षण लाभ' : 'Direct Booking Privilege'}</span>
        </div>

        <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-[#1E2B24] tracking-wide mb-4">
          {lang === 'hi' ? 'सहज प्रवास। त्वरित 90-सेकंड चेक-इन।' : 'Seamless Stays. Lightning Fast Check-in.'}
        </h2>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#1E2B24]/85 font-light leading-relaxed mb-8">
          {lang === 'hi'
            ? 'अतुलनीय स्वच्छता और सत्कार का संगम। एकात्रा की वेबसाइट से सीधे बुक करने पर आपको 100% सर्वोत्तम दर गारंटी, निःशुल्क वाई-फाई और पसंदीदा फ्लोर आवंटन का लाभ मिलता है।'
            : 'Experience the benchmark in hospitality hygiene and swift arrival care. Booking directly with Ekaatra guarantees the best rates, complimentary high-speed optical Wi-Fi, flexible cancellation, and priority suite allocation.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onBookNow}
            className="w-full sm:w-auto bg-[#C08A3E] hover:bg-[#a67431] text-[#1E2B24] font-bold px-8 py-3.5 text-xs uppercase tracking-[0.25em] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <CalendarDays className="w-4 h-4" />
            <span>{lang === 'hi' ? 'अभी कमरा बुक करें' : 'Reserve Direct at Ekaatra'}</span>
          </button>
          
          <span className="text-xs uppercase tracking-wider text-[#3E5C4A] font-semibold">
            {lang === 'hi' ? 'बिना किसी अग्रिम छुपे शुल्क के' : 'No Hidden Convenience Fees'}
          </span>
        </div>
      </div>
    </section>
  );
};
