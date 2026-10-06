import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../lib/api.ts';
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles,
  User,
  Mail
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
  onSuccess?: () => void;
  lang: 'en' | 'hi';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  reason,
  onSuccess,
  lang
}) => {
  const { login } = useAuth();

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.sendOtp({
        name: name.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined
      });

      if (res.success) {
        setDemoCode(res.demoOtp || null);
        setStep('otp');
        setResendCooldown(30);
        // Cooldown timer
        const timer = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setErrorMsg(res.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred while requesting OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setErrorMsg('Please enter the verification code.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.verifyOtp({
        phone: phone.replace(/\D/g, ''),
        otp: otp.trim(),
        name: name.trim(),
        email: email.trim() || undefined
      });

      if (res.success && res.user) {
        login(res.user);
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setErrorMsg(res.message || 'Invalid verification code. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-md bg-white text-[#1E2B24] shadow-2xl border-t-4 border-[#C08A3E] my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-[#1E2B24] text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif-luxury text-xl tracking-[0.2em] font-normal uppercase">
                EKAATRA
              </span>
              <span className="text-[10px] text-[#C08A3E] uppercase tracking-[0.3em] font-semibold border-l border-white/20 pl-2">
                Sign In
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1 font-light">
              Kukas, Jaipur · Mobile Verification
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close login modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Prompt Banner */}
        <div className="bg-[#EDE9DF] px-5 py-3 border-b border-[#C08A3E]/30 flex items-center gap-2 text-xs text-[#1E2B24]">
          <ShieldCheck className="w-4 h-4 text-[#C08A3E] shrink-0" />
          <span>{reason || 'Please log in to reserve your suite and access direct booking benefits.'}</span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-3 mx-5 mt-4 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-6">
          {/* STEP 1: Enter Name, Mobile Number, and Optional Email */}
          {step === 'details' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <h4 className="font-serif-luxury text-xl font-normal text-[#1E2B24] mb-1">
                  Customer Mobile Login
                </h4>
                <p className="text-xs text-gray-500 font-light">
                  Enter your details to receive an instant SMS verification code.
                </p>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#C08A3E]" />
                  <span>Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arun Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-300 bg-white font-medium focus:outline-none focus:border-[#C08A3E]"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-[#C08A3E]" />
                  <span>Mobile Number (10 Digits) *</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-xs bg-gray-100 border border-r-0 border-gray-300 text-gray-700 font-semibold">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98290XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 p-2.5 text-xs border border-gray-300 bg-white font-medium tracking-wider focus:outline-none focus:border-[#C08A3E]"
                  />
                </div>
              </div>

              {/* Email Address (Optional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs uppercase tracking-wider font-semibold text-gray-700 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#C08A3E]" />
                    <span>Email Address</span>
                  </label>
                  <span className="text-[10px] text-gray-400 font-normal uppercase tracking-wider">
                    Optional
                  </span>
                </div>
                <input
                  type="email"
                  placeholder="guest@example.com (Optional)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 text-xs border border-gray-300 bg-white focus:outline-none focus:border-[#C08A3E]"
                />
              </div>

              {/* Privacy Note */}
              <p className="text-[11px] text-[#3E5C4A] leading-relaxed pt-1">
                By continuing, you agree to receive reservation updates on your mobile number in compliance with Indian hospitality guidelines.
              </p>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C08A3E] hover:bg-[#a67431] text-[#1E2B24] font-bold py-3 text-xs uppercase tracking-[0.2em] transition-all shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                {loading ? (
                  <span>Sending Code...</span>
                ) : (
                  <>
                    <span>Get Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <h4 className="font-serif-luxury text-xl font-normal text-[#1E2B24] mb-1">
                  Verify Mobile OTP
                </h4>
                <p className="text-xs text-[#3E5C4A] font-light">
                  Code sent to <strong>+91 {phone.slice(-10)}</strong> for guest <strong>{name}</strong>.
                </p>
              </div>

              {/* Simulated SMS Notification Alert for Easy Testing */}
              {demoCode && (
                <div className="p-3 bg-[#EDE9DF] border border-[#C08A3E]/40 text-xs text-[#1E2B24] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#C08A3E] tracking-wider block">
                      Simulated SMS Alert
                    </span>
                    <span>Your Ekaatra login OTP is: <strong>{demoCode}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtp(demoCode)}
                    className="px-2.5 py-1 bg-[#C08A3E] hover:bg-[#a67431] text-[10px] font-bold uppercase tracking-wider text-[#1E2B24] cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* OTP Input */}
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-700 mb-1">
                  Enter 4-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full p-3 text-center text-lg font-mono font-bold tracking-[0.5em] border border-gray-300 bg-white focus:outline-none focus:border-[#C08A3E]"
                  autoFocus
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C08A3E] hover:bg-[#a67431] text-[#1E2B24] font-bold py-3 text-xs uppercase tracking-[0.2em] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>

              {/* Resend & Edit details */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setStep('details');
                    setOtp('');
                    setErrorMsg(null);
                  }}
                  className="text-gray-500 hover:text-gray-800 underline"
                >
                  Change Mobile / Name
                </button>

                {resendCooldown > 0 ? (
                  <span className="text-gray-400">Resend code in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-[#C08A3E] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
