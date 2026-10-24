import React, { useEffect, useRef } from 'react';

interface ProfileDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export const ProfileDropdownMenu: React.FC<ProfileDropdownMenuProps> = ({
  isOpen,
  onClose,
  onLogout,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Options exactly as shown in Screenshot_20261010-022440.jpg
  const menuItems = [
    {
      id: 'account_record',
      label: 'Account record',
      icon: (
        <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
          {/* Hexagon with user */}
          <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 4a3 3 0 110 6 3 3 0 010-6zm-4.5 11.5c.3-2 2-3.5 4.5-3.5s4.2 1.5 4.5 3.5h-9z" />
        </svg>
      ),
    },
    {
      id: 'betting_record',
      label: 'Betting Record',
      icon: (
        <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
          {/* Calendar with star */}
          <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 16H5V9h14v11zm-4-9l1.2 2.5 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4L15 11z" />
        </svg>
      ),
    },
    {
      id: 'profit_loss',
      label: 'Profit And Loss',
      icon: (
        <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
          {/* Document with list */}
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 12h8v2H8v-2zm0 4h8v2H8v-2z" />
        </svg>
      ),
    },
    {
      id: 'message',
      label: 'Message',
      icon: (
        <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
          {/* Mail envelope */}
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      ),
    },
    {
      id: 'deposit',
      label: 'Deposit',
      icon: (
        <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
          {/* Bag with plus */}
          <path d="M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-4zm-6-2h4v2h-4V4zm3 8h2v2h-2v2h-2v-2H9v-2h2v-2h2v2z" />
        </svg>
      ),
    },
    {
      id: 'withdrawal',
      label: 'Withdrawal',
      icon: (
        <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
          {/* Card / Banknote with arrows */}
          <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm-2 13h-4v-2h4v2zm2-5H4V8h16v4zm-14 5a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      ),
    },
    {
      id: 'customer_service',
      label: 'Customer Service',
      icon: (
        <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
          {/* Headphones with 24 */}
          <path d="M12 3a9 9 0 00-9 9v6a3 3 0 003 3h2v-7H5v-2a7 7 0 0114 0v2h-3v7h2a3 3 0 003-3v-6a9 9 0 00-9-9zm-2 11h1v1h-1v-1zm4 0h1v1h-1v-1z" />
        </svg>
      ),
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: (
        <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor">
          {/* Logout door with arrow */}
          <path d="M17 7l-1.4 1.4L18.2 11H8v2h10.2l-2.6 2.6L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      ref={menuRef}
      className="absolute right-2 top-[46px] z-50 w-56 bg-[#002b26] border border-[#005a4a] rounded-2xl shadow-2xl py-2 px-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      style={{
        boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(0, 245, 204, 0.15)',
      }}
    >
      <div className="flex flex-col space-y-0.5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (item.id === 'logout' && onLogout) {
                onClose();
                onLogout();
                return;
              }
              // User instruction: "শুধু এই অপশন গুলো থাকবে ক্লিক করলে কিছু হবে না ।"
            }}
            className="flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-[#023b34] text-white transition-colors cursor-pointer text-left w-full active:bg-[#034940]"
          >
            <div className="w-5 h-5 flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <span className="text-[13px] font-medium text-slate-100 tracking-wide select-none">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
