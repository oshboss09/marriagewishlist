import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Copy, 
  Check, 
  Smartphone, 
  ShieldCheck, 
  AlertTriangle, 
  X, 
  Eye, 
  EyeOff, 
  Lock, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Wedding, GuestProfile, ShagunGift } from '../types';
import { formatINR, buildUpiDeepLink, generateUpiQrCode, copyToClipboard } from '../utils/upi';
import confetti from 'canvas-confetti';

interface ShagunModalProps {
  wedding: Wedding;
  currentGuest: GuestProfile;
  isOpen: boolean;
  onClose: () => void;
  onSendShagun: (gift: Omit<ShagunGift, 'id' | 'createdAt' | 'confirmedByCouple' | 'thankYouSent'>) => void;
}

const AUSPICIOUS_PRESETS = [501, 1101, 2101, 5001, 11001, 21001];

const BLESSING_PRESETS = [
  'Wishing both of you a peaceful, joyful, and deeply fulfilling life together.',
  'So happy for Oyeshi & Nishant! May your companionship grow warmer with every passing day.',
  'Heartiest congratulations! May your home always be filled with laughter, love, and contentment.',
  'Wishing you both endless wonderful adventures, quiet mornings, and a beautiful marriage.',
];

export const ShagunModal: React.FC<ShagunModalProps> = ({
  wedding,
  currentGuest,
  isOpen,
  onClose,
  onSendShagun,
}) => {
  const [amount, setAmount] = useState<number>(2101);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [addShagunCoin, setAddShagunCoin] = useState(false);
  const [message, setMessage] = useState(BLESSING_PRESETS[0]);
  const [visibility, setVisibility] = useState<'public' | 'anonymous_to_guests' | 'private'>('public');
  const [guestName, setGuestName] = useState(currentGuest.name);
  const [guestPhone, setGuestPhone] = useState(currentGuest.phone);
  const [utrNumber, setUtrNumber] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [activeStep, setActiveStep] = useState<'details' | 'payment'>('details');

  useEffect(() => {
    if (currentGuest.name) setGuestName(currentGuest.name);
    if (currentGuest.phone) setGuestPhone(currentGuest.phone);
  }, [currentGuest]);

  const rawAmount = isCustom ? Number(customAmount) || 0 : amount;
  const finalAmount = rawAmount + (addShagunCoin && rawAmount % 10 === 0 ? 1 : 0);

  useEffect(() => {
    if (!wedding || !isOpen) return;

    const upiLink = buildUpiDeepLink({
      upiId: wedding.upiId,
      payeeName: wedding.upiPayeeName,
      amount: finalAmount > 0 ? finalAmount : undefined,
      transactionNote: `Shagun - ${guestName || 'Guest'}`,
    });

    generateUpiQrCode(upiLink).then((url) => {
      setQrCodeDataUrl(url);
    });
  }, [wedding, finalAmount, guestName, isOpen]);

  if (!isOpen) return null;

  const handleCopyUpi = async () => {
    const success = await copyToClipboard(wedding.upiId);
    if (success) {
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handleConfirmSent = () => {
    if (!guestName.trim() || finalAmount <= 0) return;

    onSendShagun({
      weddingId: wedding.id,
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      amount: finalAmount,
      message: message.trim(),
      visibility,
      utr: utrNumber.trim() || undefined,
    });

    try {
      confetti({
        particleCount: 50,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#4A1521', '#9C7A4E', '#C5A880', '#F5EFEB'],
      });
    } catch (e) {
      // ignore
    }

    onClose();
  };

  const mobileUpiLink = buildUpiDeepLink({
    upiId: wedding.upiId,
    payeeName: wedding.upiPayeeName,
    amount: finalAmount > 0 ? finalAmount : undefined,
    transactionNote: `Shagun from ${guestName || 'Guest'}`,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#FCFAF6] rounded-3xl shadow-2xl border border-[#E6DCCD] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury Wine Velvet Envelope Header */}
        <div className="px-7 py-5 bg-[#4A1521] text-[#FAF7F2] border-b border-[#9C7A4E]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#581927] border border-[#9C7A4E]/40 flex items-center justify-center text-[#C5A880]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-normal tracking-wide text-[#FAF7F2]">
                Offer Shagun Blessing
              </h3>
              <p className="text-xs text-[#D8C7B5] font-light">Direct to couple's bank via UPI • Zero deductions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#D8C7B5] hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-5 text-[#3E342F]">
          {activeStep === 'details' ? (
            <div className="space-y-4">
              {/* Shagun Presets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#9C7A4E]">
                    Auspicious Shagun
                  </label>
                  <span className="text-[11px] text-[#7A6D63] font-light">Includes lucky ₹1 shagun coin</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {AUSPICIOUS_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setAmount(preset);
                        setIsCustom(false);
                      }}
                      className={`py-2.5 px-2 text-xs font-serif font-medium rounded-xl border transition-all ${
                        !isCustom && amount === preset
                          ? 'bg-[#4A1521] text-[#FAF7F2] border-[#4A1521] shadow-xs'
                          : 'bg-white hover:bg-[#F8F4EE] border-[#E0D5C7] text-[#2C2420]'
                      }`}
                    >
                      {formatINR(preset)}
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCustom(true)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium border ${
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
                        min="51"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full pl-6 pr-3 py-1.5 bg-white border border-[#D5C7B5] rounded-xl text-xs font-serif focus:outline-none focus:ring-1 focus:ring-[#9C7A4E]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Guest Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F8F4EE] p-3.5 rounded-2xl border border-[#E6DCCD]">
                <div>
                  <label className="block text-xs font-medium text-[#4A3E38] mb-1">Your Name *</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Priya"
                    className="w-full px-3 py-1.5 bg-white border border-[#D5C7B5] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#9C7A4E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4A3E38] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="e.g. +91 98200 54321"
                    className="w-full px-3 py-1.5 bg-white border border-[#D5C7B5] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#9C7A4E]"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-[#9C7A4E] mb-1.5">
                  Blessing for Oyeshi & Nishant
                </label>
                <textarea
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share a heartfelt note..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D5C7B5] rounded-2xl text-xs font-editorial text-base focus:outline-none focus:ring-1 focus:ring-[#9C7A4E] text-[#2C2420]"
                />

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {BLESSING_PRESETS.map((quote, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMessage(quote)}
                      className="text-[11px] px-2.5 py-1 bg-white hover:bg-[#F3EDE4] text-[#5A4D45] border border-[#E6DCCD] rounded-lg transition-colors truncate max-w-full text-left"
                    >
                      "{quote.slice(0, 36)}..."
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy Setting */}
              <div className="space-y-2">
                <label className="block text-[11px] font-medium uppercase tracking-[0.15em] text-[#9C7A4E]">
                  Display Preference
                </label>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setVisibility('public')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      visibility === 'public'
                        ? 'bg-[#F3EDE4] border-[#9C7A4E] text-[#4A1521] font-medium'
                        : 'bg-white border-[#E6DCCD] text-[#6B5E55]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Eye className="w-3.5 h-3.5 text-[#7A1F2D]" />
                      <span className="text-xs">Public</span>
                    </div>
                    <span className="text-[10px] text-[#8A7B70] block leading-tight">
                      Name on wall
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibility('anonymous_to_guests')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      visibility === 'anonymous_to_guests'
                        ? 'bg-[#F3EDE4] border-[#9C7A4E] text-[#4A1521] font-medium'
                        : 'bg-white border-[#E6DCCD] text-[#6B5E55]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <EyeOff className="w-3.5 h-3.5 text-[#7A1F2D]" />
                      <span className="text-xs">Anonymous</span>
                    </div>
                    <span className="text-[10px] text-[#8A7B70] block leading-tight">
                      "A Well-Wisher"
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisibility('private')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      visibility === 'private'
                        ? 'bg-[#F3EDE4] border-[#9C7A4E] text-[#4A1521] font-medium'
                        : 'bg-white border-[#E6DCCD] text-[#6B5E55]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Lock className="w-3.5 h-3.5 text-[#7A1F2D]" />
                      <span className="text-xs">Couple Only</span>
                    </div>
                    <span className="text-[10px] text-[#8A7B70] block leading-tight">
                      Hidden from wall
                    </span>
                  </button>
                </div>

                <div className="p-3 bg-[#F8F4EE] border border-[#E6DCCD] rounded-2xl flex items-start gap-2.5 text-[11px] text-[#6B5E55] leading-relaxed">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#9C7A4E] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#4A1521]">Note on Anonymous Gifting:</span> While your name is hidden from guests on the site, your legal account name will still appear on the couple's private bank statement via UPI.
                  </div>
                </div>
              </div>

              {/* Continue to Pay */}
              <button
                type="button"
                onClick={() => setActiveStep('payment')}
                disabled={!guestName.trim() || finalAmount <= 0}
                className="w-full py-3 px-4 bg-[#4A1521] hover:bg-[#381019] disabled:opacity-50 text-[#FAF7F2] font-semibold tracking-wider uppercase text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to UPI Payment ({formatINR(finalAmount)})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 bg-[#F8F4EE] border border-[#E6DCCD] rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                <div className="p-2.5 bg-white rounded-2xl border border-[#D5C7B5] shadow-xs shrink-0 text-center">
                  {qrCodeDataUrl ? (
                    <img 
                      src={qrCodeDataUrl} 
                      alt="UPI QR Code" 
                      className="w-36 h-36 mx-auto rounded-lg"
                    />
                  ) : (
                    <div className="w-36 h-36 flex items-center justify-center text-xs text-[#8A7B70]">
                      Generating QR...
                    </div>
                  )}
                  <span className="text-[10px] text-[#8A7B70] block mt-1">
                    Scan with any UPI app
                  </span>
                </div>

                <div className="space-y-2 text-xs flex-1 w-full">
                  <div>
                    <span className="text-[10px] uppercase font-medium text-[#9C7A4E] tracking-wider">Amount</span>
                    <p className="font-serif text-2xl font-bold text-[#4A1521]">
                      {formatINR(finalAmount)}
                    </p>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-[#D5C7B5]">
                    <span className="text-[10px] text-[#8A7B70] uppercase block font-medium">Payee UPI ID</span>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-medium text-[#2C2420] text-xs">
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
                    Open UPI App on Mobile
                  </a>
                </div>
              </div>

              {/* UTR */}
              <div className="bg-[#F8F4EE] p-3 rounded-2xl border border-[#E6DCCD] space-y-1.5">
                <label className="block text-xs font-medium text-[#4A3E38]">
                  UPI Reference / UTR Number (Optional)
                </label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  placeholder="e.g. 402819283019"
                  className="w-full px-3 py-1.5 bg-white border border-[#D5C7B5] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#9C7A4E]"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('details')}
                  className="w-1/3 py-2.5 px-3 bg-[#EFE8DD] hover:bg-[#E5DCCF] text-[#4A3E38] text-xs font-medium rounded-xl transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSent}
                  className="w-2/3 py-2.5 px-4 bg-[#4A1521] hover:bg-[#381019] text-[#FAF7F2] font-semibold tracking-wider uppercase text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                  I Have Sent {formatINR(finalAmount)} Shagun
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-3.5 bg-[#FAF7F2] border-t border-[#E6DCCD] flex items-center justify-between text-xs text-[#7A6D63]">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#9C7A4E]" />
            100% direct bank transfer
          </span>
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
