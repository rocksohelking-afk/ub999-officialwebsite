import React from 'react';
import { Volume2 } from 'lucide-react';
import { Language } from '../types';

interface MarqueeNoticeProps {
  lang: Language;
}

export const MarqueeNotice: React.FC<MarqueeNoticeProps> = ({ lang }) => {
  const noticeBn = "📢 স্বাগতম UB999-এ! বিকাশ, নগদ এবং রকেটের মাধ্যমে ইনস্ট্যান্ট ডিপোজিট ও উইথড্র করুন (২-৫ মিনিটে)। বিপিএল ও আইপিএল লাইভ ক্রিকেট এক্সচেঞ্জে সর্বোচ্চ অডস এবং প্রতিদিন ক্যাশ রিবেট উপভোগ করুন। যেকোনো প্রয়োজনে ২৪/৭ লাইভ চ্যাটে যোগাযোগ করুন।";
  const noticeEn = "📢 Welcome to UB999! Enjoy instant deposits & withdrawals via bKash, Nagad & Rocket within 2-5 mins. Highest odds on BPL & IPL Cricket Exchange plus daily cash rebate. Contact 24/7 Live Support for assistance.";

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2 overflow-hidden shadow-sm">
      <div className="flex items-center gap-1 text-amber-400 shrink-0 font-bold text-xs uppercase tracking-wider">
        <Volume2 className="w-4 h-4 animate-bounce" />
        <span className="hidden sm:inline font-mono">NOTICE:</span>
      </div>
      <div className="overflow-hidden relative w-full text-xs text-slate-300 font-medium">
        <div className="whitespace-nowrap animate-marquee flex items-center">
          <span>{lang === 'bn' ? noticeBn : noticeEn}</span>
          <span className="mx-8 text-amber-400 font-bold">•</span>
          <span>{lang === 'bn' ? noticeBn : noticeEn}</span>
        </div>
      </div>
    </div>
  );
};
