import React, { useState } from 'react';
import { 
  Compass, 
  UtensilsCrossed, 
  Sparkles, 
  Landmark, 
  ArrowRight, 
  ChevronRight,
  MapPin,
  Clock
} from 'lucide-react';

interface ExperiencesSectionProps {
  onBookNow: () => void;
  lang: 'en' | 'hi';
}

export const ExperiencesSection: React.FC<ExperiencesSectionProps> = ({ onBookNow, lang }) => {
  const [selectedExperience, setSelectedExperience] = useState<number | null>(null);

  const experiences = [
    {
      id: 1,
      icon: Landmark,
      title: lang === 'hi' ? 'अंबर दुर्ग एवं ऐतिहासिक भ्रमण' : 'HERITAGE FORT EXCURSIONS',
      shortDesc: lang === 'hi'
        ? 'भव्य अंबर किला, जयगढ़ और नाहरगढ़ दुर्ग मात्र 12 से 20 मिनट की दूरी पर।'
        : 'Explore majestic Amber Fort, Jaigarh & Nahargarh perched high on the Aravalli hills.',
      detail: 'Located along NH-48 Kukas, Ekaatra offers the fastest direct route to Amber Fort (10.5 km) without city traffic delays. Our concierge arranges private guides and dawn photography excursions.',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
      time: '12 mins drive'
    },
    {
      id: 2,
      icon: UtensilsCrossed,
      title: lang === 'hi' ? 'शाही कैंडललाइट भोजन' : 'ROYAL COURTYARD DINING',
      shortDesc: lang === 'hi'
        ? 'खुले प्रांगण में कैंडललाइट डिनर एवं प्रामाणिक राजस्थानी थाली का आनंद।'
        : 'Private candlelight dinners, Dal Baati Churma, and signature chef creations.',
      detail: 'Experience unforgettable open-air evenings under the starry Rajasthan sky. Savor authentic regional spices, slow-cooked delicacies, and multi-cuisine room service available 24/7.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      time: 'Every Evening'
    },
    {
      id: 3,
      icon: Sparkles,
      title: lang === 'hi' ? 'शांत विश्राम व वेलनेस' : 'TRANQUIL FOOTHILL SERENITY',
      shortDesc: lang === 'hi'
        ? 'अरावली की ताजी हवा, शांत सुबह की सैर और तनाव-मुक्त विश्राम।'
        : 'Rejuvenating morning breezes, courtyard relaxation, and soothing silence.',
      detail: 'Escape the high-decibel city chaos. Guests consistently praise Ekaatra for its restful ambiance, peaceful courtyard grounds, and soundproof suites designed for restorative sleep.',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      time: 'Daily Sanctuary'
    },
    {
      id: 4,
      icon: Compass,
      title: lang === 'hi' ? 'गुलाबी नगरी की सैर' : 'EXPLORE THE PINK CITY',
      shortDesc: lang === 'hi'
        ? 'हवा महल, सिटी पैलेस और जोहरी बाजार के सांस्कृतिक आकर्षण।'
        : 'Chauffeured day excursions to Hawa Mahal, City Palace, and heritage bazaars.',
      detail: 'Enjoy smooth transfers straight from Kukas into the heart of the walled Pink City. Discover gem bazaars, blue pottery studios, and Jal Mahal lakeside promenades.',
      image: 'https://images.unsplash.com/photo-1603228254119-e6aef2999238?auto=format&fit=crop&w=800&q=80',
      time: 'Full / Half Day'
    }
  ];

  return (
    <section id="experiences" className="py-20 sm:py-28 bg-[#FAF9F5] border-t border-[#A3B8A0]/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C08A3E] font-semibold mb-2">
            {lang === 'hi' ? 'अविस्मरणीय पल' : 'UNFORGETTABLE MOMENTS'}
          </p>
          <div className="flex items-center justify-center gap-3 text-[#C08A3E] mb-2 opacity-80">
            <span className="w-8 h-px bg-[#C08A3E]" />
            <span className="text-xs font-serif italic">❦</span>
            <span className="w-8 h-px bg-[#C08A3E]" />
          </div>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-[#1E2B24] tracking-wide">
            {lang === 'hi' ? 'प्रेरणादायी अनूठे अनुभव' : 'Experiences to Inspire'}
          </h2>
          <p className="text-xs sm:text-sm text-[#3E5C4A] mt-3 font-light max-w-xl mx-auto">
            {lang === 'hi'
              ? 'अरावली की पहाड़ियों से लेकर प्राचीन किलों और शाही भोजन तक, एकात्रा में बिताया हर पल यादगार है।'
              : 'From sunrise fort expeditions and authentic courtyard dinners to serene foothill stillness, craft your perfect memory.'}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {experiences.map((exp) => {
            const Icon = exp.icon;
            const isExpanded = selectedExperience === exp.id;

            return (
              <div
                key={exp.id}
                className="bg-white border border-[#A3B8A0]/40 hover:border-[#C08A3E] transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
              >
                <div>
                  {/* Image container with rounded circular badge overlapping bottom */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#1E2B24]">
                    <img
                      src={exp.image}
                      alt={exp.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    
                    {/* Time indicator */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 text-[10px] font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#C08A3E]" />
                      <span>{exp.time}</span>
                    </div>

                    {/* Circular Icon overlapping bottom */}
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-white border border-[#A3B8A0]/50 shadow-md flex items-center justify-center text-[#C08A3E] group-hover:bg-[#1E2B24] group-hover:text-white transition-colors z-10">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="pt-8 pb-4 px-5 text-center">
                    <h3 className="font-serif-luxury text-sm font-semibold tracking-[0.14em] text-[#1E2B24] uppercase mb-2">
                      {exp.title}
                    </h3>
                    <p className="text-xs text-[#3E5C4A] font-light leading-relaxed mb-3">
                      {exp.shortDesc}
                    </p>

                    {isExpanded && (
                      <p className="text-[11px] text-gray-600 font-light border-t border-gray-100 pt-2.5 mt-2.5 text-left leading-relaxed animate-fade-in">
                        {exp.detail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5 pt-1 text-center border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelectedExperience(isExpanded ? null : exp.id)}
                    className="text-[11px] font-semibold text-[#1E2B24] group-hover:text-[#C08A3E] uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>{isExpanded ? 'Show Less' : 'Explore Details'}</span>
                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? '-rotate-90' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Experiences CTA Button */}
        <div className="text-center">
          <button
            type="button"
            onClick={onBookNow}
            className="border-2 border-[#1E2B24] text-[#1E2B24] hover:bg-[#1E2B24] hover:text-white px-8 py-3 text-xs uppercase tracking-[0.22em] font-semibold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <span>{lang === 'hi' ? 'सभी अनुभव व सुइट्स बुक करें' : 'View All Experiences & Reserve'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </section>
  );
};
