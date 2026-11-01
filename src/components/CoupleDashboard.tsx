import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListChecks, 
  Settings, 
  MapPin, 
  CreditCard, 
  Check, 
  Clock, 
  Gift, 
  Heart, 
  Users, 
  Download, 
  Trash2, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Link as LinkIcon,
  CheckCheck
} from 'lucide-react';
import { Wedding, RegistryItem, ShagunGift, StoreName, ItemCategory, ItemPriority } from '../types';
import { formatINR } from '../utils/upi';
import { PRESET_CATALOG_ITEMS } from '../data/initialData';
import { exportGiftsToCSV } from '../utils/storage';

interface CoupleDashboardProps {
  wedding: Wedding;
  items: RegistryItem[];
  shagunList: ShagunGift[];
  onUpdateWedding: (wedding: Wedding) => void;
  onAddItem: (item: Omit<RegistryItem, 'id' | 'weddingId' | 'groupRaisedAmount' | 'contributions' | 'status'>) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleShagunReceived: (shagunId: string) => void;
  onToggleShagunThankYou: (shagunId: string) => void;
  onToggleContributionReceived: (itemId: string, contributionId: string) => void;
  onManuallyReleaseReservation: (itemId: string) => void;
  onSwitchToGuestView: () => void;
}

export const CoupleDashboard: React.FC<CoupleDashboardProps> = ({
  wedding,
  items,
  shagunList,
  onUpdateWedding,
  onAddItem,
  onDeleteItem,
  onToggleShagunReceived,
  onToggleShagunThankYou,
  onToggleContributionReceived,
  onManuallyReleaseReservation,
  onSwitchToGuestView,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'add_item' | 'ledger' | 'manage_items' | 'settings'>('overview');

  // Form state for adding new item
  const [pastedUrl, setPastedUrl] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemStore, setItemStore] = useState<StoreName>('Amazon');
  const [itemPrice, setItemPrice] = useState<number | ''>('');
  const [itemImage, setItemImage] = useState('');
  const [itemCategory, setItemCategory] = useState<Exclude<ItemCategory, 'All'>>('Kitchen & Dining');
  const [isGroupGift, setIsGroupGift] = useState(false);
  const [itemPriority, setItemPriority] = useState<ItemPriority>('must_have');
  const [itemNotes, setItemNotes] = useState('');
  const [addItemSuccess, setAddItemSuccess] = useState(false);

  // Settings form state
  const [editedWedding, setEditedWedding] = useState<Wedding>(wedding);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Stats
  const totalItems = items.length;
  const purchasedItems = items.filter((i) => i.status === 'gifted').length;
  const reservedItems = items.filter((i) => i.status === 'reserved').length;
  
  const confirmedShagunTotal = shagunList
    .filter((s) => s.confirmedByCouple)
    .reduce((acc, s) => acc + s.amount, 0);

  const pendingShagunTotal = shagunList
    .filter((s) => !s.confirmedByCouple)
    .reduce((acc, s) => acc + s.amount, 0);

  const groupFundsTotal = items.reduce((acc, item) => {
    return acc + item.contributions.filter((c) => c.confirmedByCouple).reduce((cAcc, c) => cAcc + c.amount, 0);
  }, 0);

  const pendingGroupFundsTotal = items.reduce((acc, item) => {
    return acc + item.contributions.filter((c) => !c.confirmedByCouple).reduce((cAcc, c) => cAcc + c.amount, 0);
  }, 0);

  const handleSimulateUrlFetch = () => {
    if (!pastedUrl.trim()) return;

    setIsFetchingUrl(true);
    setTimeout(() => {
      const urlLower = pastedUrl.toLowerCase();
      let detectedStore: StoreName = 'Other';
      let autoTitle = 'Home Product';
      let autoPrice = 7999;
      let autoImg = 'https://images.unsplash.com/photo-1584990347449-359f13e79213?auto=format&fit=crop&w=800&q=80';
      let autoCat: Exclude<ItemCategory, 'All'> = 'Kitchen & Dining';

      if (urlLower.includes('amazon')) {
        detectedStore = 'Amazon';
        autoTitle = 'Philips Connected Air Fryer XL';
        autoPrice = 11999;
        autoImg = 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80';
        autoCat = 'Kitchen & Dining';
      } else if (urlLower.includes('croma')) {
        detectedStore = 'Croma';
        autoTitle = 'Samsung 43-inch The Frame 4K QLED TV';
        autoPrice = 54990;
        autoImg = 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80';
        autoCat = 'Electronics & Appliances';
      } else if (urlLower.includes('pepperfry')) {
        detectedStore = 'Pepperfry';
        autoTitle = 'Solid Sheesham Wood Queen Bed';
        autoPrice = 36990;
        autoImg = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80';
        autoCat = 'Home & Living';
      } else if (urlLower.includes('myntra')) {
        detectedStore = 'Myntra';
        autoTitle = 'Spaces 100% Egyptian Cotton Luxury King Bed Set';
        autoPrice = 5999;
        autoImg = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80';
        autoCat = 'Bed & Bath';
      } else if (urlLower.includes('ikea')) {
        detectedStore = 'IKEA';
        autoTitle = 'IKEA Poäng Armchair';
        autoPrice = 12990;
        autoImg = 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80';
        autoCat = 'Home & Living';
      }

      setItemStore(detectedStore);
      setItemTitle(autoTitle);
      setItemPrice(autoPrice);
      setItemImage(autoImg);
      setItemCategory(autoCat);
      setIsFetchingUrl(false);
    }, 500);
  };

  const handleLoadPreset = (preset: typeof PRESET_CATALOG_ITEMS[0]) => {
    setPastedUrl(preset.url);
    setItemTitle(preset.title);
    setItemStore(preset.store);
    setItemPrice(preset.price);
    setItemImage(preset.image);
    setItemCategory(preset.category);
    setIsGroupGift(preset.isGroupGift);
    setItemNotes(preset.notes);
  };

  const handleAddNewItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemTitle || !itemPrice || !itemImage) return;

    let affiliateUrl = pastedUrl;
    if (wedding.enableAffiliateTags && wedding.affiliateTagId && pastedUrl) {
      const sep = pastedUrl.includes('?') ? '&' : '?';
      affiliateUrl = `${pastedUrl}${sep}tag=${wedding.affiliateTagId}`;
    }

    onAddItem({
      title: itemTitle.trim(),
      url: pastedUrl.trim() || 'https://amazon.in',
      affiliateUrl,
      store: itemStore,
      category: itemCategory,
      image: itemImage.trim(),
      price: Number(itemPrice),
      isGroupGift,
      groupGoalAmount: isGroupGift ? Number(itemPrice) : undefined,
      priority: itemPriority,
      notes: itemNotes.trim(),
    });

    setAddItemSuccess(true);
    setTimeout(() => setAddItemSuccess(false), 3000);

    setPastedUrl('');
    setItemTitle('');
    setItemPrice('');
    setItemImage('');
    setItemNotes('');
    setIsGroupGift(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateWedding(editedWedding);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16">
      {/* Top Banner - Deep Wine Velvet & Champagne */}
      <div className="bg-[#4A1521] text-[#FAF7F2] border-b border-[#9C7A4E]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[10px] text-[#C5A880] font-medium uppercase tracking-[0.2em] mb-1">
              Couple Administration
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-white">
              {wedding.brideName} & {wedding.groomName}
            </h1>
            <p className="text-xs text-[#D8C7B5] mt-0.5 font-light">
              Registry: <code className="text-[#F5EFEB]">/{wedding.slug}</code> • UPI: <code className="text-[#F5EFEB]">{wedding.upiId}</code>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => exportGiftsToCSV(items, shagunList, wedding)}
              className="px-3.5 py-2 bg-[#5A1C29] hover:bg-[#682332] text-[#F5EFEB] border border-[#9C7A4E]/40 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs"
              title="Download gift tracker in CSV format"
            >
              <Download className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onSwitchToGuestView}
              className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#F3EDE4] text-[#4A1521] rounded-xl text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>View As Guest</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-2 border-t border-[#6B1D2F] pt-2 pb-0 scrollbar-none">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'add_item', label: 'Add Item via URL', icon: PlusCircle },
            { id: 'ledger', label: 'Gift & Shagun Ledger', icon: ListChecks },
            { id: 'manage_items', label: 'Manage Registry', icon: Gift },
            { id: 'settings', label: 'UPI & Delivery Address', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'border-[#C5A880] text-[#C5A880] bg-[#5A1C29] rounded-t-lg'
                    : 'border-transparent text-[#D8C7B5] hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: OVERVIEW & STATS */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#FCFAF6] p-5 rounded-2xl border border-[#E6DCCD] shadow-xs space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-[#9C7A4E] flex items-center justify-between">
                  <span>Direct UPI Received</span>
                  <Heart className="w-3.5 h-3.5 text-[#7A1F2D]" />
                </span>
                <p className="font-serif text-2xl font-bold text-stone-900">
                  {formatINR(confirmedShagunTotal + groupFundsTotal)}
                </p>
                <p className="text-[11px] text-stone-500 font-light">
                  Direct to bank • {formatINR(pendingShagunTotal + pendingGroupFundsTotal)} pending check
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-stone-400 flex items-center justify-between">
                  <span>Wishlist Items</span>
                  <Gift className="w-3.5 h-3.5 text-stone-400" />
                </span>
                <p className="font-serif text-2xl font-bold text-stone-900">
                  {totalItems} Curated
                </p>
                <p className="text-[11px] text-stone-500 font-light">
                  <strong>{purchasedItems}</strong> Purchased • <strong>{reservedItems}</strong> on hold
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-stone-400 flex items-center justify-between">
                  <span>Group Gifts</span>
                  <Users className="w-3.5 h-3.5 text-stone-400" />
                </span>
                <p className="font-serif text-2xl font-bold text-stone-900">
                  {formatINR(groupFundsTotal)}
                </p>
                <p className="text-[11px] text-stone-500 font-light">
                  Across home essentials
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-1.5">
                <span className="text-[10px] uppercase font-semibold text-stone-400 flex items-center justify-between">
                  <span>Pending Check</span>
                  <CheckCheck className="w-3.5 h-3.5 text-stone-400" />
                </span>
                <p className="font-serif text-2xl font-bold text-stone-900">
                  {shagunList.filter((s) => !s.confirmedByCouple).length} Unverified
                </p>
                <button
                  onClick={() => setActiveTab('ledger')}
                  className="text-[11px] text-stone-800 underline font-medium"
                >
                  Verify in Ledger →
                </button>
              </div>
            </div>

            {/* Recent list */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-medium text-stone-900">
                    Latest Blessings & Shagun
                  </h3>
                  <button
                    onClick={() => setActiveTab('ledger')}
                    className="text-xs text-stone-600 hover:text-stone-900 underline"
                  >
                    View All ({shagunList.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {shagunList.slice(0, 4).map((s) => (
                    <div 
                      key={s.id}
                      className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-stone-900">
                            {s.guestName}
                          </span>
                          <span className="font-mono text-stone-700 font-bold">
                            {formatINR(s.amount)}
                          </span>
                        </div>
                        <p className="text-stone-500 italic line-clamp-1 mt-0.5 font-light">
                          "{s.message}"
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {s.confirmedByCouple ? (
                          <span className="px-2 py-0.5 bg-stone-200 text-stone-800 rounded text-[11px] font-medium flex items-center gap-1">
                            <Check className="w-3 h-3" /> Received
                          </span>
                        ) : (
                          <button
                            onClick={() => onToggleShagunReceived(s.id)}
                            className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-[11px] font-medium transition-colors"
                          >
                            Mark Received
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
                <h3 className="font-serif text-lg font-medium text-stone-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-500" />
                  Active 48h Holds
                </h3>

                <p className="text-xs text-stone-500 leading-relaxed font-light">
                  Items on hold for guests checking out. Automatically returned to Available if not confirmed within 48h.
                </p>

                <div className="space-y-2">
                  {items.filter((i) => i.status === 'reserved').length > 0 ? (
                    items
                      .filter((i) => i.status === 'reserved')
                      .map((item) => (
                        <div 
                          key={item.id}
                          className="p-3 bg-white rounded-xl border border-stone-200 text-xs space-y-1"
                        >
                          <div className="font-medium text-stone-900 line-clamp-1">{item.title}</div>
                          <div className="flex items-center justify-between text-stone-400 text-[11px]">
                            <span>Held for: {item.reservedBy?.name || 'Guest'}</span>
                            <button
                              onClick={() => onManuallyReleaseReservation(item.id)}
                              className="text-stone-700 hover:underline"
                            >
                              Release
                            </button>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="p-4 bg-white rounded-xl text-center text-xs text-stone-400 border border-stone-200">
                      No active holds.
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('add_item')}
                    className="w-full py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Item to Registry</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADD ITEM VIA URL */}
        {activeTab === 'add_item' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
            <div>
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                Registry Builder
              </div>
              <h2 className="font-serif text-2xl font-medium text-stone-900">
                Add Product by Link
              </h2>
              <p className="text-xs text-stone-500 mt-1 font-light">
                Paste any URL from Amazon, Croma, Pepperfry, Myntra, or IKEA.
              </p>
            </div>

            {/* Quick Demo Templates */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
              <span className="text-[10px] font-semibold text-stone-400 uppercase block">
                Sample Items (Click to Auto-fill):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_CATALOG_ITEMS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLoadPreset(preset)}
                    className="text-xs px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-stone-700 transition-colors"
                  >
                    + {preset.title.slice(0, 22)}... ({preset.store})
                  </button>
                ))}
              </div>
            </div>

            {/* URL Input & Fetch Button */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-stone-600">
                Product URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={pastedUrl}
                  onChange={(e) => setPastedUrl(e.target.value)}
                  placeholder="https://www.amazon.in/dp/..."
                  className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
                <button
                  type="button"
                  onClick={handleSimulateUrlFetch}
                  disabled={!pastedUrl.trim() || isFetchingUrl}
                  className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white rounded-lg text-xs font-medium shrink-0 transition-colors"
                >
                  {isFetchingUrl ? 'Fetching...' : 'Fetch'}
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleAddNewItemSubmit} className="space-y-4 pt-2 border-t border-stone-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    placeholder="Product name"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Store *
                  </label>
                  <select
                    value={itemStore}
                    onChange={(e) => setItemStore(e.target.value as StoreName)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                  >
                    <option value="Amazon">Amazon India</option>
                    <option value="Croma">Croma Electronics</option>
                    <option value="Pepperfry">Pepperfry</option>
                    <option value="Myntra">Myntra</option>
                    <option value="IKEA">IKEA India</option>
                    <option value="Nykaa">Nykaa</option>
                    <option value="Other">Other Store</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Price in INR (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 14999"
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                  >
                    <option value="Kitchen & Dining">Kitchen & Dining</option>
                    <option value="Home & Living">Home & Living</option>
                    <option value="Electronics & Appliances">Electronics & Appliances</option>
                    <option value="Bed & Bath">Bed & Bath</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={itemPriority}
                    onChange={(e) => setItemPriority(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                  >
                    <option value="must_have">Essential (Top)</option>
                    <option value="standard">Standard</option>
                    <option value="nice_to_have">Nice-to-Have</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={itemImage}
                  onChange={(e) => setItemImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="font-medium text-stone-900 text-xs block">
                    Group Gifting
                  </span>
                  <span className="text-[11px] text-stone-500 font-light">
                    Allow multiple friends to chip in ₹ toward this item.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isGroupGift}
                  onChange={(e) => setIsGroupGift(e.target.checked)}
                  className="w-4 h-4 text-stone-900 rounded"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Notes for Guests (Optional)
                </label>
                <input
                  type="text"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="e.g. Color preference"
                  className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              {addItemSuccess && (
                <div className="p-2.5 bg-stone-100 border border-stone-300 text-stone-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Item added to registry!
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add Item to Registry
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: GIFT & SHAGUN LEDGER */}
        {activeTab === 'ledger' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-normal text-stone-900">
                  Gift & Shagun Ledger
                </h2>
                <p className="text-xs text-stone-500 font-light">
                  Track payments, verify incoming UPI transfers, and manage thank-you notes.
                </p>
              </div>

              <button
                onClick={() => exportGiftsToCSV(items, shagunList, wedding)}
                className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export to CSV</span>
              </button>
            </div>

            {/* Shagun Table */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="px-5 py-3 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
                <span className="font-medium text-stone-900 text-xs">
                  Direct UPI Shagun ({shagunList.length})
                </span>
                <span className="text-xs text-stone-500">
                  Total: <strong className="text-stone-900">{formatINR(confirmedShagunTotal + pendingShagunTotal)}</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-4">Guest</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4">Note</th>
                      <th className="py-2.5 px-4">Ref / UTR</th>
                      <th className="py-2.5 px-4">Verification</th>
                      <th className="py-2.5 px-4 text-right">Thank You</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {shagunList.map((s) => (
                      <tr key={s.id} className="hover:bg-stone-50/50">
                        <td className="py-2.5 px-4 font-medium text-stone-900">
                          <div>{s.guestName}</div>
                          <div className="text-[10px] text-stone-400 font-normal">{s.guestPhone}</div>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-stone-900">
                          {formatINR(s.amount)}
                        </td>
                        <td className="py-2.5 px-4 italic text-stone-500 max-w-xs truncate font-light">
                          "{s.message}"
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-stone-400">
                          {s.utr || 'N/A'}
                        </td>
                        <td className="py-2.5 px-4">
                          <button
                            onClick={() => onToggleShagunReceived(s.id)}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                              s.confirmedByCouple
                                ? 'bg-stone-200 text-stone-800'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                          >
                            {s.confirmedByCouple ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" /> Received
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" /> Mark Received
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            onClick={() => onToggleShagunThankYou(s.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                              s.thankYouSent ? 'bg-stone-200 text-stone-800' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                            }`}
                          >
                            {s.thankYouSent ? 'Sent' : 'Mark Sent'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Group Gift Contributions Table */}
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="px-5 py-3 border-b border-stone-200 bg-stone-50/70">
                <span className="font-medium text-stone-900 text-xs">
                  Group Gifting Shares
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-4">Item</th>
                      <th className="py-2.5 px-4">Contributor</th>
                      <th className="py-2.5 px-4">Amount</th>
                      <th className="py-2.5 px-4">UTR Ref</th>
                      <th className="py-2.5 px-4">Date</th>
                      <th className="py-2.5 px-4 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {items
                      .filter((i) => i.isGroupGift && i.contributions.length > 0)
                      .flatMap((item) =>
                        item.contributions.map((c) => (
                          <tr key={c.id} className="hover:bg-stone-50/50">
                            <td className="py-2.5 px-4 font-medium text-stone-900 max-w-xs truncate">
                              {item.title}
                            </td>
                            <td className="py-2.5 px-4">
                              <span className="font-medium text-stone-800">{c.guestName}</span>
                              <span className="block text-[10px] text-stone-400">{c.guestPhone}</span>
                            </td>
                            <td className="py-2.5 px-4 font-mono font-bold text-stone-900">
                              {formatINR(c.amount)}
                            </td>
                            <td className="py-2.5 px-4 font-mono text-[11px] text-stone-400">
                              {c.utr || 'Direct UPI'}
                            </td>
                            <td className="py-2.5 px-4 text-stone-400">{c.date}</td>
                            <td className="py-2.5 px-4 text-right">
                              <button
                                onClick={() => onToggleContributionReceived(item.id, c.id)}
                                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                  c.confirmedByCouple
                                    ? 'bg-stone-200 text-stone-800'
                                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                              >
                                {c.confirmedByCouple ? 'Received' : 'Mark Received'}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MANAGE REGISTRY ITEMS */}
        {activeTab === 'manage_items' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-normal text-stone-900">
                  Manage Wishlist ({items.length})
                </h2>
                <p className="text-xs text-stone-500 font-light">
                  Review items, adjust priorities, or release reserved holds.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('add_item')}
                className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="flex gap-3">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-16 h-16 object-cover rounded-lg border border-stone-200 shrink-0 bg-stone-50"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-semibold text-stone-400 uppercase">
                        {item.store} • {item.category}
                      </span>
                      <h4 className="font-serif text-sm font-medium text-stone-900 line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="font-serif font-bold text-stone-900 text-sm mt-0.5">
                        {formatINR(item.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-stone-100 text-stone-700">
                      {item.status.toUpperCase()}
                      {item.isGroupGift && ' (GROUP)'}
                    </span>

                    <div className="flex items-center gap-2">
                      {item.status === 'reserved' && (
                        <button
                          onClick={() => onManuallyReleaseReservation(item.id)}
                          className="text-[11px] text-stone-700 hover:underline"
                        >
                          Release Hold
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
            <div>
              <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                Registry Setup
              </div>
              <h2 className="font-serif text-2xl font-normal text-stone-900">
                Couple & Delivery Settings
              </h2>
              <p className="text-xs text-stone-500 mt-1 font-light">
                Configure your UPI details and delivery address. Dates and destinations can be left blank.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              {/* Names & Story */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <span className="text-xs font-semibold uppercase text-stone-500 tracking-wider block">
                  Couple Information
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Bride Name</label>
                    <input
                      type="text"
                      value={editedWedding.brideName}
                      onChange={(e) => setEditedWedding({ ...editedWedding, brideName: e.target.value })}
                      placeholder="e.g. Oyeshi"
                      className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Groom Name</label>
                    <input
                      type="text"
                      value={editedWedding.groomName}
                      onChange={(e) => setEditedWedding({ ...editedWedding, groomName: e.target.value })}
                      placeholder="e.g. Nishant"
                      className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Story / Note to Guests</label>
                  <textarea
                    rows={2}
                    value={editedWedding.story}
                    onChange={(e) => setEditedWedding({ ...editedWedding, story: e.target.value })}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 font-light"
                  />
                </div>

                {/* Optional Date & Destination */}
                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-stone-200">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Date (Leave blank if unfinalised)
                    </label>
                    <input
                      type="date"
                      value={editedWedding.weddingDate}
                      onChange={(e) => setEditedWedding({ ...editedWedding, weddingDate: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Destination / Venue (Leave blank if unfinalised)
                    </label>
                    <input
                      type="text"
                      value={editedWedding.venue}
                      onChange={(e) => setEditedWedding({ ...editedWedding, venue: e.target.value })}
                      placeholder="e.g. To be announced"
                      className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                </div>
              </div>

              {/* UPI Details */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <span className="text-xs font-semibold uppercase text-stone-500 tracking-wider block">
                  UPI Details (Direct to Bank)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Couple's UPI ID (VPA) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editedWedding.upiId}
                      onChange={(e) => setEditedWedding({ ...editedWedding, upiId: e.target.value })}
                      placeholder="e.g. oyeshi.nishant@upi"
                      className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      UPI Payee Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={editedWedding.upiPayeeName}
                      onChange={(e) => setEditedWedding({ ...editedWedding, upiPayeeName: e.target.value })}
                      placeholder="e.g. Oyeshi & Nishant"
                      className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <span className="text-xs font-semibold uppercase text-stone-500 tracking-wider block">
                  Delivery Address (Given to Guests at Checkout)
                </span>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Recipient Name *</label>
                  <input
                    type="text"
                    required
                    value={editedWedding.deliveryAddress.recipientName}
                    onChange={(e) => setEditedWedding({
                      ...editedWedding,
                      deliveryAddress: { ...editedWedding.deliveryAddress, recipientName: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Address Line 1 *</label>
                    <input
                      type="text"
                      required
                      value={editedWedding.deliveryAddress.line1}
                      onChange={(e) => setEditedWedding({
                        ...editedWedding,
                        deliveryAddress: { ...editedWedding.deliveryAddress, line1: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">Line 2 / Area</label>
                    <input
                      type="text"
                      value={editedWedding.deliveryAddress.line2}
                      onChange={(e) => setEditedWedding({
                        ...editedWedding,
                        deliveryAddress: { ...editedWedding.deliveryAddress, line2: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={editedWedding.deliveryAddress.city}
                      onChange={(e) => setEditedWedding({
                        ...editedWedding,
                        deliveryAddress: { ...editedWedding.deliveryAddress, city: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={editedWedding.deliveryAddress.state}
                      onChange={(e) => setEditedWedding({
                        ...editedWedding,
                        deliveryAddress: { ...editedWedding.deliveryAddress, state: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">PIN *</label>
                    <input
                      type="text"
                      required
                      value={editedWedding.deliveryAddress.pincode}
                      onChange={(e) => setEditedWedding({
                        ...editedWedding,
                        deliveryAddress: { ...editedWedding.deliveryAddress, pincode: e.target.value }
                      })}
                      className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={editedWedding.deliveryAddress.phone}
                    onChange={(e) => setEditedWedding({
                      ...editedWedding,
                      deliveryAddress: { ...editedWedding.deliveryAddress, phone: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                  />
                </div>
              </div>

              {settingsSaved && (
                <div className="p-2.5 bg-stone-100 border border-stone-300 text-stone-800 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Settings saved successfully!
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
