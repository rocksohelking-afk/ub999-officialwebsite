import React, { useState } from 'react';
import { X, Send, User, Headphones, CheckCheck, Smile } from 'lucide-react';
import { Language } from '../types';

interface LiveChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

interface ChatMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  time: string;
}

export const LiveChatWidget: React.FC<LiveChatWidgetProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'agent',
      text: lang === 'bn' 
        ? 'আসসালামু আলাইকুম! UB999 অফিসিয়াল ২৪/৭ লাইভ কাস্টমার কেয়ারে স্বাগতম। আমি তানিশা, কীভাবে আপনাকে সাহায্য করতে পারি?' 
        : 'Hello! Welcome to UB999 Official 24/7 Customer Support. I am Tanisha, how can I assist you today?',
      time: 'Just now'
    }
  ]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Automated agent response
    setTimeout(() => {
      let reply = '';
      if (userText.includes('ডিপোজিট') || userText.toLowerCase().includes('deposit')) {
        reply = lang === 'bn' 
          ? 'ডিপোজিটের জন্য বিকাশ, নগদ বা রকেট নির্বাচন করে TrxID সাবমিট করুন। মাত্র ২ মিনিটে আপনার একাউন্টে টাকা যোগ হয়ে যাবে।'
          : 'For deposit, select bKash, Nagad or Rocket and submit your TrxID. Balance will be added within 2 minutes.';
      } else if (userText.includes('উইথড্র') || userText.toLowerCase().includes('withdraw')) {
        reply = lang === 'bn'
          ? 'উইথড্র রিকোয়েস্ট ৫ থেকে ১৫ মিনিটের মধ্যে সরাসরি আপনার পার্সোনাল নাম্বারে ক্যাশ-ইন করা হয়।'
          : 'Withdrawals are processed within 5 to 15 minutes directly to your personal wallet.';
      } else {
        reply = lang === 'bn'
          ? 'ধন্যবাদ আপনার বার্তার জন্য। আমাদের সিনিয়র কাস্টমার সাপোর্ট অফিসার আপনার একাউন্ট চেক করছেন। অনুগ্রহ করে ১ মিনিট অপেক্ষা করুন।'
          : 'Thank you for your message. Our senior support officer is checking your account. Please wait a moment.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full sm:max-w-md h-[80vh] sm:h-[550px] bg-slate-900 border border-slate-800 sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-amber-400">
                  <Headphones className="w-5 h-5" />
                </div>
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 absolute bottom-0 right-0" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                UB999 VIP Support
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">
                  Online
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">তানিশা • অফিসিয়াল সাপোর্ট অফিসার</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/60">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 rounded-br-xs font-medium'
                    : 'bg-slate-800 text-slate-200 rounded-bl-xs border border-slate-700/60'
                }`}
              >
                {m.text}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 px-1">
                <span>{m.time}</span>
                {m.sender === 'user' && <CheckCheck className="w-3 h-3 text-emerald-400" />}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder={lang === 'bn' ? 'এখানে আপনার মেসেজ লিখুন...' : 'Type your message here...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
          />
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-md shadow-amber-400/20"
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        </form>

      </div>
    </div>
  );
};
