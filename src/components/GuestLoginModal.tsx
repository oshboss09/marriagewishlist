import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  ArrowRight, 
  User, 
  Check 
} from 'lucide-react';
import { GuestProfile } from '../types';

interface GuestLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (guest: GuestProfile) => void;
  currentGuest: GuestProfile;
}

const DEMO_GUESTS: GuestProfile[] = [
  { name: 'Priya Mehta', phone: '+91 98200 54321', isLoggedIn: true },
  { name: 'Rohan (Jio Team)', phone: '+91 98765 43210', isLoggedIn: true },
  { name: 'Tanvi & Ankit', phone: '+91 99112 38491', isLoggedIn: true },
  { name: 'Sunita Aunty', phone: '+91 97112 23344', isLoggedIn: true },
];

export const GuestLoginModal: React.FC<GuestLoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  currentGuest,
}) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState(currentGuest.phone || '');
  const [name, setName] = useState(currentGuest.name || '');
  const [otp, setOtp] = useState('7492');

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      name: name.trim(),
      phone: phone.trim(),
      isLoggedIn: true,
    });
    onClose();
  };

  const handleSelectDemo = (demo: GuestProfile) => {
    onLogin(demo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-[#FCFAF6] rounded-3xl shadow-2xl border border-[#E6DCCD] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury Wine Header */}
        <div className="px-7 py-5 bg-[#4A1521] text-[#FAF7F2] flex items-center justify-between border-b border-[#9C7A4E]/30">
          <div>
            <h3 className="font-serif text-xl font-normal tracking-wide">Guest Sign-In</h3>
            <p className="text-xs text-[#D8C7B5] font-light">Oyeshi & Nishant's Wedding</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#D8C7B5] hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7 space-y-5 text-[#3E342F] text-xs">
          {/* Quick Demo Personas */}
          <div className="p-3.5 bg-[#F8F4EE] border border-[#E6DCCD] rounded-2xl space-y-2">
            <span className="font-medium uppercase tracking-[0.15em] text-[10px] text-[#9C7A4E] block">
              1-Click Demo Guest Switcher:
            </span>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_GUESTS.map((demo) => (
                <button
                  key={demo.name}
                  onClick={() => handleSelectDemo(demo)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    currentGuest.name === demo.name
                      ? 'bg-[#4A1521] text-[#FAF7F2] border-[#4A1521] shadow-xs'
                      : 'bg-white hover:bg-[#F3EDE4] border-[#E0D5C7] text-[#4A3E38]'
                  }`}
                >
                  <p className="font-serif font-medium text-xs truncate">{demo.name}</p>
                  <p className={`text-[10px] truncate ${currentGuest.name === demo.name ? 'text-[#D8C7B5]' : 'text-[#8A7B70]'}`}>
                    {demo.phone}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <hr className="w-full border-[#E6DCCD]" />
            <span className="absolute px-3 bg-[#FCFAF6] text-[11px] text-[#8A7B70] font-light">
              or enter your mobile
            </span>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#4A3E38] mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya"
                  className="w-full px-3 py-1.5 bg-white border border-[#D5C7B5] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#9C7A4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A3E38] mb-1">Mobile Phone *</label>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 bg-[#F3EDE4] border border-[#D5C7B5] rounded-xl text-xs font-mono text-[#4A1521]">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    value={phone.replace('+91', '').trim()}
                    onChange={(e) => setPhone('+91 ' + e.target.value.replace(/\D/g, ''))}
                    placeholder="98200 54321"
                    className="flex-1 px-3 py-1.5 bg-white border border-[#D5C7B5] rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#9C7A4E]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#4A1521] hover:bg-[#381019] text-[#FAF7F2] font-semibold tracking-wider uppercase text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Send Code</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in">
              <div className="p-3 bg-[#F3EDE4] border border-[#DDD2C4] text-[#4A1521] rounded-xl text-xs">
                Demo code <strong className="font-mono text-[#4A1521]">7492</strong> sent to {phone}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#4A3E38] mb-1">Enter Code</label>
                <input
                  type="text"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D5C7B5] rounded-xl text-center text-lg font-mono font-bold tracking-widest focus:outline-none focus:ring-1 focus:ring-[#9C7A4E]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-1/3 py-2 px-3 bg-[#EFE8DD] hover:bg-[#E5DCCF] text-[#4A3E38] rounded-xl text-xs font-medium"
                >
                  Edit
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2 px-4 bg-[#4A1521] hover:bg-[#381019] text-[#FAF7F2] font-semibold tracking-wider uppercase text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Enter
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 flex items-center gap-1.5 text-[11px] text-[#8A7B70]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#9C7A4E] shrink-0" />
            <span>Lightweight sign-in protects couple's delivery address privacy.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
