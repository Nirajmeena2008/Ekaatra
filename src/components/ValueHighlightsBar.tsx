import React from 'react';
import { 
  Compass, 
  Bed, 
  UtensilsCrossed, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';

interface ValueHighlightsBarProps {
  lang: 'en' | 'hi';
}

export const ValueHighlightsBar: React.FC<ValueHighlightsBarProps> = ({ lang }) => {
  const highlights = [
    {
      icon: Compass,
      title: lang === 'hi' ? 'रणनीतिक स्थान' : 'STRATEGIC SANCTUARY',
      subtitle: lang === 'hi'
        ? 'कूकस NH-48 पर स्थित, अंबर किले से 12 मिनट'
        : 'Prime NH-48 corridor & 12 mins to Amber Fort'
    },
    {
      icon: Bed,
      title: lang === 'hi' ? 'विशाल सुइट्स' : 'BESPOKE SUITES',
      subtitle: lang === 'hi'
        ? 'स्टाइलिश सीलिंग, ऑर्थोपेडिक बिस्तर व शांति'
        : 'Soundproof suites with designer cove ceilings'
    },
    {
      icon: UtensilsCrossed,
      title: lang === 'hi' ? 'शाही खान-पान' : 'ROYAL DINING',
      subtitle: lang === 'hi'
        ? 'स्वादिष्ट राजस्थानी व्यंजन व 24/7 रूम सर्विस'
        : 'Authentic Rajasthani cuisine & multi-flavor dining'
    },
    {
      icon: Sparkles,
      title: lang === 'hi' ? 'शांत मरुद्यान' : 'PEACEFUL RETREAT',
      subtitle: lang === 'hi'
        ? 'शहर के शोर से दूर, शांत और सुखद वातावरण'
        : 'Tranquil foothill haven away from urban rush'
    },
    {
      icon: ShieldCheck,
      title: lang === 'hi' ? 'सात-सितारा सेवा' : 'FIVE-STAR SERVICE',
      subtitle: lang === 'hi'
        ? 'व्यक्तिगत आतिथ्य व त्वरित 90-सेकंड चेक-इन'
        : 'Warm hospitality & swift 90-sec key arrival'
    }
  ];

  return (
    <section className="bg-[#FAF9F5] border-b border-[#A3B8A0]/30 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-4 lg:divide-x lg:divide-[#A3B8A0]/40">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index} 
                className="flex flex-col items-center text-center px-2 sm:px-4 py-1 group hover:-translate-y-0.5 transition-transform"
              >
                <div className="w-11 h-11 rounded-full bg-[#EDE9DF] border border-[#C08A3E]/30 text-[#C08A3E] flex items-center justify-center mb-3 shadow-xs group-hover:bg-[#C08A3E] group-hover:text-[#1E2B24] transition-colors">
                  <Icon className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h4 className="font-serif-luxury text-xs sm:text-sm font-semibold tracking-[0.18em] text-[#1E2B24] uppercase mb-1">
                  {item.title}
                </h4>
                <p className="text-[11px] sm:text-xs text-[#3E5C4A] font-light leading-relaxed max-w-[200px]">
                  {item.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
