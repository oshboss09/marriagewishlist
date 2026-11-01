import React from 'react';
import { 
  Gift, 
  Heart, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  Calendar
} from 'lucide-react';
import { Wedding } from '../types';

interface WeddingHeroProps {
  wedding: Wedding;
  onOpenShagun: () => void;
  onOpenAddress: () => void;
  onScrollToRegistry: () => void;
  onScrollToWall: () => void;
}

export const WeddingHero: React.FC<WeddingHeroProps> = ({
  wedding,
  onOpenShagun,
  onOpenAddress,
  onScrollToRegistry,
}) => {
  const hasDate = Boolean(wedding.weddingDate && wedding.weddingDate.trim() !== '');
  const hasVenue = Boolean(wedding.venue && wedding.venue.trim() !== '');

  let formattedDate = '';
  if (hasDate) {
    const weddingDateObj = new Date(wedding.weddingDate);
    formattedDate = weddingDateObj.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#FAF7F2] via-[#F6F1EA] to-[#FAF7F2] pt-12 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Subtle Luxury Corner Accents */}
      <div className="max-w-4xl mx-auto">
        {/* Luxury Letterpress Invitation Frame */}
        <div className="relative bg-[#FCFAF6] border border-[#E6DCCD] rounded-3xl p-8 sm:p-14 text-center shadow-[0_10px_40px_-15px_rgba(74,21,33,0.05)]">
          {/* Inner hairline border */}
          <div className="absolute inset-2 sm:inset-3 border border-[#EFE8DD] rounded-2xl pointer-events-none" />

          {/* Elegant Couple Monogram Crest */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-14 h-14 rounded-full border border-[#D5C7B5] bg-[#FAF7F2] flex items-center justify-center shadow-xs">
              <span className="font-serif text-lg tracking-widest text-[#4A1521] font-light">
                O<span className="font-editorial italic text-[#9C7A4E] text-base">&</span>N
              </span>
            </div>
          </div>

          {/* Heading Tag */}
          <div className="text-[11px] font-medium tracking-[0.22em] uppercase text-[#9C7A4E] mb-3">
            Wedding Registry & Shagun
          </div>

          {/* Couple Names - Grand Editorial Typography */}
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal text-[#2C2420] tracking-tight leading-[1.08] mb-6">
            {wedding.brideName} <span className="font-editorial italic font-light text-[#7A1F2D]">&</span> {wedding.groomName}
          </h1>

          {/* The Story - Romantic & Heartfelt */}
          <div className="max-w-xl mx-auto my-7">
            <p className="font-editorial text-xl sm:text-2xl text-[#3E342F] italic leading-relaxed font-normal">
              "{wedding.story}"
            </p>
          </div>

          {/* Date & Destination: Kept blank if unfinalised */}
          {(hasDate || hasVenue) ? (
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#6B5E55] mb-8 font-light">
              {hasDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#9C7A4E]" />
                  <span>{formattedDate}</span>
                </div>
              )}
              {hasVenue && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#9C7A4E]" />
                  <span>{wedding.venue}{wedding.city ? `, ${wedding.city}` : ''}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-[#8A7B70] tracking-widest uppercase mb-8 font-light">
              Date & Destination to follow
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 relative z-10">
            <button
              onClick={onScrollToRegistry}
              className="px-7 py-3 bg-[#4A1521] hover:bg-[#3A101A] text-[#FAF7F2] rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <Gift className="w-4 h-4 text-[#D8C7B5]" />
              <span>Explore Wishlist</span>
            </button>

            <button
              onClick={onOpenShagun}
              className="px-7 py-3 bg-[#FAF7F2] hover:bg-[#F3EDE4] text-[#4A1521] border border-[#D5C7B5] rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-xs flex items-center gap-2"
            >
              <Heart className="w-4 h-4 text-[#7A1F2D]" />
              <span>Offer Shagun (UPI)</span>
            </button>

            <button
              onClick={onOpenAddress}
              className="px-5 py-3 bg-white/70 hover:bg-white text-[#5A4D45] border border-[#E6DCCD] rounded-xl text-xs font-medium transition-colors flex items-center gap-2"
            >
              <MapPin className="w-3.5 h-3.5 text-[#9C7A4E]" />
              <span>Shipping Address</span>
            </button>
          </div>

          {/* Understated Luxury Guarantees */}
          <div className="pt-10 mt-8 border-t border-[#EFE8DD] flex flex-wrap items-center justify-center gap-6 text-[11px] text-[#7A6D63]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#9C7A4E]" />
              Direct Retailer Orders (Amazon, Croma, Pepperfry)
            </span>
            <span className="text-[#D5C7B5]">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#9C7A4E]" />
              Direct UPI into Couple's Account (Zero Fees)
            </span>
            <span className="text-[#D5C7B5]">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#9C7A4E]" />
              48-Hour Duplicate Prevention
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
