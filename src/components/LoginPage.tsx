import React, { useState } from 'react';
import { ChevronLeft, Phone, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginPageProps {
  onBack: () => void;
  onGoToRegister: () => void;
  onSuccessLogin: (user: { name: string; phone: string; balance?: number }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onBack,
  onGoToRegister,
  onSuccessLogin,
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showErrorModal, setShowErrorModal] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanedPhone = phoneNumber.trim().replace(/\s+/g, '');
    if (!cleanedPhone) {
      setErrorMsg('দয়া করে ফোন নম্বর লিখুন');
      return;
    }
    if (!password) {
      setErrorMsg('পাসওয়ার্ড লিখুন');
      return;
    }

    // Helper to normalize phone numbers for robust matching (017... vs +88017... etc.)
    const normalizePhone = (num: string) => {
      let cleaned = num.trim().replace(/[\s\-\+\(\)]/g, '');
      if (cleaned.startsWith('880')) {
        cleaned = '0' + cleaned.slice(3);
      } else if (cleaned.startsWith('88')) {
        cleaned = cleaned.slice(2);
      }
      return cleaned;
    };

    const normInput = normalizePhone(cleanedPhone);

    // Retrieve registered users from localStorage
    let registeredAccounts: Record<string, { phone: string; password: string; name?: string; balance?: number }> = {};
    try {
      const stored = localStorage.getItem('ub999_registered_users');
      if (stored) {
        registeredAccounts = JSON.parse(stored);
      }
    } catch (err) {
      console.error(err);
    }

    // 1. Direct match or normalized match in registeredAccounts
    let targetAccount = registeredAccounts[cleanedPhone];
    if (!targetAccount) {
      for (const key of Object.keys(registeredAccounts)) {
        if (key === cleanedPhone || normalizePhone(key) === normInput) {
          targetAccount = registeredAccounts[key];
          break;
        }
      }
    }

    // 2. Check last registered credentials
    if (!targetAccount) {
      const lastPhone = localStorage.getItem('ub999_last_registered_phone');
      const lastPass = localStorage.getItem('ub999_last_registered_password');
      if (lastPhone && (lastPhone === cleanedPhone || normalizePhone(lastPhone) === normInput)) {
        targetAccount = {
          phone: lastPhone,
          password: lastPass || '',
          name: lastPhone,
          balance: 0,
        };
      }
    }

    // 3. Check current user in localStorage (ub999_user_phone and ub999_user_password)
    if (!targetAccount) {
      const savedUserPhone = localStorage.getItem('ub999_user_phone');
      const savedUserPass = localStorage.getItem('ub999_user_password');
      if (savedUserPhone && (savedUserPhone === cleanedPhone || normalizePhone(savedUserPhone) === normInput)) {
        targetAccount = {
          phone: savedUserPhone,
          password: savedUserPass || '123456',
          name: localStorage.getItem('ub999_user_name') || savedUserPhone,
          balance: parseFloat(localStorage.getItem('ub999_balance') || '0') || 0,
        };
      }
    }

    // Check if account exists
    if (!targetAccount) {
      setShowErrorModal(true);
      return;
    }

    // Account found - verify password!
    if (targetAccount.password !== password) {
      setShowErrorModal(true);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSuccessLogin({
        name: targetAccount.name || `User_${cleanedPhone.slice(-4)}`,
        phone: targetAccount.phone || cleanedPhone,
        balance: targetAccount.balance,
      });
    }, 500);
  };

  const handleSocialLogin = (provider: 'facebook' | 'google') => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const socialName = provider === 'google' ? 'Google Player' : 'Facebook Player';
      const fakePhone = `017${Math.floor(10000000 + Math.random() * 90000000)}`;
      onSuccessLogin({
        name: socialName,
        phone: fakePhone,
      });
    }, 700);
  };

  return (
    <div className="min-h-screen w-full bg-[#012b23] flex flex-col justify-between relative overflow-hidden select-none">
      
      {/* Clean Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[#012b23]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#034436_0%,#012b23_70%)]" />
      </div>

      {/* Top Header */}
      <div className="relative z-10 px-5 pt-4 pb-2">
        <button 
          onClick={onBack}
          className="p-1 -ml-1 text-[#ffd000] hover:scale-110 active:scale-95 transition-transform inline-flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
        </button>

        <div className="flex items-center justify-center -mt-2">
          <div className="flex items-center gap-2 text-2xl font-black tracking-tight select-none">
            <img src="/ub999_logo.svg" alt="UB999" className="w-8 h-8 rounded-lg shadow-sm shrink-0 object-contain" />
            <div className="flex items-center">
              <span className="text-[#59e236]">UB999</span>
              <span className="text-white/60 mx-1 font-light text-xl">|</span>
              <span className="text-white">win</span>
              <span className="text-[#59e236]">ub</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <h1 className="text-[#ffd000] font-black text-2xl tracking-wide">
            Login
          </h1>
          <p className="text-xs text-white/90 mt-1.5">
            Don&apos;t have an account?{' '}
            <button 
              type="button"
              onClick={onGoToRegister}
              className="text-[#00f5cc] font-bold hover:underline ml-0.5 cursor-pointer"
            >
              Register
            </button>
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="relative z-10 px-6 py-2 flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs text-center font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="w-full bg-[#002f27] border border-[#00f5cc] rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-sm">
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

          <div className="w-full bg-[#002f27] border border-[#00f5cc] rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-[#ffd000] hover:bg-yellow-400 active:scale-[0.98] text-[#854d0e] font-black text-base shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center tracking-wide disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => handleSocialLogin('facebook')}
            className="w-12 h-12 rounded-full bg-[#3b5998] hover:bg-[#2d4373] text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-blue-600/30 active:scale-95 transition-transform cursor-pointer"
          >
            f
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="w-12 h-12 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center shadow-lg p-2.5 active:scale-95 transition-transform cursor-pointer"
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

      {/* Confirmation Modal exactly matching Screenshot_20261011-002858.jpg */}
      {showErrorModal && (
        <div 
          onClick={() => setShowErrorModal(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[1px] flex items-center justify-center p-6 select-none animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[340px] bg-white rounded-md px-6 pt-6 pb-4 shadow-2xl text-left animate-in zoom-in-95 duration-150"
          >
            {/* Title */}
            <h3 className="text-[20px] font-semibold text-slate-900 tracking-tight mb-3">
              Confirmation
            </h3>

            {/* Body */}
            <p className="text-[13.5px] leading-[1.48] text-[#1f2937] font-normal">
              Unable to log in. Please verify that your username and password are correct, or use the &quot;Forgot Password&quot; option to reset your password. If the issue persists, it may be related to your account status. Please contact Customer Support for assistance. (#674-6uk39)
            </p>

            {/* Bottom Action */}
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowErrorModal(false)}
                className="text-[14.5px] font-medium text-[#2196f3] hover:text-[#1976d2] active:opacity-70 px-2 py-1 transition-colors cursor-pointer tracking-wide"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
