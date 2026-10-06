import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Bed, 
  Sparkles, 
  Star, 
  Image as ImageIcon, 
  User, 
  LogOut, 
  Menu, 
  X,
  Globe,
  CalendarDays,
  Compass
} from 'lucide-react';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenGuestPortal: () => void;
  onOpenLogin: () => void;
  lang: 'en' | 'hi';
  onToggleLang: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenGuestPortal,
  onOpenLogin,
  lang,
  onToggleLang
}) => {
  const { user, isLoggedIn, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('rooms');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sections = [
    { id: 'rooms', label: lang === 'hi' ? 'कक्ष एवं सुइट्स' : 'Suites', href: '#rooms', icon: Bed },
    { id: 'experiences', label: lang === 'hi' ? 'अनुभव' : 'Experiences', href: '#experiences', icon: Compass },
    { id: 'about', label: lang === 'hi' ? 'होटल परिचय' : 'Story', href: '#about', icon: Sparkles },
    { id: 'reviews', label: lang === 'hi' ? 'समीक्षाएं' : 'Reviews', href: '#reviews', icon: Star },
    { id: 'gallery', label: lang === 'hi' ? 'गैलरी' : 'Gallery', href: '#gallery', icon: ImageIcon },
  ];

  return (
    <header className="bg-[#1E2B24] text-white select-none sticky top-0 z-50 shadow-sm">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[58px] sm:min-h-[64px] py-1.5 sm:py-2 gap-2 sm:gap-4 -translate-x-[5px]">
          
          {/* Hotel Name / Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <a href="#" className="flex flex-col group">
              <span className="font-extrabold text-xl sm:text-2xl text-white font-sans tracking-tight leading-none whitespace-nowrap">
                Ekaatra<span className="text-[#C08A3E]">.</span>
              </span>
              <span className="text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest text-[#C08A3E] uppercase font-semibold mt-1 whitespace-nowrap">
                Hotel & Suites · Kukas
              </span>
            </a>
          </div>

          {/* Right Controls: Optimized Language, Sign In, Book Room */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Sleek Language Selector */}
            <button 
              type="button"
              onClick={onToggleLang}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full border border-white/30 hover:border-[#C08A3E] hover:bg-white/10 text-xs font-semibold text-white transition-all shadow-sm shrink-0 whitespace-nowrap"
              title="Toggle Language: English / हिन्दी"
            >
              <Globe className="w-3.5 h-3.5 text-[#C08A3E] shrink-0" />
              <span className="hidden md:inline">{lang === 'hi' ? 'हिन्दी' : 'English'}</span>
              <span className="text-[10px] bg-white/20 px-1 py-0.5 rounded uppercase tracking-wider font-mono font-bold">
                {lang.toUpperCase()}
              </span>
            </button>

            {/* Auth Button: Sign In / User Profile */}
            {isLoggedIn && user ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onOpenGuestPortal}
                  className="bg-white hover:bg-[#EDE9DF] text-[#1E2B24] text-xs sm:text-sm font-semibold px-2.5 sm:px-3.5 py-1.5 rounded transition-colors flex items-center gap-1.5 shadow-sm whitespace-nowrap shrink-0"
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#1E2B24] shrink-0" />
                  <span className="max-w-[70px] sm:max-w-[110px] truncate">{user.name.split(' ')[0]}</span>
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="hover:bg-white/10 text-white/80 hover:text-white p-1.5 rounded transition-colors shrink-0"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="bg-white hover:bg-[#EDE9DF] text-[#1E2B24] text-xs sm:text-sm font-semibold px-2.5 sm:px-4 py-1.5 rounded transition-colors shadow-sm shrink-0 whitespace-nowrap"
              >
                Sign in
              </button>
            )}

            {/* Book Room Button beside Sign In */}
            <button
              type="button"
              onClick={onOpenBooking}
              className="bg-[#C08A3E] hover:bg-[#a67431] text-[#1E2B24] text-xs sm:text-sm font-bold px-3 sm:px-4.5 py-1.5 rounded transition-transform hover:scale-[1.02] active:scale-95 shadow-md flex items-center gap-1 sm:gap-1.5 shrink-0 whitespace-nowrap"
            >
              <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Book Room</span>
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-white hover:bg-white/10 rounded transition-colors shrink-0 ml-0.5"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

          </div>
        </div>

        {/* Ekaatra Sections Navigation Bar (Replaced third-party flights/cars with authentic Ekaatra sections) */}
        <div className="hidden lg:flex items-center space-x-2 overflow-x-auto py-2.5 scrollbar-none border-t border-white/10 text-sm">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <a
                key={sec.id}
                href={sec.href}
                onClick={() => setActiveSection(sec.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                  isActive
                    ? 'border border-[#C08A3E] bg-[#C08A3E]/20 text-white'
                    : 'text-white/85 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 text-white" />
                <span>{sec.label}</span>
              </a>
            );
          })}
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#151e19] border-t border-white/10 px-4 py-4 space-y-3 animate-fade-in text-sm">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <a
                key={sec.id}
                href={sec.href}
                onClick={() => {
                  setActiveSection(sec.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2.5 py-2 text-white/90 hover:text-white border-b border-white/10"
              >
                <Icon className="w-4 h-4 text-[#C08A3E]" />
                <span>{sec.label}</span>
              </a>
            );
          })}

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenBooking();
            }}
            className="w-full bg-[#C08A3E] hover:bg-[#a67431] text-[#1E2B24] py-2.5 font-bold rounded text-center block mt-2 shadow"
          >
            Book Room Now
          </button>
        </div>
      )}
    </header>
  );
};
