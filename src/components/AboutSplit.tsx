import React from 'react';
import { ExternalLink, Check, Sparkles, Bed, ShieldCheck, Zap } from 'lucide-react';
import { HOTEL_INFO } from '../data/hotelData.ts';

interface AboutSplitProps {
  lang: 'en' | 'hi';
}

export const AboutSplit: React.FC<AboutSplitProps> = ({ lang }) => {
  return (
    <section id="about" className="py-20 sm:py-28 bg-[#EDE9DF]/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Story & Contrast */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-6 h-px bg-[#C08A3E]" />
              <span className="text-xs uppercase tracking-[0.3em] text-[#C08A3E] font-semibold">
                {lang === 'hi' ? 'हमारा दर्शन एवं आतिथ्य' : 'The Ekaatra Narrative'}
              </span>
            </div>

            <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-[#1E2B24] tracking-wide leading-tight mb-6">
              {lang === 'hi' ? 'कूकस में सात-सितारा अहसास' : 'A Seven-Star Feel in Kukas'}
            </h2>

            <div className="space-y-4 text-sm sm:text-base text-[#1E2B24]/85 font-light leading-relaxed mb-8">
              <p>
                {lang === 'hi'
                  ? 'राजस्थान के कूकस स्थित रीको (RIICO) औद्योगिक क्षेत्र में बसा एकात्रा एक उच्च-रेटेड बुटीक होटल है, जिसे अपनी प्रारंभिक समीक्षाओं में पूर्ण 5.0 रेटिंग प्राप्त है।'
                  : 'Situated in the vibrant RIICO Industrial Area of Kukas, Rajasthan, Ekaatra is a highly-rated boutique hotel holding a perfect 5.0 rating from its initial verified guest reviews. The property provides a serene escape characterized by a distinctively luxurious feel.'}
              </p>
              <p>
                {lang === 'hi'
                  ? 'औद्योगिक क्षेत्र में स्थित होने के बावजूद, एकात्रा एक उच्च-स्तरीय "सात-सितारा" वातावरण सफलतापूर्वक निर्मित करता है। यहां का परिवेश खूबसूरती से संजोया गया, शांत, बेहद आरामदायक और तनावमुक्त करने वाला है।'
                  : 'Despite its location within an industrial area, the property successfully cultivates a high-end, "seven-star" atmosphere. Guests frequently celebrate the beautifully maintained, tranquil environment, describing the overarching vibe as both deeply comforting and relaxing.'}
              </p>
              <p>
                {lang === 'hi'
                  ? 'अतिथियों के कमरे आधुनिक, स्वच्छ और विशाल हैं। इनमें स्टाइलिश सीलिंग डिजाइन, अत्यंत आरामदायक बिस्तर, स्वच्छ बाथरूम और उन्नत ड्यूल-मोड प्रकाश व्यवस्था शामिल है। साथ ही, हमारी टीम का सत्कार स्नेही है और चेक-इन/आउट प्रक्रियाएं पूरी तरह से निर्बाध और बिजली जैसी तेज हैं।'
                  : 'Guest rooms are modern, clean, and spacious, featuring exceptionally comfortable beds and stylish ceiling cove designs. Bathrooms are praised for good hygiene and maintenance, with upgraded dual-mode lighting. Paired with heartwarming staff hospitality and seamless, lightning-fast check-in and check-out, Ekaatra redefines highway hospitality.'}
              </p>
            </div>

            {/* Key Quality Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 pt-2 border-t border-[#A3B8A0]/40">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#C08A3E]/15 text-[#C08A3E] mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1E2B24]">
                    {lang === 'hi' ? 'त्वरित 90-सेकंड चेक-इन' : 'Lightning Check-in'}
                  </h4>
                  <p className="text-xs text-[#3E5C4A] font-light mt-0.5">
                    {lang === 'hi' ? 'बिना किसी कतार या प्रतीक्षा के कमरे की चाबी' : 'Instant digital keys with minimal paper formalities.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#C08A3E]/15 text-[#C08A3E] mt-0.5">
                  <Bed className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-[#1E2B24]">
                    {lang === 'hi' ? 'परम विश्राम गद्दे' : 'Supreme Bedding'}
                  </h4>
                  <p className="text-xs text-[#3E5C4A] font-light mt-0.5">
                    {lang === 'hi' ? 'साउंडप्रूफ कमरे एवं 400TC सूती चादरें' : 'Double-glazed soundproof rooms for serene sleep.'}
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Link to Google Maps */}
            <div>
              <a
                href={HOTEL_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#1E2B24] hover:text-[#C08A3E] transition-colors border-b-2 border-[#C08A3E] pb-1 group"
              >
                <span>{lang === 'hi' ? 'गूगल मैप्स पर एकात्रा देखें →' : 'View on Google Maps →'}</span>
                <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          {/* Right Column: Visual with Solid Color Offset Block */}
          <div className="lg:col-span-6 relative mt-8 lg:mt-0">
            {/* Solid Color Offset Accent Block */}
            <div className="absolute -inset-3 sm:-inset-4 bg-[#C08A3E] transform translate-x-4 translate-y-4 -z-10" />

            {/* Main Photograph Frame */}
            <div className="relative bg-[#1E2B24] overflow-hidden shadow-2xl">
              <img
                src="https://lh3.googleusercontent.com/gps-cs-s/ANWiy9Q_JqZdpzoeCKvXrGS7u0nYwXaOgjcnd30-Cg94Kj2lb5Fkxe9qRBpwDFSc6UGFUJAmJFkYmN-oVYp7A14gCpeEzrIkRnjlayvSeV_Ti2toaB0BX35QtJDFlchucdiMnSur4RXE5-Jaf08=w1200-h800-k-no"
                alt="Ekaatra Hotel Kukas, Jaipur Exterior"
                className="w-full h-[420px] sm:h-[480px] object-cover object-center filter contrast-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Floating Quote Badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 sm:p-5 bg-white/95 backdrop-blur-md border-l-4 border-[#C08A3E] shadow-lg">
                <p className="font-serif-luxury text-sm sm:text-base italic text-[#1E2B24]">
                  "{HOTEL_INFO.welcomeQuote}"
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 text-[11px] text-gray-600">
                  <span className="font-semibold uppercase tracking-wider text-[#C08A3E]">Ekaatra Hospitality</span>
                  <span>RIICO Industrial Area, Kukas</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
