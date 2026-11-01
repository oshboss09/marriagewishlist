import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  Gift, 
  Clock 
} from 'lucide-react';
import { RegistryItem, ItemCategory, GuestProfile } from '../types';
import { WishlistItemCard } from './WishlistItemCard';

interface WishlistSectionProps {
  items: RegistryItem[];
  currentGuest: GuestProfile;
  onOpenReserve: (item: RegistryItem) => void;
  onOpenGroupGift: (item: RegistryItem) => void;
  onFastForwardAllReservations?: () => void;
}

const CATEGORIES: ItemCategory[] = [
  'All',
  'Kitchen & Dining',
  'Home & Living',
  'Electronics & Appliances',
  'Bed & Bath',
];

export const WishlistSection: React.FC<WishlistSectionProps> = ({
  items,
  currentGuest,
  onOpenReserve,
  onOpenGroupGift,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'group' | 'reserved' | 'gifted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'price-asc' | 'price-desc'>('priority');

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
  }, [items, selectedCategory, statusFilter, searchQuery, sortBy]);

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
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="text-[11px] font-medium text-[#9C7A4E] uppercase tracking-[0.2em] mb-1.5">
            Curated Registry
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal text-[#2C2420] tracking-tight">
            Our Wedding Wishlist
          </h2>
          <p className="font-editorial text-lg text-[#6B5E55] italic mt-1.5 max-w-xl font-normal">
            Thoughtful pieces to fill our home with warmth, good food, and shared memories.
          </p>
        </div>

        {/* Minimal luxury stats */}
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
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#FCFAF6] p-4 rounded-2xl border border-[#E6DCCD] shadow-xs space-y-3.5 mb-10">
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

        {/* Secondary controls: Search, Status tabs, Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#EFE8DD]">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-[#9C7A4E] absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product, retailer, or category..."
              className="w-full pl-9 pr-3.5 py-1.5 bg-[#FAF7F2] border border-[#E0D5C7] rounded-xl text-xs text-[#2C2420] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#9C7A4E]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs overflow-x-auto">
            <span className="text-[10px] text-[#9C7A4E] font-medium uppercase tracking-wider mr-1">Filter:</span>
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
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
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
      ) : (
        <div className="py-20 text-center bg-[#FCFAF6] rounded-3xl border border-[#E6DCCD] p-8 space-y-2">
          <p className="font-serif text-lg text-[#4A3E38]">No registry pieces matched your filter</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setStatusFilter('all');
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
