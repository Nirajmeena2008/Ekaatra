import React from 'react';
import { ArrowUpRight } from 'lucide-react';

interface FeaturesGridProps {
  onSelectCategory: (cat: string) => void;
  lang: 'en' | 'hi';
}

export const FeaturesGrid: React.FC<FeaturesGridProps> = ({ onSelectCategory, lang }) => {
  const features = [
    {
      id: 'rooms',
      category: lang === 'hi' ? 'आधुनिक एवं विशाल कमरे' : 'Modern, Clean & Spacious',
      subtitle: lang === 'hi' ? 'सीलिंग डिजाइन एवं परम विश्राम' : 'Stylish Ceilings & Comfort Beds',
      description: lang === 'hi'
        ? 'आधुनिक, स्वच्छ और विशाल कमरे। स्टाइलिश सीलिंग डिजाइन, अति-आरामदायक ऑर्थोपेडिक बिस्तर, स्वच्छ बाथरूम और उन्नत ड्यूल-मोड प्रकाश।'
        : 'Spacious, impeccably clean guest rooms featuring very comfortable beds, stylish false ceiling cove illumination, and pristine hygienic bathrooms.',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      action: 'rooms'
    },
    {
      id: 'hospitality',
      category: lang === 'hi' ? 'हृदयस्पर्शी आतिथ्य' : 'Heartwarming Hospitality',
      subtitle: lang === 'hi' ? 'स्नेही स्टाफ एवं निर्बाध चेक-इन' : 'Welcoming Staff & Lightning Check-in',
      description: lang === 'hi'
        ? 'हमारा स्टाफ गर्मजोशी से भरपूर, स्नेही और सहायता के लिए सदैव तत्पर है। चेक-इन और चेक-आउट प्रक्रियाएं पूर्णतः निर्बाध और बिजली जैसी तेज हैं।'
        : 'Consistently praised for heartwarming hospitality by a warm, welcoming team eager to assist. Seamless arrival and departure with lightning-fast check-in.',
      image: 'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9Q_JqZdpzoeCKvXrGS7u0nYwXaOgjcnd30-Cg94Kj2lb5Fkxe9qRBpwDFSc6UGFUJAmJFkYmN-oVYp7A14gCpeEzrIkRnjlayvSeV_Ti2toaB0BX35QtJDFlchucdiMnSur4RXE5-Jaf08=w1200-h800-k-no',
      action: 'about'
    },
    {
      id: 'sanctuary',
      category: lang === 'hi' ? 'शांत एवं सुखद मरुद्यान' : 'Tranquil Seven-Star Escape',
      subtitle: lang === 'hi' ? 'कूकस रीको में सुखद विश्राम' : 'Comforting & Relaxing Vibe',
      description: lang === 'hi'
        ? 'रीको औद्योगिक क्षेत्र के बीच एक खूबसूरती से संजोया गया, शांत और सुखद मरुद्यान जो उच्च-स्तरीय सात-सितारा अहसास प्रदान करता है।'
        : 'A beautifully maintained, tranquil environment delivering a high-end "seven-star" feel and deeply comforting, relaxing atmosphere inside RIICO Kukas.',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      action: 'about'
    }
  ];

  return (
    <section id="features" className="py-20 sm:py-24 bg-[#EDE9DF]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Luxury Serif */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C08A3E] font-semibold mb-3">
            {lang === 'hi' ? 'विशिष्ट अनुभव' : 'Curated Experiences'}
          </p>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-[#1E2B24] tracking-wide">
            {lang === 'hi' ? 'आधुनिक शांति, शाश्वत आतिथ्य' : 'The Essence of Ekaatra'}
          </h2>
          <div className="w-16 h-0.5 bg-[#C08A3E] mx-auto mt-4" />
        </div>

        {/* 3-Column Nordevik-style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectCategory(item.action)}
              className="group relative aspect-[4/5] overflow-hidden cursor-pointer shadow-md bg-[#1E2B24]"
            >
              {/* Image with zoom on hover */}
              <img
                src={item.image}
                alt={item.category}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-90"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-300" />

              {/* Content at Bottom */}
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 flex flex-col justify-end text-white transform transition-transform duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-[0.25em] text-[#C08A3E] font-semibold">
                    {item.subtitle}
                  </span>
                  <div className="w-8 h-8 rounded-none border border-[#C08A3E]/50 flex items-center justify-center text-[#C08A3E] group-hover:bg-[#C08A3E] group-hover:text-[#1E2B24] transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="font-serif-luxury text-2xl sm:text-3xl font-normal tracking-wide text-white mb-3">
                  {item.category}
                </h3>

                {/* Description revealed on hover / readable */}
                <p className="text-xs sm:text-sm text-gray-300 font-light leading-relaxed line-clamp-3 sm:line-clamp-none transition-all duration-300 group-hover:text-white">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
