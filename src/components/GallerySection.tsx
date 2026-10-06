import React, { useState, useEffect } from 'react';
import { GalleryItem, INITIAL_GALLERY } from '../data/hotelData.ts';
import { api } from '../lib/api.ts';
import { Eye, X, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

interface GallerySectionProps {
  lang: 'en' | 'hi';
}

export const GallerySection: React.FC<GallerySectionProps> = ({ lang }) => {
  const [items, setItems] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    api.getGallery()
      .then((res) => {
        if (res.success && res.gallery?.length) {
          setItems(res.gallery);
        }
      })
      .catch(() => {
        // fallback to initial
      });
  }, []);

  const categories = [
    { id: 'all', label: lang === 'hi' ? 'सभी फोटो' : 'All Views' },
    { id: 'exterior', label: lang === 'hi' ? 'बाहरी दृश्य व लॉन' : 'Exterior & Grounds' },
    { id: 'rooms', label: lang === 'hi' ? 'सुइट्स एवं सीलिंग' : 'Suites & Design' },
    { id: 'bathrooms', label: lang === 'hi' ? 'रेन शॉवर बाथरूम' : 'Bathrooms' }
  ];

  // Only keep hotel exterior, suites, and bathroom assets
  const visibleItems = items.filter(i => i.category !== 'dining' && i.category !== 'banquets');

  const filteredItems = activeCategory === 'all'
    ? visibleItems
    : visibleItems.filter(item => item.category === activeCategory);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
    }
  };

  return (
    <section id="gallery" className="py-20 sm:py-28 bg-[#FAF9F5] border-t border-[#A3B8A0]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-[#C08A3E] font-semibold mb-3">
            {lang === 'hi' ? 'दृश्य सौंदर्य' : 'Architectural Portfolio'}
          </p>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-[#1E2B24] tracking-wide">
            {lang === 'hi' ? 'एकात्रा की सजीव झलक' : 'The Ekaatra Gallery'}
          </h2>
          <div className="w-16 h-0.5 bg-[#C08A3E] mx-auto mt-4 mb-4" />
          <p className="text-sm text-[#3E5C4A] font-light">
            {lang === 'hi'
              ? 'आधुनिक सीलिंग लाइट, भव्य पत्थर के मेहराब और शांत वातावरण का प्रत्यक्ष दर्शन।'
              : 'Explore the interplay of warm amber illumination, desert-oasis tranquility, and contemporary suites.'}
          </p>
        </div>

        {/* Category Filter Pills / Buttons (Sharp corners) */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 text-xs uppercase tracking-[0.18em] font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-[#1E2B24] text-white shadow-sm'
                  : 'bg-[#EDE9DF]/70 text-[#1E2B24] hover:bg-[#C08A3E]/20 hover:text-[#1E2B24] border border-[#A3B8A0]/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => openLightbox(idx)}
              className="group relative h-64 overflow-hidden bg-[#1E2B24] cursor-pointer shadow-sm border border-[#A3B8A0]/30"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E2B24]/95 via-[#1E2B24]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                {item.isGoogleMapsAsset && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-[#C08A3E] font-semibold uppercase tracking-wider mb-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Google Maps Property Asset
                  </span>
                )}
                <h4 className="font-serif-luxury text-base font-medium text-white mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-300 font-light line-clamp-2">
                  {item.caption}
                </p>
                <div className="mt-2 flex items-center gap-1 text-[11px] text-[#C08A3E] uppercase tracking-wider font-semibold">
                  <Eye className="w-3 h-3" />
                  <span>View High-Res</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && filteredItems[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-black/40 rounded-none border border-white/20 transition-colors z-50"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Prev Button */}
          <button
            onClick={prevImage}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-[#C08A3E] hover:text-[#1E2B24] transition-all z-50"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next Button */}
          <button
            onClick={nextImage}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-black/50 hover:bg-[#C08A3E] hover:text-[#1E2B24] transition-all z-50"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Center Image & Caption */}
          <div
            className="max-w-5xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={filteredItems[lightboxIndex].imageUrl}
              alt={filteredItems[lightboxIndex].title}
              className="max-w-full max-h-[72vh] object-contain shadow-2xl border border-white/10"
            />
            
            <div className="mt-4 text-center text-white max-w-xl">
              <h3 className="font-serif-luxury text-xl sm:text-2xl font-normal text-white mb-1">
                {filteredItems[lightboxIndex].title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 font-light">
                {filteredItems[lightboxIndex].caption}
              </p>
              <div className="mt-2 text-[11px] text-[#C08A3E] uppercase tracking-widest">
                Image {lightboxIndex + 1} of {filteredItems.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
