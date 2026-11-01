import React, { useState } from 'react';
import { 
  Heart, 
  Gift, 
  EyeOff, 
  Sparkles 
} from 'lucide-react';
import { ShagunGift, RegistryItem, Wedding } from '../types';
import { formatINR } from '../utils/upi';

interface BlessingWallProps {
  shagunList: ShagunGift[];
  registryItems: RegistryItem[];
  wedding: Wedding;
  onOpenShagunModal: () => void;
}

export const BlessingWall: React.FC<BlessingWallProps> = ({
  shagunList,
  registryItems,
  wedding,
  onOpenShagunModal,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'shagun' | 'gifts'>('all');

  const publicShagun = shagunList.filter((s) => s.visibility !== 'private');

  const itemNotes = registryItems
    .filter((item) => item.status === 'gifted' && item.giftedBy?.note)
    .map((item) => ({
      id: `item-${item.id}`,
      guestName: item.giftedBy?.name || 'A Loving Guest',
      message: item.giftedBy?.note || '',
      type: 'item_gift' as const,
      itemTitle: item.title,
      store: item.store,
      date: item.giftedBy?.date || 'Recently',
    }));

  const allWishes = [
    ...publicShagun.map((s) => ({
      id: s.id,
      guestName: s.visibility === 'anonymous_to_guests' ? 'A Well-Wisher' : s.guestName,
      isAnonymous: s.visibility === 'anonymous_to_guests',
      message: s.message,
      type: 'shagun' as const,
      amount: s.amount,
      date: new Date(s.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    })),
    ...itemNotes.map((n) => ({
      id: n.id,
      guestName: n.guestName,
      isAnonymous: false,
      message: n.message,
      type: 'gift' as const,
      itemTitle: n.itemTitle,
      date: n.date,
    })),
  ];

  const filteredWishes = allWishes.filter((w) => {
    if (filterType === 'shagun') return w.type === 'shagun';
    if (filterType === 'gifts') return w.type === 'gift';
    return true;
  });

  return (
    <section id="blessings-wall" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E6DCCD]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <div className="text-[11px] font-medium text-[#9C7A4E] uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#9C7A4E]" />
            <span>Wishes & Blessings</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#2C2420] tracking-tight">
            The Blessing Wall
          </h2>
          <p className="font-editorial text-lg text-[#6B5E55] italic mt-1.5 max-w-lg font-normal">
            Heartfelt words, love, and Shagun shared with Oyeshi & Nishant by family and friends.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-[#EFE8DD] p-1 rounded-full flex items-center text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
                filterType === 'all' ? 'bg-white shadow-xs text-[#4A1521]' : 'text-[#6B5E55] hover:text-[#2C2420]'
              }`}
            >
              All ({allWishes.length})
            </button>
            <button
              onClick={() => setFilterType('shagun')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
                filterType === 'shagun' ? 'bg-white shadow-xs text-[#4A1521]' : 'text-[#6B5E55] hover:text-[#2C2420]'
              }`}
            >
              Shagun
            </button>
            <button
              onClick={() => setFilterType('gifts')}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
                filterType === 'gifts' ? 'bg-white shadow-xs text-[#4A1521]' : 'text-[#6B5E55] hover:text-[#2C2420]'
              }`}
            >
              Gift Notes
            </button>
          </div>

          <button
            onClick={onOpenShagunModal}
            className="px-5 py-2.5 bg-[#4A1521] hover:bg-[#381019] text-[#FAF7F2] rounded-xl text-xs font-semibold tracking-wider uppercase shadow-xs transition-all shrink-0 flex items-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5 text-[#D8C7B5]" />
            <span>Send Blessing</span>
          </button>
        </div>
      </div>

      {/* Grid of blessing cards - styled like luxury linen stationery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWishes.map((wish) => (
          <div 
            key={wish.id}
            className="p-6 rounded-3xl bg-[#FCFAF6] border border-[#E6DCCD] shadow-[0_4px_20px_-8px_rgba(74,21,33,0.04)] flex flex-col justify-between space-y-4 hover:border-[#C5A880] transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-serif ${
                    wish.isAnonymous 
                      ? 'bg-[#EFE8DD] text-[#7A6D63]' 
                      : 'bg-[#F3EDE4] border border-[#DDD2C4] text-[#4A1521]'
                  }`}>
                    {wish.isAnonymous ? (
                      <EyeOff className="w-3.5 h-3.5 text-[#8A7B70]" />
                    ) : (
                      wish.guestName.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-normal text-[#2C2420] flex items-center gap-1.5">
                      {wish.guestName}
                      {wish.isAnonymous && (
                        <span className="text-[10px] text-[#8A7B70] bg-[#EFE8DD] px-1.5 py-0.5 rounded font-sans">
                          Anonymous
                        </span>
                      )}
                    </h4>
                    <span className="text-[10px] text-[#8A7B70] font-light">{wish.date}</span>
                  </div>
                </div>

                {wish.type === 'shagun' && (
                  <span className="px-2.5 py-1 bg-[#F5EFEB] border border-[#DDD2C4] text-[#4A1521] font-serif font-medium text-xs rounded-lg shadow-2xs">
                    {formatINR((wish as any).amount)}
                  </span>
                )}
                {wish.type === 'gift' && (
                  <span className="px-2.5 py-1 bg-[#FAF7F2] border border-[#E6DCCD] text-[#7A6D63] text-[10px] rounded-lg flex items-center gap-1 font-medium">
                    <Gift className="w-3 h-3 text-[#9C7A4E]" />
                    Registry Gift
                  </span>
                )}
              </div>

              {/* Message quote */}
              <p className="font-editorial text-stone-700 text-lg sm:text-xl leading-relaxed italic font-normal text-[#382F2A]">
                "{wish.message}"
              </p>
            </div>

            {wish.type === 'gift' && (wish as any).itemTitle && (
              <div className="pt-3 border-t border-[#EFE8DD] text-[11px] text-[#8A7B70] truncate">
                Gifted: <span className="text-[#4A1521] font-medium">{(wish as any).itemTitle}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};
