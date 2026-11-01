import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  MapPin, 
  X, 
  ShieldAlert, 
  Sparkles
} from 'lucide-react';
import { RegistryItem, Wedding, GuestProfile } from '../types';
import { formatINR, getReservationTimeRemaining, copyToClipboard } from '../utils/upi';

interface ReserveModalProps {
  item: RegistryItem | null;
  wedding: Wedding;
  currentGuest: GuestProfile;
  isOpen: boolean;
  onClose: () => void;
  onReserve: (itemId: string, guestName: string, guestPhone: string) => void;
  onCancelReservation: (itemId: string) => void;
  onConfirmPurchase: (itemId: string, orderId: string, note: string) => void;
  onFastForwardExpiry: (itemId: string) => void;
  onOpenAddressDrawer: () => void;
}

export const ReserveModal: React.FC<ReserveModalProps> = ({
  item,
  wedding,
  currentGuest,
  isOpen,
  onClose,
  onReserve,
  onCancelReservation,
  onConfirmPurchase,
  onFastForwardExpiry,
  onOpenAddressDrawer,
}) => {
  const [guestName, setGuestName] = useState(currentGuest.name);
  const [guestPhone, setGuestPhone] = useState(currentGuest.phone);
  const [orderId, setOrderId] = useState('');
  const [giftNote, setGiftNote] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; formatted: string }>({
    hours: 48,
    minutes: 0,
    seconds: 0,
    formatted: '48h 00m 00s',
  });

  useEffect(() => {
    if (currentGuest.name) setGuestName(currentGuest.name);
    if (currentGuest.phone) setGuestPhone(currentGuest.phone);
  }, [currentGuest]);

  useEffect(() => {
    if (!item || item.status !== 'reserved' || !item.reservedBy?.reservedUntil) return;

    const updateTimer = () => {
      const remaining = getReservationTimeRemaining(item.reservedBy?.reservedUntil);
      setTimeLeft(remaining);
      if (remaining.isExpired) {
        onFastForwardExpiry(item.id);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [item, onFastForwardExpiry]);

  if (!isOpen || !item) return null;

  const isReservedByMe = item.status === 'reserved' && (
    item.reservedBy?.phone === guestPhone || item.reservedBy?.name === guestName
  );
  const isReservedByOther = item.status === 'reserved' && !isReservedByMe;

  const handleStartReservation = () => {
    if (!guestName.trim()) return;
    onReserve(item.id, guestName.trim(), guestPhone.trim());
  };

  const handleMarkPurchased = () => {
    onConfirmPurchase(item.id, orderId.trim(), giftNote.trim());
    onClose();
  };

  const handleCopyQuickAddress = async () => {
    const full = `${wedding.deliveryAddress.recipientName}, ${wedding.deliveryAddress.line1}, ${wedding.deliveryAddress.city}, ${wedding.deliveryAddress.state} - ${wedding.deliveryAddress.pincode}. Phone: ${wedding.deliveryAddress.phone}`;
    const success = await copyToClipboard(full);
    if (success) {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl bg-[#FCFAF6] rounded-3xl shadow-2xl border border-[#E6DCCD] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury Wine Header */}
        <div className="px-7 py-5 bg-[#4A1521] text-[#FAF7F2] flex items-center justify-between border-b border-[#9C7A4E]/30">
          <div>
            <h3 className="font-serif text-xl font-normal tracking-wide">
              {item.status === 'reserved' ? 'Complete Your Gift' : "Gift This Registry Piece"}
            </h3>
            <p className="text-xs text-[#D8C7B5] font-light">
              Hold on registry • Complete order on {item.store} • 48h duplicate protection
            </p>
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
          {/* Item Summary Card */}
          <div className="flex items-start gap-4 p-4 bg-[#F8F4EE] rounded-2xl border border-[#E6DCCD]">
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-16 h-16 object-cover rounded-xl border border-[#D5C7B5] shrink-0 bg-white"
            />
            <div className="flex-1 min-w-0">
              <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-medium bg-[#EFE8DD] text-[#4A1521] mb-1">
                {item.store}
              </span>
              <h4 className="font-serif text-base font-normal text-[#2C2420] line-clamp-1">
                {item.title}
              </h4>
              <p className="font-serif text-lg font-bold text-[#4A1521] mt-0.5">
                {formatINR(item.price)}
              </p>
            </div>
          </div>

          {/* Reserved by other */}
          {isReservedByOther && (
            <div className="p-4 bg-[#F8F4EE] border border-[#E6DCCD] rounded-2xl space-y-2 text-xs">
              <div className="flex items-center gap-2 text-[#4A1521] font-medium">
                <Clock className="w-4 h-4 text-[#9C7A4E]" />
                <span>Currently held by another guest</span>
              </div>
              <p className="text-[#6B5E55] leading-relaxed font-light">
                Another guest is currently ordering this item. It is held for <strong>{timeLeft.formatted}</strong> to prevent duplicate purchases.
                If they do not confirm, it automatically returns to Available.
              </p>
              <div className="pt-2 flex items-center justify-between border-t border-[#EFE8DD] text-xs">
                <span className="text-[#8A7B70]">Test hold release:</span>
                <button
                  onClick={() => onFastForwardExpiry(item.id)}
                  className="px-3 py-1 bg-[#EFE8DD] hover:bg-[#E5DCCF] text-[#4A1521] rounded-lg text-xs transition-colors"
                >
                  Expire Now
                </button>
              </div>
            </div>
          )}

          {/* Available view */}
          {item.status === 'available' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#F8F4EE] border border-[#E6DCCD] rounded-2xl space-y-2 text-xs text-[#6B5E55]">
                <div className="flex items-center gap-2 font-medium text-[#4A1521]">
                  <ShieldAlert className="w-4 h-4 text-[#9C7A4E]" />
                  <span>How the 48-Hour Reservation Works:</span>
                </div>
                <ol className="space-y-1 list-decimal pl-4 leading-relaxed font-light">
                  <li>We hold this item for <strong>48 hours</strong> exclusively for you so others don't purchase it.</li>
                  <li>Copy Oyeshi & Nishant's delivery address and checkout on <strong>{item.store}</strong>.</li>
                  <li>Return here and tap <strong>Mark as Purchased</strong>.</li>
                </ol>
              </div>

              {/* Guest name & phone */}
              <div className="space-y-3 bg-[#F8F4EE] p-4 rounded-2xl border border-[#E6DCCD]">
                <p className="text-[10px] font-semibold uppercase text-[#9C7A4E] tracking-wider">Your Guest Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                </div>
              </div>

              <button
                onClick={handleStartReservation}
                disabled={!guestName.trim()}
                className="w-full py-3 px-4 bg-[#4A1521] hover:bg-[#381019] disabled:opacity-50 text-[#FAF7F2] font-semibold tracking-wider uppercase text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Clock className="w-3.5 h-3.5 text-[#D8C7B5]" />
                Reserve for 48 Hours & Continue
              </button>
            </div>
          )}

          {/* Reserved by Me */}
          {isReservedByMe && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#F3EDE4] border border-[#DDD2C4] rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#4A1521]">
                  <Clock className="w-4 h-4 text-[#9C7A4E]" />
                  <span>
                    Held for you: <strong className="font-mono">{timeLeft.formatted}</strong> remaining
                  </span>
                </div>
                <button
                  onClick={() => onCancelReservation(item.id)}
                  className="text-[#7A1F2D] hover:underline text-xs font-medium"
                >
                  Cancel Hold
                </button>
              </div>

              {/* Step 1: Copy Delivery Address */}
              <div className="p-4 bg-[#F8F4EE] rounded-2xl border border-[#E6DCCD] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-medium text-[#4A1521]">
                    <span className="w-4 h-4 rounded-full bg-[#4A1521] text-[#FAF7F2] text-[10px] flex items-center justify-center">1</span>
                    <span>Couple's Shipping Address</span>
                  </div>
                  <button
                    onClick={onOpenAddressDrawer}
                    className="text-xs text-[#7A1F2D] hover:underline"
                  >
                    View Details
                  </button>
                </div>

                <div className="p-3 bg-white border border-[#D5C7B5] rounded-xl text-xs leading-relaxed text-[#4A3E38]">
                  <p className="font-medium text-[#2C2420]">{wedding.deliveryAddress.recipientName}</p>
                  <p>{wedding.deliveryAddress.line1}, {wedding.deliveryAddress.city}, {wedding.deliveryAddress.state} - {wedding.deliveryAddress.pincode}</p>
                  <p className="text-[#8A7B70] mt-0.5">Phone: {wedding.deliveryAddress.phone}</p>
                </div>

                <button
                  onClick={handleCopyQuickAddress}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                    copiedAddress 
                      ? 'bg-[#EBF3ED] border-[#C2DEC9] text-[#22543D]' 
                      : 'bg-white hover:bg-[#FAF7F2] border-[#D5C7B5] text-[#4A1521]'
                  }`}
                >
                  {copiedAddress ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Copied to Clipboard!
                    </>
                  ) : (
                    <>
                      <MapPin className="w-3.5 h-3.5 text-[#9C7A4E]" /> Copy Shipping Address for Checkout
                    </>
                  )}
                </button>
              </div>

              {/* Step 2: External Linkout */}
              <div className="p-4 bg-[#F8F4EE] rounded-2xl border border-[#E6DCCD] space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-[#4A1521]">
                  <span className="w-4 h-4 rounded-full bg-[#4A1521] text-[#FAF7F2] text-[10px] flex items-center justify-center">2</span>
                  <span>Order on {item.store}</span>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#4A1521] hover:bg-[#381019] text-[#FAF7F2] text-xs font-semibold tracking-wider uppercase rounded-xl shadow-xs transition-colors"
                >
                  <span>Open Item on {item.store}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#C5A880]" />
                </a>
              </div>

              {/* Step 3: Mark as Purchased */}
              <div className="p-4 bg-[#F8F4EE] rounded-2xl border border-[#E6DCCD] space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-[#4A1521]">
                  <span className="w-4 h-4 rounded-full bg-[#4A1521] text-[#FAF7F2] text-[10px] flex items-center justify-center">3</span>
                  <span>Confirm Purchase on Registry</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A3E38] mb-1">
                    Store Order ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. 402-987219"
                    className="w-full px-3 py-1.5 bg-white border border-[#D5C7B5] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#9C7A4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#4A3E38] mb-1">
                    Message for Oyeshi & Nishant
                  </label>
                  <textarea
                    rows={2}
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    placeholder="Wishing you both a lifetime of happiness!"
                    className="w-full px-3 py-1.5 bg-white border border-[#D5C7B5] rounded-xl text-xs font-editorial text-base focus:outline-none focus:ring-1 focus:ring-[#9C7A4E]"
                  />
                </div>

                <button
                  onClick={handleMarkPurchased}
                  className="w-full py-3 px-4 bg-[#4A1521] hover:bg-[#381019] text-[#FAF7F2] font-semibold tracking-wider uppercase text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880]" />
                  Mark as Purchased
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-3.5 bg-[#FAF7F2] border-t border-[#E6DCCD] flex items-center justify-between text-xs text-[#7A6D63]">
          <span>Direct store checkout</span>
          <button
            onClick={onClose}
            className="text-[#6B5E55] hover:text-[#2C2420]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
