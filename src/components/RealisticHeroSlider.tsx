import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RealisticHeroSliderProps {
  onBannerClick: () => void;
}

export const RealisticHeroSlider: React.FC<RealisticHeroSliderProps> = ({ onBannerClick }) => {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const slides = [
    {
      id: 1,
      title: 'আপনার দ্বিতীয় ডিপোজিট বোনাস ১০%',
      image: '/banners/banner1.jpg',
      alt: 'Banner 1 - Second Deposit Bonus 10%'
    },
    {
      id: 2,
      title: 'UB999 Sports Cricket Live Odds',
      image: '/banners/banner2.jpg',
      alt: 'Banner 2 - Sports Cricket'
    },
    {
      id: 3,
      title: 'Fast Pay bKash & Nagad Cash Bonus',
      image: '/banners/banner3.jpg',
      alt: 'Banner 3 - Mobile Banking Bonus'
    },
    {
      id: 4,
      title: 'Aviator & Mega Slots Jackpot',
      image: '/banners/banner4.jpg',
      alt: 'Banner 4 - Mega Jackpot Games'
    }
  ];

  // Auto-play timer (every 4 seconds)
  useEffect(() => {
    const startTimer = () => {
      autoPlayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 4000);
    };

    startTimer();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [slides.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  // Touch Swipe Support for mobile devices
  const minSwipeDistance = 40;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    } else if (isRightSwipe) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  return (
    <div 
      onClick={onBannerClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ aspectRatio: '1600 / 656' }}
      className="relative w-full rounded-2xl overflow-hidden border border-[#0d594b] shadow-[0_8px_25px_rgba(0,0,0,0.6)] bg-[#00261f] cursor-pointer group select-none transition-all duration-300 hover:border-[#00f5cc]/60"
    >
      {/* Sliding Track with All 4 Banners */}
      <div 
        className="flex w-full h-full transition-transform duration-500 ease-out will-change-transform"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            className="w-full h-full shrink-0 relative bg-[#01251e] overflow-hidden"
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover object-center select-none block"
              loading={index === 0 ? 'eager' : 'lazy'}
              onError={(e) => {
                // Secondary fallback to .jpeg if .jpg name difference occurs
                const target = e.target as HTMLImageElement;
                if (slide.id === 3 && !target.src.endsWith('.jpeg')) {
                  target.src = '/banners/banner3.jpeg';
                } else if (slide.id === 4 && !target.src.endsWith('.jpeg')) {
                  target.src = '/banners/banner4.jpeg';
                }
              }}
            />
          </div>
        ))}
      </div>

      {/* Prev Navigation Arrow */}
      <button
        onClick={handlePrev}
        aria-label="Previous banner"
        className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer shadow-md active:scale-95"
      >
        <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
      </button>

      {/* Next Navigation Arrow */}
      <button
        onClick={handleNext}
        aria-label="Next banner"
        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer shadow-md active:scale-95"
      >
        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
      </button>

      {/* Bottom Pagination Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 pointer-events-auto">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentSlide(idx);
            }}
            aria-label={`Go to slide ${idx + 1}`}
            className={`rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentSlide 
                ? 'w-5 h-1.5 bg-[#ffd000] shadow-[0_0_8px_rgba(255,208,0,0.8)]' 
                : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>

    </div>
  );
};
