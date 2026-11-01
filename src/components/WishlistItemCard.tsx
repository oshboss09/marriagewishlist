import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  Users, 
  Gift, 
  Sparkles 
} from 'lucide-react';
import { RegistryItem, GuestProfile } from '../types';
import { formatINR, getReservationTimeRemaining } from '../utils/upi';

interface WishlistItemCardProps {
  item: RegistryItem;
  currentGuest: GuestProfile;
  onOpenReserve: (item: RegistryItem) => void;
  onOpenGroupGift: (item: RegistryItem) => void;
}

export const WishlistItemCard: React.FC<WishlistItemCardProps> = ({
  item,
  currentGuest,
  onOpenReserve,
  onOpenGroupGift,
}) => {
  const [timeLeft, setTimeLeft] = useState<{ isExpired: boolean; formatted: string }>({
    isExpired: false,
    formatted: '',
  });

  useEffect(() => {
    if (item.status !== 'reserved' || !item.reservedBy?.reservedUntil) return;

    const tick = () => {
      const remaining = getReservationTimeRemaining(item.reservedBy?.reservedUntil);
      setTimeLeft(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [item]);

  const isReservedByMe = item.status === 'reserved' && (
    item.reservedBy?.phone === currentGuest.phone || item.reservedBy?.name === currentGuest.name
  );

  const goal = item.groupGoalAmount || item.price;
  const progressPercent = Math.min(100, Math.round((item.groupRaisedAmount / goal) * 100));

  return (
    <div className="group bg-[#FCFAF6] rounded-2xl border border-[#E6DCCD] hover:border-[#C5A880] hover:shadow-[0_12px_32px_-12px_rgba(74,21,33,0.08)] transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F5EFEB]">
        <img 
          src={item.image} 
          alt={item.title} 
          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Priority Badge */}
        {item.priority === 'must_have' && (
          <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#4A1521]/95 backdrop-blur-xs text-[#FAF7F2] text-[10px] font-medium tracking-widest uppercase rounded shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#C5A880]" />
            <span>Essential</span>
          </div>
        )}

        {/* Store Tag */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded text-[11px] font-medium bg-[#FCFAF6]/95 backdrop-blur-xs text-[#4A3E38] border border-[#DDD2C4] shadow-2xs">
          {item.store}
        </div>

        {/* Status Overlay Ribbon */}
        {item.status === 'gifted' && (
          <div className="absolute inset-x-0 bottom-0 py-2.5 px-3.5 bg-[#4A1521]/90 backdrop-blur-xs text-[#FAF7F2] text-xs font-medium flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#EFE8DD]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880]" />
              Gifted
            </span>
            {item.giftedBy?.name && (
              <span className="text-[11px] text-[#D5C7B5] truncate max-w-[60%] font-light">
                by {item.giftedBy.name}
              </span>
            )}
          </div>
        )}

        {item.status === 'reserved' && (
          <div className="absolute inset-x-0 bottom-0 py-2.5 px-3.5 bg-[#2C2420]/90 backdrop-blur-xs text-[#FAF7F2] text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#EFE8DD]">
              <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
              {isReservedByMe ? 'Reserved by you' : 'Hold Active'}
            </span>
            <span className="text-[11px] font-mono text-[#D5C7B5]">
              {timeLeft.formatted} left
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="text-[10px] font-medium text-[#9C7A4E] uppercase tracking-[0.16em] mb-1">
            {item.category}
          </div>
          <h3 className="font-serif text-base font-normal text-[#2C2420] line-clamp-2 leading-snug group-hover:text-[#4A1521] transition-colors">
            {item.title}
          </h3>

          {item.notes && (
            <p className="font-editorial text-sm text-[#7A6D63] italic mt-1 line-clamp-1 font-normal">
              "{item.notes}"
            </p>
          )}

          {/* Pricing & Group Progress */}
          <div className="mt-3.5">
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-normal font-serif text-[#2C2420]">
                {formatINR(item.price)}
              </span>
              {item.isGroupGift && (
                <span className="text-[10px] font-medium text-[#4A1521] bg-[#F3EDE4] px-2 py-0.5 rounded border border-[#DDD2C4]">
                  Group Gift
                </span>
              )}
            </div>

            {/* Group Progress Bar */}
            {item.isGroupGift && (
              <div className="mt-2.5 space-y-1">
                <div className="w-full h-1.5 bg-[#EFE8DD] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#4A1521] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#7A6D63]">
                  <span>{formatINR(item.groupRaisedAmount)} contributed</span>
                  <span className="font-medium text-[#4A1521]">{progressPercent}%</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {item.status === 'gifted' ? (
            <div className="w-full py-2.5 px-3 bg-[#F5EFEB] text-[#7A6D63] rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 border border-[#E6DCCD]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#9C7A4E]" />
              <span>Purchased & Gifted</span>
            </div>
          ) : item.status === 'reserved' ? (
            isReservedByMe ? (
              <button
                onClick={() => onOpenReserve(item)}
                className="w-full py-2.5 px-3 bg-[#4A1521] hover:bg-[#381019] text-[#FAF7F2] rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Complete Order / Confirm</span>
              </button>
            ) : (
              <div className="w-full py-2.5 px-3 bg-[#F5EFEB] text-[#7A6D63] rounded-xl text-xs font-medium text-center border border-[#E6DCCD]">
                <span>48h Hold Active</span>
              </div>
            )
          ) : item.isGroupGift ? (
            <div className="flex gap-2">
              <button
                onClick={() => onOpenGroupGift(item)}
                className="flex-1 py-2.5 px-3 bg-[#4A1521] hover:bg-[#381019] text-[#FAF7F2] rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Contribute</span>
              </button>
              <button
                onClick={() => onOpenReserve(item)}
                title="Gift the full item"
                className="py-2.5 px-3.5 bg-white border border-[#D5C7B5] hover:bg-[#F8F4EE] text-[#4A1521] rounded-xl text-xs font-medium transition-colors"
              >
                Full
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenReserve(item)}
              className="w-full py-2.5 px-3 bg-[#4A1521] hover:bg-[#381019] text-[#FAF7F2] rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-xs hover:shadow-sm flex items-center justify-center gap-1.5"
            >
              <Gift className="w-3.5 h-3.5 text-[#D5C7B5]" />
              <span>I'll Gift This</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
