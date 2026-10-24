import React, { useState } from 'react';
import { X, ShieldCheck, Phone, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { Language } from '../types';

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentPhone: string;
  onUpdatePhone: (newPhone: string) => void;
  onShowToast?: (msg: string) => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  isOpen,
  onClose,
  lang,
  currentPhone,
  onUpdatePhone,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'phone' | 'password'>('phone');

  // Phone states
  const [newPhone, setNewPhone] = useState<string>('');
  const [phoneOtp, setPhoneOtp] = useState<string>('');
  const [phoneSuccess, setPhoneSuccess] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [isSubmittingPhone, setIsSubmittingPhone] = useState<boolean>(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [isSubmittingPass, setIsSubmittingPass] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle phone change
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    setPhoneSuccess(null);

    const cleaned = newPhone.trim();
    if (!cleaned) {
      setPhoneError(lang === 'bn' ? 'দয়া করে নতুন ফোন নম্বর লিখুন' : 'Please enter new phone number');
      return;
    }
    if (cleaned.length < 10) {
      setPhoneError(lang === 'bn' ? 'সঠিক ফোন নম্বর লিখুন (যেমন: 01XXXXXXXXX)' : 'Enter valid phone number');
      return;
    }
    if (cleaned === currentPhone) {
      setPhoneError(lang === 'bn' ? 'নতুন নম্বর ও বর্তমান নম্বর একই হতে পারে না' : 'New number cannot be same as current');
      return;
    }

    setIsSubmittingPhone(true);
    setTimeout(() => {
      setIsSubmittingPhone(false);
      onUpdatePhone(cleaned);
      localStorage.setItem('ub999_user_phone', cleaned);
      setPhoneSuccess(lang === 'bn' ? 'ফোন নম্বর সফলভাবে পরিবর্তন করা হয়েছে!' : 'Phone number updated successfully!');
      if (onShowToast) {
        onShowToast(lang === 'bn' ? 'ফোন নম্বর সফলভাবে আপডেট হয়েছে' : 'Phone number updated');
      }
      setNewPhone('');
      setPhoneOtp('');
      setTimeout(() => {
        setPhoneSuccess(null);
      }, 2500);
    }, 600);
  };

  // Handle password change
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!newPassword) {
      setPassError(lang === 'bn' ? 'নতুন পাসওয়ার্ড লিখুন' : 'Enter new password');
      return;
    }
    if (newPassword.length < 6) {
      setPassError(lang === 'bn' ? 'পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError(lang === 'bn' ? 'উভয় নতুন পাসওয়ার্ড একই হতে হবে' : 'Passwords do not match');
      return;
    }

    setIsSubmittingPass(true);
    setTimeout(() => {
      setIsSubmittingPass(false);
      localStorage.setItem('ub999_user_password', newPassword);
      setPassSuccess(lang === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' : 'Password updated successfully!');
      if (onShowToast) {
        onShowToast(lang === 'bn' ? 'পাসওয়ার্ড সফলভাবে আপডেট হয়েছে' : 'Password updated');
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPassSuccess(null);
      }, 2500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#051c17] border border-[#0d4a3e] rounded-2xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#021310] px-4 py-3.5 border-b border-[#0d4a3e] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-black shadow-sm">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white tracking-wide">
                {lang === 'bn' ? 'নিরাপত্তা ও সেটিংস' : 'Security Settings'}
              </h3>
              <p className="text-[11px] text-[#00f5cc]/80">
                {lang === 'bn' ? 'নাম্বার এবং পাসওয়ার্ড পরিবর্তন করুন' : 'Change Phone and Password'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white bg-[#062922] hover:bg-[#0a382e] border border-[#0d4a3e] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="p-3 bg-[#031713] border-b border-[#0d4a3e]">
          <div className="grid grid-cols-2 gap-2 bg-[#02100d] p-1 rounded-xl border border-[#0a362d]">
            <button
              onClick={() => {
                setActiveTab('phone');
                setPhoneError(null);
                setPhoneSuccess(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'phone'
                  ? 'bg-gradient-to-r from-[#00382f] to-[#044c3e] text-[#ffd000] border border-[#00f5cc]/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ফোন নম্বর পরিবর্তন' : 'Change Phone'}</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('password');
                setPassError(null);
                setPassSuccess(null);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'password'
                  ? 'bg-gradient-to-r from-[#00382f] to-[#044c3e] text-[#ffd000] border border-[#00f5cc]/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন' : 'Change Password'}</span>
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* TAB 1: PHONE CHANGE */}
          {activeTab === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-3.5">
              {/* Current Phone Badge */}
              <div className="bg-[#031713] border border-[#0d4a3e] rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    {lang === 'bn' ? 'বর্তমান ফোন নম্বর' : 'Current Phone'}
                  </span>
                  <span className="text-sm font-bold text-white font-mono">{currentPhone}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  {lang === 'bn' ? 'যাচাইকৃত' : 'Verified'}
                </span>
              </div>

              {/* New Phone Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <span>{lang === 'bn' ? 'নতুন মোবাইল নম্বর' : 'New Phone Number'}</span>
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-amber-400 font-bold font-mono">
                    +880
                  </span>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="1XXXXXXXXX"
                    maxLength={11}
                    className="w-full bg-[#021310] border border-[#0d4a3e] focus:border-[#00f5cc] rounded-xl pl-14 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* OTP (Simulation for realism) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    {lang === 'bn' ? 'যাচাইকরণ কোড (OTP)' : 'Verification Code'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setPhoneOtp('7829')}
                    className="text-[11px] text-[#00f5cc] hover:underline cursor-pointer font-bold"
                  >
                    {lang === 'bn' ? 'OTP পাঠান' : 'Send OTP'}
                  </button>
                </div>
                <input
                  type="text"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value)}
                  placeholder={lang === 'bn' ? 'SMS কোড লিখুন (যেমন: 7829)' : 'Enter 4-digit code'}
                  maxLength={6}
                  className="w-full bg-[#021310] border border-[#0d4a3e] focus:border-[#00f5cc] rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-all font-mono"
                />
              </div>

              {/* Error / Success Feedback */}
              {phoneError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{phoneError}</span>
                </div>
              )}

              {phoneSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{phoneSuccess}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingPhone}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-black font-black text-xs hover:brightness-105 active:scale-98 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSubmittingPhone
                  ? (lang === 'bn' ? 'আপডেট হচ্ছে...' : 'Updating...')
                  : (lang === 'bn' ? 'নম্বর পরিবর্তন সংরক্ষণ করুন' : 'Save New Phone Number')}
              </button>
            </form>
          )}

          {/* TAB 2: PASSWORD CHANGE */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-3.5">
              
              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">
                  {lang === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder={lang === 'bn' ? 'বর্তমান পাসওয়ার্ড লিখুন' : 'Enter current password'}
                    className="w-full bg-[#021310] border border-[#0d4a3e] focus:border-[#00f5cc] rounded-xl px-3 py-2.5 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <span>{lang === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}</span>
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={lang === 'bn' ? 'ন্যূনতম ৬ অক্ষরের নতুন পাসওয়ার্ড' : 'At least 6 characters'}
                    className="w-full bg-[#021310] border border-[#0d4a3e] focus:border-[#00f5cc] rounded-xl px-3 py-2.5 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <span>{lang === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}</span>
                  <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={lang === 'bn' ? 'নতুন পাসওয়ার্ড পুনরায় লিখুন' : 'Re-enter new password'}
                    className="w-full bg-[#021310] border border-[#0d4a3e] focus:border-[#00f5cc] rounded-xl px-3 py-2.5 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error / Success Feedback */}
              {passError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{passSuccess}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmittingPass}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-black font-black text-xs hover:brightness-105 active:scale-98 transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {isSubmittingPass
                  ? (lang === 'bn' ? 'আপডেট হচ্ছে...' : 'Updating...')
                  : (lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন সংরক্ষণ করুন' : 'Save New Password')}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
