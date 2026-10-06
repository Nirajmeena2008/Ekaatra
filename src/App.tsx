/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { FeaturesGrid } from './components/FeaturesGrid.tsx';
import { AboutSplit } from './components/AboutSplit.tsx';
import { ReviewsSection } from './components/ReviewsSection.tsx';
import { InfoBanner } from './components/InfoBanner.tsx';
import { RoomsSection } from './components/RoomsSection.tsx';
import { ValueHighlightsBar } from './components/ValueHighlightsBar.tsx';
import { ExperiencesSection } from './components/ExperiencesSection.tsx';
import { PreFooterBanner } from './components/PreFooterBanner.tsx';
import { GallerySection } from './components/GallerySection.tsx';
import { Footer } from './components/Footer.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { GuestDashboardModal } from './components/GuestDashboardModal.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { Room } from './data/hotelData.ts';

function HotelApp() {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const { 
    isLoggedIn, 
    openLoginModal, 
    closeLoginModal, 
    isLoginModalOpen, 
    loginReason, 
    onLoginSuccessCallback 
  } = useAuth();

  // Modals state
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isGuestPortalOpen, setIsGuestPortalOpen] = useState(false);

  // Selected room & search criteria for booking modal
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [activeSearchParams, setActiveSearchParams] = useState<{
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    category?: string;
  } | undefined>(undefined);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'hi' : 'en'));
  };

  // Guarded Room Booking Action: Customer must be logged in with mobile OTP
  const triggerGuardedBooking = (room?: Room | null, criteria?: any) => {
    if (!isLoggedIn) {
      openLoginModal(
        'To book a suite at Ekaatra, please log in with your customer name and mobile number.',
        () => {
          if (room) setSelectedRoomForBooking(room);
          if (criteria) setActiveSearchParams(criteria);
          setIsBookingOpen(true);
        }
      );
    } else {
      if (room) setSelectedRoomForBooking(room);
      if (criteria) setActiveSearchParams(criteria);
      setIsBookingOpen(true);
    }
  };

  // Guarded Guest Portal Action: Customer must be logged in with mobile OTP
  const triggerGuardedGuestPortal = () => {
    if (!isLoggedIn) {
      openLoginModal(
        'Please log in with your mobile number to view your reservations and upload your government ID proof.',
        () => setIsGuestPortalOpen(true)
      );
    } else {
      setIsGuestPortalOpen(true);
    }
  };

  const handleHeroCheckAvailability = (params: {
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    category?: string;
  }) => {
    setActiveSearchParams(params);
    // Smooth scroll down to rooms section
    const el = document.getElementById('rooms');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFeaturesGridSelect = (action: string) => {
    if (action === 'rooms') {
      const el = document.getElementById('rooms');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'about') {
      const el = document.getElementById('about');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (action === 'gallery') {
      const el = document.getElementById('gallery');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1E2B24] flex flex-col font-sans selection:bg-[#C08A3E]/30 selection:text-[#1E2B24]">
      {/* Sticky Luxury Navbar with Login Status */}
      <Navbar
        onOpenBooking={() => triggerGuardedBooking(null)}
        onOpenGuestPortal={triggerGuardedGuestPortal}
        onOpenLogin={() => openLoginModal()}
        lang={lang}
        onToggleLang={toggleLanguage}
      />

      {/* Main Content Area: Freely browsable by guests */}
      <main className="flex-1">
        {/* Ekaatra Hotel Hero Banner with Signature Floating Reservation Bar */}
        <Hero
          onCheckAvailability={handleHeroCheckAvailability}
          onExploreSuites={() => {
            const el = document.getElementById('rooms');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onOpenBookingModal={() => triggerGuardedBooking(null)}
          lang={lang}
        />

        {/* 5-Pillar Value Proposition Strip */}
        <ValueHighlightsBar lang={lang} />

        {/* Ekaatra Suites & Rooms Showcase (Editorial 3-Column Grid) */}
        <RoomsSection
          onBookRoom={(room, criteria) => triggerGuardedBooking(room, criteria)}
          searchParams={activeSearchParams}
          currency="INR"
          lang={lang}
        />

        {/* Experiences to Inspire Section */}
        <ExperiencesSection
          onBookNow={() => triggerGuardedBooking(null)}
          lang={lang}
        />

        {/* 5.0 Rating & Property Experience Insights Section */}
        <ReviewsSection lang={lang} />

        {/* Split 'About / Location' Section */}
        <AboutSplit lang={lang} />

        {/* Interactive Media Gallery with Categorized Filtering & Lightbox */}
        <GallerySection lang={lang} />

        {/* Plan Your Perfect Getaway Pre-Footer Panorama Banner */}
        <PreFooterBanner
          onBookNow={() => triggerGuardedBooking(null)}
          lang={lang}
        />
      </main>

      {/* 4-Column Dark Slate Footer */}
      <Footer
        onOpenBooking={() => triggerGuardedBooking(null)}
        onOpenGuestPortal={triggerGuardedGuestPortal}
        lang={lang}
      />

      {/* Customer Mobile OTP Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        reason={loginReason}
        onSuccess={onLoginSuccessCallback}
        lang={lang}
      />

      {/* Booking Checkout Engine Modal (Available to authenticated customers) */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        selectedRoom={selectedRoomForBooking}
        initialParams={activeSearchParams}
        currency="INR"
        lang={lang}
      />

      {/* Guest Dashboard & ID Proof Upload Modal */}
      <GuestDashboardModal
        isOpen={isGuestPortalOpen}
        onClose={() => setIsGuestPortalOpen(false)}
        lang={lang}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <HotelApp />
    </AuthProvider>
  );
}
