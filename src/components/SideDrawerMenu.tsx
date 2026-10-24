import React from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SideDrawerMenu: React.FC<DrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const menuItems = [
    {
      id: 'hot',
      label: 'Hot Games',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#ff5733]">
          <path d="M12 23c-4.97 0-9-4.03-9-9 0-3.8 2.5-7.3 6-8.5-.3 1.5.2 3.1 1.3 4.1 1.7-2.7 3.7-5.1 4.7-7.6 3 2.5 6 6.3 6 11 0 5.52-4.03 10-9 10z" />
        </svg>
      ),
    },
    {
      id: 'invite',
      label: 'Invite friends',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#00f5cc]">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
        </svg>
      ),
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#ff6b6b]">
          <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
          <path d="M12 11c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z" fill="#012b23" />
        </svg>
      ),
    },
    {
      id: 'promotion',
      label: 'Promotion',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#ffd000]">
          <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.65-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76V14h2V8.76L15.38 12 17 10.83 14.92 8H20v6z" />
        </svg>
      ),
    },
    {
      id: 'slots',
      label: 'Slots',
      icon: (
        <div className="w-7 h-5 rounded-md bg-[#ff6b6b] flex items-center justify-center text-[10px] font-black text-[#012b23] tracking-tighter shadow">
          777
        </div>
      ),
    },
    {
      id: 'reward',
      label: 'Reward Center',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#ffd000]">
          <circle cx="12" cy="8" r="6" />
          <path d="M8 14l-3 8 7-4 7 4-3-8" />
        </svg>
      ),
    },
    {
      id: 'casino',
      label: 'Live Casino',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#ff6b6b]">
          <circle cx="12" cy="12" r="10" stroke="#ffd000" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" fill="#ffd000" />
        </svg>
      ),
    },
    {
      id: 'rebate',
      label: 'Manual rebate',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#ffd000]">
          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
          <circle cx="12" cy="15" r="1.5" />
        </svg>
      ),
    },
    {
      id: 'sports',
      label: 'Sports',
      icon: (
        <div className="flex items-center gap-0.5">
          <div className="w-1 h-5 bg-[#ff6b6b] rounded-xs" />
          <div className="w-1 h-5 bg-[#ff6b6b] rounded-xs" />
          <div className="w-1 h-5 bg-[#ff6b6b] rounded-xs" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffd000] ml-0.5 -mt-1" />
        </div>
      ),
    },
    {
      id: 'vip',
      label: 'VIP',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#ffd000]">
          <path d="M6 3h12l4 6-10 12L2 9l4-6z" />
        </svg>
      ),
    },
    {
      id: 'esports',
      label: 'E-sports',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#ff6b6b]">
          <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>
      ),
    },
    {
      id: 'mission',
      label: 'Mission',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6">
          <circle cx="12" cy="12" r="10" fill="none" stroke="#ffd000" strokeWidth="2" />
          <circle cx="12" cy="12" r="6" fill="none" stroke="#00f5cc" strokeWidth="2" />
          <circle cx="12" cy="12" r="2.5" fill="#ffd000" />
        </svg>
      ),
    },
    {
      id: 'poker',
      label: 'Poker',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#ff6b6b]">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm0-9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>
      ),
    },
    {
      id: 'language',
      label: 'Language',
      icon: (
        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/60 flex flex-col shadow">
          <div className="h-1/2 w-full bg-[#3c3b6e] flex items-center justify-center text-[7px] text-white">
            ★
          </div>
          <div className="h-1/2 w-full bg-white flex flex-col">
            <div className="h-1/3 bg-[#b22234]" />
            <div className="h-1/3 bg-white" />
            <div className="h-1/3 bg-[#b22234]" />
          </div>
        </div>
      ),
    },
    {
      id: 'fish',
      label: 'Fish',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#ff6b6b]">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      ),
    },
    {
      id: 'download',
      label: 'APP Download',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#00f5cc]">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" />
        </svg>
      ),
    },
    {
      id: 'lottery',
      label: 'Lottery',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#ff6b6b]">
          <path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-9 7.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z" />
        </svg>
      ),
    },
    {
      id: 'support',
      label: 'Customer Service',
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#00f5cc]">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Blurred / Darkened Backdrop on the right */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      {/* Slide-out Menu Panel (Approx 64% of screen width matching screenshot) */}
      <div 
        className="relative w-[65%] max-w-[285px] bg-[#002f27] border-r border-[#074639] h-full overflow-y-auto no-scrollbar z-10 p-2.5 pb-20 shadow-2xl flex flex-col justify-start select-none"
      >
        {/* 2-Column Grid of square tiles matching Screenshot_20261008-234359.png */}
        <div className="grid grid-cols-2 gap-2">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={(e) => {
                // Strictly inert as requested: "ওইগুলোর পরে ক্লিক করলে কিছুই হবে না এমন থাকবে"
                e.preventDefault();
                e.stopPropagation();
              }}
              className="bg-[#00251f] hover:bg-[#00201a] border border-[#094d40] rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-default min-h-[76px] transition-colors shadow-sm"
            >
              <div className="mb-1.5 flex items-center justify-center h-7">
                {item.icon}
              </div>
              <span className="text-[11px] font-bold text-white leading-tight line-clamp-2">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
