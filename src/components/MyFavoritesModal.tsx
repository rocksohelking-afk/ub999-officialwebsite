import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface MyFavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyFavoritesModal: React.FC<MyFavoritesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#003830] overflow-y-auto no-scrollbar">
      {/* Mobile container matching Screenshot_20261010-032254.jpg */}
      <div className="relative w-full max-w-[430px] min-h-screen bg-[#003830] text-white flex flex-col">
        
        {/* Top Header Bar matching Screenshot */}
        <div className="bg-[#003830] px-4 pt-3.5 pb-3 flex items-center justify-between sticky top-0 z-20">
          <button
            type="button"
            onClick={onClose}
            className="p-1 -ml-1 text-[#ffd000] hover:text-amber-300 active:scale-95 transition-transform cursor-pointer flex items-center justify-center"
            title="Back"
            aria-label="Back"
          >
            <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
          </button>

          <h2 className="text-lg font-bold text-[#ffd000] tracking-wide text-center flex-1 pr-6">
            My favorite
          </h2>

          <div className="w-6" /> {/* Balance spacer to keep title centered */}
        </div>

        {/* Body with exact "No data" illustration */}
        <div className="flex-1 flex flex-col items-center justify-start pt-28 px-4">
          
          {/* Custom SVG matching the screenshot */}
          <div className="relative w-36 h-36 flex items-center justify-center select-none">
            <svg
              className="w-full h-full"
              viewBox="0 0 160 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Circular Backdrop Halo */}
              <circle cx="80" cy="80" r="54" fill="#548088" fillOpacity="0.45" />

              {/* Sparkles / Accents around halo */}
              {/* Top-Right Dots */}
              <circle cx="124" cy="46" r="2.5" fill="#7ba5ad" />
              <circle cx="132" cy="54" r="1.8" fill="#7ba5ad" />
              {/* Top-Left Rays / Sparkles */}
              <circle cx="44" cy="47" r="2.2" fill="#7ba5ad" />
              <path d="M37 49L31 46" stroke="#7ba5ad" strokeWidth="2" strokeLinecap="round" />
              <path d="M42 41L38 35" stroke="#7ba5ad" strokeWidth="2" strokeLinecap="round" />
              {/* Bottom-Left Dots */}
              <circle cx="41" cy="116" r="2.2" fill="#7ba5ad" />
              <circle cx="48" cy="123" r="1.8" fill="#7ba5ad" />

              {/* Folded Paper Document */}
              <g transform="translate(48, 38)">
                {/* Paper body with top-right cut */}
                <path
                  d="M6 0 H48 L64 16 V80 C64 83.3 61.3 86 58 86 H6 C2.7 86 0 83.3 0 80 V6 C0 2.7 2.7 0 6 0 Z"
                  fill="#9cbcc3"
                  fillOpacity="0.55"
                />
                {/* Top-Right Corner Fold */}
                <path
                  d="M48 0 V16 H64 Z"
                  fill="#789ea6"
                  fillOpacity="0.8"
                />
                {/* Document text placeholder lines */}
                <line x1="12" y1="20" x2="26" y2="20" stroke="#759da5" strokeWidth="3" strokeLinecap="round" />
                <line x1="12" y1="30" x2="36" y2="30" stroke="#759da5" strokeWidth="3" strokeLinecap="round" />
                <line x1="12" y1="40" x2="32" y2="40" stroke="#759da5" strokeWidth="3" strokeLinecap="round" />
              </g>

              {/* Magnifying Glass with X Cross */}
              <g transform="translate(80, 80)">
                {/* Glass Rim */}
                <circle cx="0" cy="0" r="26" fill="#759ea7" fillOpacity="0.85" />
                <circle cx="0" cy="0" r="20" fill="#9dbec5" fillOpacity="0.95" />

                {/* Inner Center Circle with X */}
                <circle cx="0" cy="0" r="11" fill="#608992" />
                {/* 'X' icon */}
                <path
                  d="M-4.5 -4.5 L4.5 4.5 M4.5 -4.5 L-4.5 4.5"
                  stroke="#b9d6dc"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Handle pointing down-right */}
                <path
                  d="M17 17 L36 36"
                  stroke="#759ea7"
                  strokeWidth="9"
                  strokeLinecap="round"
                />
              </g>
            </svg>
          </div>

          {/* Text: "No data" */}
          <p className="mt-3.5 text-base font-medium text-[#709ba5] tracking-wide select-none">
            No data
          </p>
        </div>

      </div>
    </div>
  );
};
