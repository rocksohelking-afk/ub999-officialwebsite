import React, { useState } from 'react';
import { ChevronLeft, Phone, Lock, Eye, EyeOff, Check } from 'lucide-react';

interface RegisterPageProps {
  onBack: () => void;
  onGoToLogin: () => void;
  onSuccessRegister: (user: { name: string; phone: string; method: string }) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onBack,
  onGoToLogin,
  onSuccessRegister,
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);
  const [receiveOffers, setReceiveOffers] = useState<boolean>(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanedPhone = phoneNumber.trim().replace(/\s+/g, '');
    if (!cleanedPhone) {
      setErrorMsg('দয়া করে আপনার ফোন নম্বর লিখুন');
      return;
    }
    if (cleanedPhone.length < 10) {
      setErrorMsg('সঠিক মোবাইল নম্বর প্রদান করুন (যেমন: 01XXXXXXXXX)');
      return;
    }
    if (!password) {
      setErrorMsg('পাসওয়ার্ড প্রদান করুন');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('উভয় পাসওয়ার্ড একই হতে হবে');
      return;
    }
    if (!agreeTerms) {
      setErrorMsg('আপনাকে অবশ্যই ১৮+ হতে হবে এবং শর্তাবলী মানতে হবে');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      // Save registered user account with password to localStorage
      try {
        const storedUsers = localStorage.getItem('ub999_registered_users');
        const accounts = storedUsers ? JSON.parse(storedUsers) : {};
        accounts[cleanedPhone] = {
          phone: cleanedPhone,
          password: password,
          name: cleanedPhone,
          balance: accounts[cleanedPhone]?.balance || 0,
          registeredAt: new Date().toISOString(),
        };
        localStorage.setItem('ub999_registered_users', JSON.stringify(accounts));
        localStorage.setItem('ub999_last_registered_phone', cleanedPhone);
        localStorage.setItem('ub999_last_registered_password', password);
        localStorage.setItem('ub999_user_phone', cleanedPhone);
        localStorage.setItem('ub999_user_password', password);
      } catch (err) {
        console.error(err);
      }

      onSuccessRegister({
        name: `User_${cleanedPhone.slice(-4)}`,
        phone: cleanedPhone,
        method: 'phone'
      });
    }, 600);
  };

  const handleSocialRegister = (provider: 'facebook' | 'google') => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const socialName = provider === 'google' ? 'Google Player' : 'Facebook Player';
      const fakePhone = `017${Math.floor(10000000 + Math.random() * 90000000)}`;
      onSuccessRegister({
        name: socialName,
        phone: fakePhone,
        method: provider
      });
    }, 700);
  };

  return (
    <div className="min-h-screen w-full bg-[#012b23] flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Clean Background with subtle gradient matching screenshot */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#012b23]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#034436_0%,#012b23_70%)]" />
      </div>

      {/* Top Section */}
      <div className="relative z-10 px-5 pt-4 pb-2">
        {/* Back Arrow */}
        <button 
          onClick={onBack}
          className="p-1 -ml-1 text-[#ffd000] hover:scale-110 active:scale-95 transition-transform inline-flex items-center justify-center cursor-pointer"
          title="Back"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
        </button>

        {/* Brand Logo in Center */}
        <div className="flex items-center justify-center -mt-2">
          <div className="flex items-center gap-2 text-2xl font-black tracking-tight select-none">
            <img src="/ub999_logo.svg" alt="UB999" className="w-8 h-8 rounded-lg shadow-sm shrink-0 object-contain" />
            <div className="flex items-center">
              <span className="text-[#59e236] drop-shadow-[0_0_10px_rgba(89,226,54,0.4)]">UB999</span>
              <span className="text-white/60 mx-1 font-light text-xl">|</span>
              <span className="text-white">win</span>
              <span className="text-[#59e236]">ub</span>
            </div>
          </div>
        </div>

        {/* Title: Register */}
        <div className="text-center mt-6">
          <h1 className="text-[#ffd000] font-black text-2xl tracking-wide">
            Register
          </h1>
          <p className="text-xs text-white/90 mt-1.5">
            Already have an account?{' '}
            <button 
              type="button"
              onClick={onGoToLogin}
              className="text-[#00f5cc] font-bold hover:underline ml-0.5 cursor-pointer"
            >
              Login
            </button>
          </p>
        </div>
      </div>

      {/* Center Form Section */}
      <div className="relative z-10 px-6 py-2 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        
        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs text-center font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* 1. Phone number field */}
          <div className="relative">
            <div className="w-full bg-[#002f27] border border-[#00f5cc] rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-sm transition-all focus-within:ring-1 focus-within:ring-[#00f5cc]">
              <Phone className="w-4 h-4 text-[#ffd000] shrink-0" />
              <span className="text-[#00f5cc] font-mono text-sm select-none">|</span>
              <input
                type="tel"
                placeholder="Phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full bg-transparent text-[#00f5cc] placeholder-[#00f5cc]/75 text-sm font-medium focus:outline-hidden"
              />
            </div>
          </div>

          {/* 2. Password field */}
          <div className="relative">
            <div className="w-full bg-[#002f27] border border-[#00f5cc] rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm transition-all focus-within:ring-1 focus-within:ring-[#00f5cc]">
              <div className="flex items-center gap-2.5 w-full">
                <Lock className="w-4 h-4 text-[#00f5cc] shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent text-[#00f5cc] placeholder-[#00f5cc]/75 text-sm font-medium focus:outline-hidden"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-0.5 text-[#00f5cc] hover:text-white shrink-0 ml-2 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 3. Confirm password field */}
          <div className="relative">
            <div className="w-full bg-[#002f27] border border-[#00f5cc] rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm transition-all focus-within:ring-1 focus-within:ring-[#00f5cc]">
              <div className="flex items-center gap-2.5 w-full">
                <Lock className="w-4 h-4 text-[#00f5cc] shrink-0" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-transparent text-[#00f5cc] placeholder-[#00f5cc]/75 text-sm font-medium focus:outline-hidden"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-0.5 text-[#00f5cc] hover:text-white shrink-0 ml-2 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Checkbox 1: 18+ and Terms */}
          <div 
            onClick={() => setAgreeTerms(!agreeTerms)}
            className="flex items-start gap-2.5 pt-1 cursor-pointer select-none"
          >
            <div className="mt-0.5 shrink-0">
              {agreeTerms ? (
                <div className="w-5 h-5 rounded-full bg-[#ffd000] text-black flex items-center justify-center shadow">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-[#00f5cc] bg-transparent" />
              )}
            </div>
            <p className="text-[11px] text-white/95 leading-tight">
              I am over 18 years of age and have read and accepted Terms &amp; Conditions, Privacy Policy &amp; Betting Rules as published on the site.
            </p>
          </div>

          {/* Checkbox 2: Offers & Free bets */}
          <div 
            onClick={() => setReceiveOffers(!receiveOffers)}
            className="flex items-start gap-2.5 pt-0.5 cursor-pointer select-none"
          >
            <div className="mt-0.5 shrink-0">
              {receiveOffers ? (
                <div className="w-5 h-5 rounded-full bg-[#ffd000] text-black flex items-center justify-center shadow">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border border-[#00f5cc] bg-transparent" />
              )}
            </div>
            <p className="text-[11px] text-white/95 leading-tight">
              I would like to receive details of special offers, free bets and other promotions.
            </p>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-[#ffd000] hover:bg-yellow-400 active:scale-[0.98] text-[#854d0e] font-black text-base shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center tracking-wide disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>

        </form>

        {/* Social Registration Icons: Facebook & Google */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => handleSocialRegister('facebook')}
            className="w-12 h-12 rounded-full bg-[#3b5998] hover:bg-[#2d4373] text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-600/30 active:scale-95 transition-transform cursor-pointer"
            title="Register with Facebook"
          >
            f
          </button>

          <button
            type="button"
            onClick={() => handleSocialRegister('google')}
            className="w-12 h-12 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center shadow-lg shadow-white/20 active:scale-95 transition-transform p-2.5 cursor-pointer"
            title="Register with Google"
          >
            <svg viewBox="0 0 24 24" className="w-full h-full">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          </button>
        </div>

      </div>

      <div className="pb-6" />

    </div>
  );
};
