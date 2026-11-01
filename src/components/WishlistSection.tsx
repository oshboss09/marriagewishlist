import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Gift, 
  Clock,
  Heart,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { RegistryItem, ItemCategory, GuestProfile } from '../types';
import { WishlistItemCard } from './WishlistItemCard';
import { formatINR } from '../utils/upi';

interface WishlistSectionProps {
  items: RegistryItem[];
  currentGuest: GuestProfile;
  onOpenReserve: (item: RegistryItem) => void;
  onOpenGroupGift: (item: RegistryItem) => void;
  onOpenShagun?: () => void;
  onOpenAddress?: () => void;
  onFastForwardAllReservations?: () => void;
}

const CATEGORIES: ItemCategory[] = [
  'All',
  'Kitchen & Dining',
  'Home & Living',
  'Electronics & Appliances',
  'Bed & Bath',
  'Experiential & Honeymoon',
];

export const WishlistSection: React.FC<WishlistSectionProps> = ({
  items,
  currentGuest,
  onOpenReserve,
  onOpenGroupGift,
  onOpenShagun,
  onOpenAddress,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'group' | 'reserved' | 'gifted'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'under-5000' | '5000-15000' | 'above-15000'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'price-asc' | 'price-desc'>('priority');
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (selectedCategory !== 'All' && item.category !== selectedCategory) {
          return false;
        }
        if (statusFilter === 'available' && item.status !== 'available') return false;
        if (statusFilter === 'group' && !item.isGroupGift) return false;
        if (statusFilter === 'reserved' && item.status !== 'reserved') return false;
        if (statusFilter === 'gifted' && item.status !== 'gifted') return false;

        // Price range filter
        if (priceFilter === 'under-5000' && item.price >= 5000) return false;
        if (priceFilter === '5000-15000' && (item.price < 5000 || item.price > 15000)) return false;
        if (priceFilter === 'above-15000' && item.price <= 15000) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchStore = item.store.toLowerCase().includes(q);
          const matchCategory = item.category.toLowerCase().includes(q);
          const matchNotes = (item.notes || '').toLowerCase().includes(q);
          if (!matchTitle && !matchStore && !matchCategory && !matchNotes) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        const priorityOrder: Record<string, number> = { must_have: 0, standard: 1, nice_to_have: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }, [items, selectedCategory, statusFilter, priceFilter, searchQuery, sortBy]);

  const stats = useMemo(() => {
    const total = items.length;
    const available = items.filter((i) => i.status === 'available').length;
    const groupGifts = items.filter((i) => i.isGroupGift && i.status !== 'gifted').length;
    const reserved = items.filter((i) => i.status === 'reserved').length;
    const gifted = items.filter((i) => i.status === 'gifted').length;
    return { total, available, groupGifts, reserved, gifted };
  }, [items]);

  return (
    <section id="registry-wishlist" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title & Stats Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-medium text-[#9C7A4E] uppercase tracking-[0.25em]">
              Wishlist
            </span>
            <span className="text-[10px] text-[#7A1F2D] bg-[#F8EFEA] px-2 py-0.5 rounded-full font-medium border border-[#EACEC1]">
              15 Curated Pieces
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#2C2420] tracking-tight">
            Our Wishlist
          </h2>
          <p className="font-editorial text-lg text-[#6B5E55] italic mt-1.5 max-w-xl font-normal">
            Thoughtful pieces from our favorite stores to build our first home together.
          </p>
        </div>

        {/* Minimal luxury stats & Address button */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B5E55]">
          <span className="px-3 py-1.5 bg-[#FCFAF6] border border-[#E6DCCD] rounded-full shadow-2xs">
            <strong className="text-[#4A1521]">{stats.available}</strong> Available
          </span>
          <span className="px-3 py-1.5 bg-[#FCFAF6] border border-[#E6DCCD] rounded-full shadow-2xs">
            <strong className="text-[#4A1521]">{stats.groupGifts}</strong> Group Goals
          </span>
          {stats.reserved > 0 && (
            <span className="px-3 py-1.5 bg-[#F3EDE4] border border-[#DDD2C4] rounded-full flex items-center gap-1 text-[#4A1521]">
              <Clock className="w-3 h-3 text-[#9C7A4E]" />
              <strong>{stats.reserved}</strong> On Hold
            </span>
          )}
          <span className="px-3 py-1.5 bg-[#FAF7F2] border border-[#E6DCCD] rounded-full text-[#7A6D63]">
            <strong>{stats.gifted}</strong> Gifted
          </span>

          {onOpenAddress && (
            <button
              onClick={onOpenAddress}
              className="px-3.5 py-1.5 bg-[#F3EDE4] hover:bg-[#EAE0D4] border border-[#DDD2C4] rounded-full text-xs font-medium text-[#4A1521] flex items-center gap-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-[#7A1F2D]" />
              <span>Copy Shipping Address</span>
            </button>
          )}
        </div>
      </div>

      {/* How the Wishlist Works Accordion Banner */}
      <div className="mb-8 bg-[#FCFAF6] rounded-2xl border border-[#E6DCCD] overflow-hidden transition-all shadow-xs">
        <button
          onClick={() => setShowHowItWorks(!showHowItWorks)}
          className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-[#F8F4EE] transition-colors"
        >
          <div className="flex items-center gap-2 text-xs font-medium text-[#4A1521]">
            <HelpCircle className="w-4 h-4 text-[#9C7A4E]" />
            <span>How does this wishlist work? (Click to view 3 simple steps)</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#8A7B70]">
            <span>{showHowItWorks ? 'Hide' : 'Explain'}</span>
            {showHowItWorks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        {showHowItWorks && (
          <div className="px-5 pb-5 pt-2 border-t border-[#EFE8DD] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#5A4D45] animate-in fade-in">
            <div className="p-3.5 bg-white rounded-xl border border-[#EAE2D5] space-y-1.5">
              <div className="w-6 h-6 rounded-full bg-[#4A1521] text-[#FAF7F2] flex items-center justify-center font-serif text-xs font-semibold">
                1
              </div>
              <h4 className="font-medium text-[#2C2420]">Choose & Hold for 48 Hours</h4>
              <p className="text-[11px] text-[#6B5E55] leading-relaxed font-light">
                Click <strong>"I'll Gift This"</strong> on any piece. We place a 48-hour lock on it so two guests never purchase the same gift.
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-[#EAE2D5] space-y-1.5">
              <div className="w-6 h-6 rounded-full bg-[#4A1521] text-[#FAF7F2] flex items-center justify-center font-serif text-xs font-semibold">
                2
              </div>
              <h4 className="font-medium text-[#2C2420]">Checkout at the Retailer</h4>
              <p className="text-[11px] text-[#6B5E55] leading-relaxed font-light">
                Copy the couple's Navi Mumbai shipping address with 1 click, click through to Amazon or Croma, and place your order there.
              </p>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-[#EAE2D5] space-y-1.5">
              <div className="w-6 h-6 rounded-full bg-[#4A1521] text-[#FAF7F2] flex items-center justify-center font-serif text-xs font-semibold">
                3
              </div>
              <h4 className="font-medium text-[#2C2420]">Confirm or Chip In Together</h4>
              <p className="text-[11px] text-[#6B5E55] leading-relaxed font-light">
                Return to mark as purchased with your order ID, or contribute any amount toward dream items like the dining table via direct UPI.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FCFAF6] p-4 rounded-2xl border border-[#E6DCCD] shadow-xs space-y-3.5 mb-8">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#4A1521] text-[#FAF7F2] shadow-xs'
                  : 'bg-[#FAF7F2] hover:bg-[#F3ECE4] text-[#5A4D45] border border-[#E6DCCD]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary controls: Search, Status tabs, Price filter, Sort */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-3 border-t border-[#EFE8DD]">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#9C7A4E] absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by item, store (Croma, Amazon)..."
              className="w-full pl-9 pr-3.5 py-1.5 bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-xs text-[#2C2420] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9C7A4E]"
            />
          </div>

          {/* Price Range Filter */}
          <div className="flex items-center gap-1 text-xs overflow-x-auto">
            <span className="text-[10px] text-[#9C7A4E] font-medium uppercase tracking-wider mr-1">Price:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'under-5000', label: '< ₹5,000' },
              { id: '5000-15000', label: '₹5k - ₹15k' },
              { id: 'above-15000', label: '₹15k+' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPriceFilter(p.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  priceFilter === p.id
                    ? 'bg-[#9C7A4E] text-white shadow-2xs'
                    : 'text-[#6B5E55] hover:bg-[#F3ECE4]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs overflow-x-auto">
            <span className="text-[10px] text-[#9C7A4E] font-medium uppercase tracking-wider mr-1">Status:</span>
            {[
              { id: 'all', label: 'All' },
              { id: 'available', label: 'Available' },
              { id: 'group', label: 'Group Gifts' },
              { id: 'reserved', label: 'On Hold' },
              { id: 'gifted', label: 'Gifted' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-[#4A1521] text-[#FAF7F2]'
                    : 'text-[#6B5E55] hover:bg-[#F3ECE4]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#9C7A4E]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl px-3 py-1 text-xs text-[#4A3E38] focus:outline-none focus:ring-1 focus:ring-[#9C7A4E]"
            >
              <option value="priority">Curator's Choice</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
        {/* Featured Cash & Honeymoon Wishlist Fund */}
        {onOpenShagun && (selectedCategory === 'All' || selectedCategory === 'Experiential & Honeymoon') && (statusFilter === 'all' || statusFilter === 'group') && (
          <div className="bg-[#FAF4ED] border-2 border-[#D5C7B5] rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-radial from-[#9C7A4E]/15 to-transparent pointer-events-none rounded-bl-full" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 bg-[#4A1521] text-[#FAF7F2] rounded-md text-[10px] font-semibold uppercase tracking-wider">
                  Future Home & Travels
                </span>
                <span className="text-[10px] text-[#9C7A4E] font-medium uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Direct UPI
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-normal text-[#2C2420] group-hover:text-[#4A1521] transition-colors">
                  Future Home & Honeymoon Fund
                </h3>
                <p className="font-editorial text-sm text-[#5A4D45] italic mt-1 font-light leading-relaxed">
                  "For those who wish to send a blessing or contribute towards our first travels and new home together."
                </p>
              </div>

              <div className="p-3.5 bg-white/80 rounded-2xl border border-[#E6DCCD] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6B5E55]">Direct Bank Transfer:</span>
                  <span className="font-mono text-[#4A1521] font-semibold text-[11px]">oyeshi.nishant@upi</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#7A6D63]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Zero platform fees • Direct to couple's bank</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-[#E6DCCD]/70 flex items-center justify-between gap-3">
              <div className="text-[11px] text-[#8A7B70]">
                Auspicious ₹501 to ₹21,001+
              </div>
              <button
                onClick={onOpenShagun}
                className="px-4 py-2 bg-[#4A1521] hover:bg-[#3A101A] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <Heart className="w-3.5 h-3.5 text-[#C5A880]" />
                <span>Contribute via UPI</span>
              </button>
            </div>
          </div>
        )}

        {filteredItems.map((item) => (
          <WishlistItemCard
            key={item.id}
            item={item}
            currentGuest={currentGuest}
            onOpenReserve={onOpenReserve}
            onOpenGroupGift={onOpenGroupGift}
          />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="py-20 text-center bg-[#FCFAF6] rounded-3xl border border-[#E6DCCD] p-8 space-y-2">
          <p className="font-serif text-lg text-[#4A3E38]">No registry pieces matched your filter</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setStatusFilter('all');
              setPriceFilter('all');
              setSearchQuery('');
            }}
            className="text-xs text-[#7A1F2D] underline font-medium"
          >
            Reset all filters
          </button>
        </div>
      )}
    </section>
  );
};
