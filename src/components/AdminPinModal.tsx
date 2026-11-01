import React, { useState } from 'react';
import { Lock, KeyRound, AlertCircle, Check, X, ShieldCheck } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPin: string;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPin,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === currentPin || pin === '2026') {
      setError(false);
      onSuccess();
      onClose();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm bg-[#FCFAF6] border border-[#D5C7B5] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#8A7B70] hover:text-[#2C2420] rounded-full hover:bg-[#EFE8DD] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Monogram / Lock Icon */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#4A1521] text-[#F5EFEB] flex items-center justify-center shadow-xs border border-[#9C7A4E]/40">
            <Lock className="w-5 h-5 text-[#C5A880]" />
          </div>
          <div className="text-[10px] font-medium tracking-[0.2em] text-[#9C7A4E] uppercase">
            Couple Access
          </div>
          <h3 className="font-serif text-xl font-normal text-[#2C2420]">
            Couple Admin Portal
          </h3>
          <p className="text-xs text-[#6B5E55] leading-relaxed font-light">
            Enter the 4-digit passcode for <strong>Oyeshi & Nishant</strong> to manage registry gifts, addresses, and received funds.
          </p>
        </div>

        {/* PIN Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#9C7A4E] absolute left-3.5 top-3" />
              <input
                type="password"
                maxLength={6}
                autoFocus
                value={pin}
                onChange={(e) => {
                  setError(false);
                  setPin(e.target.value);
                }}
                placeholder="Enter 4-digit PIN"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D5C7B5] rounded-xl text-center text-base tracking-[0.3em] font-mono text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#4A1521]/20 focus:border-[#4A1521]"
              />
            </div>
            {error && (
              <p className="text-rose-700 text-xs mt-2 flex items-center justify-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Incorrect passcode. Default PIN is <strong>2026</strong>.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-[#4A1521] hover:bg-[#3A101A] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 text-[#D8C7B5]" />
            <span>Unlock Dashboard</span>
          </button>
        </form>

        {/* Helpful Tip */}
        <div className="p-3 bg-[#F3EDE4] border border-[#E0D5C7] rounded-xl text-[11px] text-[#5A4D45] flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-[#7A1F2D] shrink-0 mt-0.5" />
          <span>
            Default admin PIN is <strong>2026</strong>. You can change this anytime inside Couple Dashboard Settings.
          </span>
        </div>
      </div>
    </div>
  );
};
