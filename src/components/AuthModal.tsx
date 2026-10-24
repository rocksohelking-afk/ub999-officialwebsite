import React, { useState } from 'react';
import { X, Lock, Phone, User, Gift, Check, Shield } from 'lucide-react';
import { Language } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'login' | 'register';
  lang: Language;
  onSuccessLogin: (user: { name: string; phone: string; referral?: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode,
  lang,
  onSuccessLogin,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [phone, setPhone] = useState<string>('01712345678');
  const [password, setPassword] = useState<string>('password123');
  const [name, setName] = useState<string>('Player');
  const [referral, setReferral] = useState<string>('UB999VIP');
  const [agree18, setAgree18] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register' && !agree18) {
      alert(lang === 'bn' ? 'আপনাকে অবশ্যই ১৮+ হতে হবে।' : 'You must be 18+ to register.');
      return;
    }
    onSuccessLogin({ name: name || 'UB999 Player', phone, referral: mode === 'register' ? referral : undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-auto">
        
        {/* Top Header Tabs */}
        <div className="bg-slate-950 border-b border-slate-800 flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMode('login')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                mode === 'login'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'bn' ? 'লগইন (Login)' : 'Login'}
            </button>
            <button
              onClick={() => setMode('register')}
              className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 ${
                mode === 'register'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'bn' ? 'রেজিস্ট্রেশন (Register)' : 'Register'}
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors mr-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {lang === 'bn' ? 'আপনার নাম:' : 'Full Name:'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="যেমন: সাকিব হাসান"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {lang === 'bn' ? 'মোবাইল নম্বর:' : 'Mobile Number:'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">
              {lang === 'bn' ? 'পাসওয়ার্ড:' : 'Password:'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {lang === 'bn' ? 'রেফারেল কোড (ঐচ্ছিক):' : 'Referral Code (Optional):'}
                </label>
                <div className="relative">
                  <Gift className="w-4 h-4 text-amber-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={referral}
                    onChange={(e) => setReferral(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-amber-400 font-mono focus:outline-hidden focus:border-amber-400 uppercase"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300">
                <input
                  type="checkbox"
                  id="agree18"
                  checked={agree18}
                  onChange={(e) => setAgree18(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500 w-4 h-4 bg-slate-900 border-slate-700"
                />
                <label htmlFor="agree18" className="cursor-pointer">
                  {lang === 'bn' ? 'আমি ১৮+ এবং সকল শর্তাবলী মেনে নিচ্ছি' : 'I am 18+ and agree to the terms'}
                </label>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            {mode === 'login' ? (
              <span>{lang === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
            ) : (
              <span>{lang === 'bn' ? 'রেজিস্ট্রেশন সম্পন্ন করুন' : 'Complete Registration'}</span>
            )}
          </button>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-400">
              {mode === 'login' ? (
                <>
                  {lang === 'bn' ? 'একাউন্ট নেই?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    {lang === 'bn' ? 'নতুন একাউন্ট খুলুন' : 'Register Now'}
                  </button>
                </>
              ) : (
                <>
                  {lang === 'bn' ? 'ইতিমধ্যে একাউন্ট আছে?' : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="text-amber-400 font-bold hover:underline"
                  >
                    {lang === 'bn' ? 'লগইন করুন' : 'Log In'}
                  </button>
                </>
              )}
            </span>
          </div>

        </form>

      </div>
    </div>
  );
};
