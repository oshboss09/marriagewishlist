import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Copy, 
  Check, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  Smartphone, 
  Sparkles 
} from 'lucide-react';
import { RegistryItem, Wedding, GuestProfile } from '../types';
import { formatINR, buildUpiDeepLink, generateUpiQrCode, copyToClipboard } from '../utils/upi';

interface GroupGiftModalProps {
  item: RegistryItem | null;
  wedding: Wedding;
  currentGuest: GuestProfile;
  isOpen: boolean;
  onClose: () => void;
  onContribute: (
    itemId: string,
    guestName: string,
    guestPhone: string,
    amount: number,
    utr?: string
  ) => void;
}

const PRESET_AMOUNTS = [1100, 2100, 5001, 10000];

export const GroupGiftModal: React.FC<GroupGiftModalProps> = ({
  item,
  wedding,
  currentGuest,
  isOpen,
  onClose,
  onContribute,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(2100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [guestName, setGuestName] = useState(currentGuest.name);
  const [guestPhone, setGuestPhone] = useState(currentGuest.phone);
  const [utrNumber, setUtrNumber] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [hasPaidStep, setHasPaidStep] = useState(false);

  useEffect(() => {
    if (currentGuest.name) setGuestName(currentGuest.name);
    if (currentGuest.phone) setGuestPhone(currentGuest.phone);
  }, [currentGuest]);

  const activeAmount = isCustom ? Number(customAmount) || 0 : selectedAmount;

  useEffect(() => {
    if (!item || !wedding) return;
    const note = `Gift fund - ${item.title.substring(0, 20)}`;
    const upiLink = buildUpiDeepLink({
      upiId: wedding.upiId,
      payeeName: wedding.upiPayeeName,
      amount: activeAmount > 0 ? activeAmount : undefined,
      transactionNote: note,
    });

    generateUpiQrCode(upiLink).then((url) => {
      setQrCodeDataUrl(url);
    });
  }, [item, wedding, activeAmount]);

  if (!isOpen || !item) return null;

  const goal = item.groupGoalAmount || item.price;
  const remaining = Math.max(0, goal - item.groupRaisedAmount);
  const progressPercent = Math.min(100, Math.round((item.groupRaisedAmount / goal) * 100));

  const handleCopyUpi = async () => {
    const success = await copyToClipboard(wedding.upiId);
    if (success) {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleCompleteContribution = () => {
    if (!guestName.trim() || activeAmount <= 0) return;

    onContribute(
      item.id,
      guestName.trim(),
      guestPhone.trim(),
      activeAmount,
      utrNumber.trim() || undefined
    );

    onClose();
  };

  const mobileUpiLink = buildUpiDeepLink({
    upiId: wedding.upiId,
    payeeName: wedding.upiPayeeName,
    amount: activeAmount > 0 ? activeAmount : undefined,
    transactionNote: `Gift fund for ${item.title.substring(0, 25)}`,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl bg-[#FCFAF6] rounded-3xl shadow-2xl border border-[#E6DCCD] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury Wine Header */}
        <div className="px-7 py-5 bg-[#4A1521] text-[#FAF7F2] flex items-center justify-between border-b border-[#9C7A4E]/30">
          <div>
            <h3 className="font-serif text-xl font-normal tracking-wide">Contribute to Group Gift</h3>
            <p className="text-xs text-[#D8C7B5] font-light">Direct to couple's bank via UPI • Zero deductions</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#D8C7B5] hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-5 text-[#3E342F]">
          {/* Item details & progress */}
          <div className="p-4 bg-[#F8F4EE] rounded-2xl border border-[#E6DCCD] space-y-3">
            <div className="flex items-start gap-3">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-16 h-16 object-cover rounded-xl border border-[#D5C7B5] shrink-0 bg-white"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-serif text-base font-normal text-[#2C2420] line-clamp-1">
                  {item.title}
                </h4>
                <p className="text-xs text-[#7A6D63] font-serif">
                  Total Goal: <strong className="text-[#2C2420]">{formatINR(goal)}</strong>
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="font-medium text-[#4A1521]">{formatINR(item.groupRaisedAmount)} contributed</span>
                  <span className="text-[#D5C7B5]">•</span>
                  <span className="text-[#7A6D63]">{formatINR(remaining)} to go</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="w-full h-1.5 bg-[#EFE8DD] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#4A1521] rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-1 text-[11px] text-[#8A7B70]">
                <span>{item.contributions.length} friends joined</span>
                <span className="font-medium text-[#4A1521]">{progressPercent}% Funded</span>
              </div>
            </div>
          </div>

          {!hasPaidStep ? (
            <div className="space-y-4">
              {/* Presets */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-[#9C7A4E] mb-2">
                  Select Contribution Amount:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setIsCustom(false);
                      }}
                      className={`py-2 px-1 text-xs font-serif font-medium rounded-xl border transition-all ${
                        !isCustom && selectedAmount === amt
                          ? 'bg-[#4A1521] text-[#FAF7F2] border-[#4A1521] shadow-xs'
                          : 'bg-white hover:bg-[#F8F4EE] border-[#E0D5C7] text-[#4A3E38]'
                      }`}
                    >
                      {formatINR(amt)}
                    </button>
                  ))}
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustom(true)}
                    className={`text-xs px-2.5 py-1.5 rounded-xl font-medium border ${
                      isCustom ? 'bg-[#F3EDE4] border-[#9C7A4E] text-[#4A1521]' : 'bg-white border-[#E0D5C7] text-[#6B5E55]'
                    }`}
                  >
                    Custom ₹
                  </button>
                  {isCustom && (
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2 text-xs text-[#9C7A4E] font-serif">₹</span>
                      <input
                        type="number"
                        min="100"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full pl-6 pr-3 py-1.5 bg-white border border-[#D5C7B5] rounded-xl text-xs font-serif focus:outline-none focus:ring-1 focus:ring-[#9C7A4E]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* QR Box */}
              <div className="p-4 bg-[#F8F4EE] border border-[#E6DCCD] rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="p-2.5 bg-white rounded-2xl border border-[#D5C7B5] shadow-xs shrink-0 text-center">
                    {qrCodeDataUrl ? (
                      <img 
                        src={qrCodeDataUrl} 
                        alt="Scan UPI QR" 
                        className="w-32 h-32 mx-auto rounded-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 flex items-center justify-center text-xs text-[#8A7B70]">
                        Generating QR...
                      </div>
                    )}
                    <span className="text-[10px] text-[#8A7B70] block mt-1">
                      Scan with any UPI App
                    </span>
                  </div>

                  <div className="space-y-2 text-xs flex-1">
                    <div className="p-2.5 bg-white rounded-xl border border-[#D5C7B5]">
                      <span className="text-[10px] text-[#8A7B70] uppercase block font-medium">Payee UPI ID</span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-mono text-[#2C2420] text-xs">
                          {wedding.upiId}
                        </span>
                        <button
                          onClick={handleCopyUpi}
                          className="text-[11px] text-[#7A1F2D] hover:underline font-medium flex items-center gap-1"
                        >
                          {copiedUpi ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                          {copiedUpi ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <a
                      href={mobileUpiLink}
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-[#4A1521] hover:bg-[#381019] text-[#FAF7F2] rounded-xl font-medium text-xs transition-colors shadow-xs"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      Pay {formatINR(activeAmount)} on UPI App
                    </a>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setHasPaidStep(true)}
                disabled={activeAmount <= 0}
                className="w-full py-3 px-4 bg-[#4A1521] hover:bg-[#381019] disabled:opacity-50 text-[#FAF7F2] font-semibold tracking-wider uppercase text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>I've Transferred the Money</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 bg-[#F3EDE4] border border-[#DDD2C4] rounded-2xl text-xs text-[#4A1521]">
                Thank you! Please share your details so Oyeshi & Nishant know who sent this <strong>{formatINR(activeAmount)}</strong> contribution.
              </div>

              <div className="space-y-3 bg-[#F8F4EE] p-4 rounded-2xl border border-[#E6DCCD]">
                <div>
                  <label className="block text-xs font-medium text-[#4A3E38] mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Priya"
                    className="w-full px-3 py-1.5 bg-white border border-[#D5C7B5] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#9C7A4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A3E38] mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="e.g. +91 98200 54321"
                    className="w-full px-3 py-1.5 bg-white border border-[#D5C7B5] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#9C7A4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A3E38] mb-1">
                    UPI Reference / UTR (Optional)
                  </label>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 402819283019"
                    className="w-full px-3 py-1.5 bg-white border border-[#D5C7B5] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#9C7A4E]"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setHasPaidStep(false)}
                  className="w-1/3 py-2.5 px-3 bg-[#EFE8DD] hover:bg-[#E5DCCF] text-[#4A3E38] text-xs font-medium rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCompleteContribution}
                  disabled={!guestName.trim()}
                  className="w-2/3 py-2.5 px-4 bg-[#4A1521] hover:bg-[#381019] disabled:opacity-50 text-[#FAF7F2] font-semibold tracking-wider uppercase text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                  Confirm Contribution
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-3.5 bg-[#FAF7F2] border-t border-[#E6DCCD] flex items-center justify-between text-xs text-[#7A6D63]">
          <span>Direct couple settlement • RBI compliant</span>
          <button
            onClick={onClose}
            className="text-[#6B5E55] hover:text-[#2C2420]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
