import React, { useState, useEffect } from 'react';
import { Wedding, RegistryItem, ShagunGift, GuestProfile } from './types';
import { 
  loadWedding, 
  saveWedding, 
  loadItems, 
  saveItems, 
  loadShagun, 
  saveShagun, 
  loadGuest, 
  saveGuest 
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { WeddingHero } from './components/WeddingHero';
import { WishlistSection } from './components/WishlistSection';
import { BlessingWall } from './components/BlessingWall';
import { CoupleDashboard } from './components/CoupleDashboard';
import { ReserveModal } from './components/ReserveModal';
import { GroupGiftModal } from './components/GroupGiftModal';
import { ShagunModal } from './components/ShagunModal';
import { DeliveryAddressDrawer } from './components/DeliveryAddressDrawer';
import { GuestLoginModal } from './components/GuestLoginModal';
import { 
  ShieldCheck, 
  HelpCircle, 
  Gift, 
  Heart, 
  Sparkles, 
  QrCode, 
  ChevronUp, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

export default function App() {
  const [wedding, setWedding] = useState<Wedding>(loadWedding);
  const [items, setItems] = useState<RegistryItem[]>(loadItems);
  const [shagunList, setShagunList] = useState<ShagunGift[]>(loadShagun);
  const [currentGuest, setCurrentGuest] = useState<GuestProfile>(loadGuest);
  const [currentRole, setCurrentRole] = useState<'guest' | 'couple'>('guest');

  // Modal visibility states
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [isGuestLoginOpen, setIsGuestLoginOpen] = useState(false);
  const [isShagunModalOpen, setIsShagunModalOpen] = useState(false);
  const [selectedReserveItem, setSelectedReserveItem] = useState<RegistryItem | null>(null);
  const [selectedGroupItem, setSelectedGroupItem] = useState<RegistryItem | null>(null);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Sync to local storage whenever core state changes
  useEffect(() => {
    saveWedding(wedding);
  }, [wedding]);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  useEffect(() => {
    saveShagun(shagunList);
  }, [shagunList]);

  useEffect(() => {
    saveGuest(currentGuest);
  }, [currentGuest]);

  const showToast = (message: string) => {
    setNotificationToast(message);
    setTimeout(() => {
      setNotificationToast(null);
    }, 3500);
  };

  // 1. Reserve item for 48 hours
  const handleReserve = (itemId: string, guestName: string, guestPhone: string) => {
    const now = new Date();
    const until = new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString();

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            status: 'reserved',
            reservedBy: {
              name: guestName,
              phone: guestPhone,
              reservedAt: now.toISOString(),
              reservedUntil: until,
            },
          };
        }
        return item;
      })
    );

    // Update selected item in modal so modal switches to step 2/3
    setSelectedReserveItem((prev) =>
      prev?.id === itemId
        ? {
            ...prev,
            status: 'reserved',
            reservedBy: {
              name: guestName,
              phone: guestPhone,
              reservedAt: now.toISOString(),
              reservedUntil: until,
            },
          }
        : prev
    );

    showToast(`Reserved for 48 hours! Locked exclusively for ${guestName}.`);
  };

  // 2. Cancel 48-hr hold (release back to available)
  const handleCancelReservation = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            status: 'available',
            reservedBy: undefined,
          };
        }
        return item;
      })
    );
    setSelectedReserveItem(null);
    showToast('Hold cancelled. Item is now available for other guests.');
  };

  // 3. Confirm purchase on store
  const handleConfirmPurchase = (itemId: string, orderId: string, note: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            status: 'gifted',
            giftedBy: {
              name: item.reservedBy?.name || currentGuest.name,
              phone: item.reservedBy?.phone || currentGuest.phone,
              orderId,
              store: item.store,
              note,
              date: new Date().toISOString().slice(0, 10),
            },
          };
        }
        return item;
      })
    );
    showToast('Gift marked as purchased! Congratulations note added.');
  };

  // 4. Fast forward expiry (testing helper)
  const handleFastForwardExpiry = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            status: 'available',
            reservedBy: undefined,
          };
        }
        return item;
      })
    );
    setSelectedReserveItem(null);
    showToast('Reservation expired. Item returned to Available.');
  };

  const handleFastForwardAllReservations = () => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.status === 'reserved') {
          return {
            ...item,
            status: 'available',
            reservedBy: undefined,
          };
        }
        return item;
      })
    );
    showToast('Fast-forwarded 48 hours: All expired holds reverted to Available!');
  };

  // 5. Contribute to group gift
  const handleContribute = (
    itemId: string,
    guestName: string,
    guestPhone: string,
    amount: number,
    utr?: string
  ) => {
    const contributionId = `contrib-${Date.now()}`;
    const dateStr = new Date().toISOString().slice(0, 10);

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newContributions = [
            ...item.contributions,
            {
              id: contributionId,
              guestName,
              guestPhone,
              amount,
              date: dateStr,
              utr,
              confirmedByCouple: false,
            },
          ];
          const newRaised = item.groupRaisedAmount + amount;
          const goal = item.groupGoalAmount || item.price;
          const isFunded = newRaised >= goal;

          return {
            ...item,
            groupRaisedAmount: newRaised,
            contributions: newContributions,
            status: isFunded ? 'gifted' : item.status,
            giftedBy: isFunded
              ? {
                  name: 'Group of Friends',
                  store: item.store,
                  note: 'Fully funded by multiple friends via group contributions!',
                  date: dateStr,
                }
              : item.giftedBy,
          };
        }
        return item;
      })
    );

    showToast(`Thank you ${guestName}! Contribution of ₹${amount} recorded.`);
  };

  // 6. Send Shagun Blessing
  const handleSendShagun = (
    giftData: Omit<ShagunGift, 'id' | 'createdAt' | 'confirmedByCouple' | 'thankYouSent'>
  ) => {
    const newGift: ShagunGift = {
      ...giftData,
      id: `shagun-${Date.now()}`,
      createdAt: new Date().toISOString(),
      confirmedByCouple: false,
      thankYouSent: false,
    };

    setShagunList((prev) => [newGift, ...prev]);
    showToast(`Blessing & Shagun received! Added to ${wedding.brideName} & ${wedding.groomName}'s gift wall.`);
  };

  // 7. Couple Dashboard Handlers
  const handleAddItem = (
    itemData: Omit<RegistryItem, 'id' | 'weddingId' | 'groupRaisedAmount' | 'contributions' | 'status'>
  ) => {
    const newItem: RegistryItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      weddingId: wedding.id,
      groupRaisedAmount: 0,
      contributions: [],
      status: 'available',
    };
    setItems((prev) => [newItem, ...prev]);
    showToast(`Added "${newItem.title}" to wedding registry!`);
  };

  const handleDeleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    showToast('Item removed from registry.');
  };

  const handleToggleShagunReceived = (shagunId: string) => {
    setShagunList((prev) =>
      prev.map((s) => {
        if (s.id === shagunId) {
          const nextState = !s.confirmedByCouple;
          showToast(nextState ? 'Marked as Received in Bank!' : 'Marked as Pending.');
          return { ...s, confirmedByCouple: nextState };
        }
        return s;
      })
    );
  };

  const handleToggleShagunThankYou = (shagunId: string) => {
    setShagunList((prev) =>
      prev.map((s) => (s.id === shagunId ? { ...s, thankYouSent: !s.thankYouSent } : s))
    );
  };

  const handleToggleContributionReceived = (itemId: string, contributionId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            contributions: item.contributions.map((c) =>
              c.id === contributionId ? { ...c, confirmedByCouple: !c.confirmedByCouple } : c
            ),
          };
        }
        return item;
      })
    );
    showToast('Contribution status updated.');
  };

  const handleManuallyReleaseReservation = (itemId: string) => {
    handleFastForwardExpiry(itemId);
  };

  const scrollToRegistry = () => {
    const el = document.getElementById('registry-wishlist');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToWall = () => {
    const el = document.getElementById('blessings-wall');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2420] flex flex-col font-sans selection:bg-[#E8DFD5] selection:text-[#4A1521]">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-[#4A1521] text-[#FAF7F2] text-xs font-medium rounded-2xl shadow-2xl border border-[#9C7A4E]/40 flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        wedding={wedding}
        currentGuest={currentGuest}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        onOpenAddressDrawer={() => setIsAddressDrawerOpen(true)}
        onOpenGuestLogin={() => setIsGuestLoginOpen(true)}
        onFastForwardAllReservations={handleFastForwardAllReservations}
      />

      {/* Main Body: Guest View or Couple Dashboard */}
      {currentRole === 'couple' ? (
        <CoupleDashboard
          wedding={wedding}
          items={items}
          shagunList={shagunList}
          onUpdateWedding={setWedding}
          onAddItem={handleAddItem}
          onDeleteItem={handleDeleteItem}
          onToggleShagunReceived={handleToggleShagunReceived}
          onToggleShagunThankYou={handleToggleShagunThankYou}
          onToggleContributionReceived={handleToggleContributionReceived}
          onManuallyReleaseReservation={handleManuallyReleaseReservation}
          onSwitchToGuestView={() => setCurrentRole('guest')}
        />
      ) : (
        <main className="flex-1">
          {/* Hero Section */}
          <WeddingHero
            wedding={wedding}
            onOpenShagun={() => setIsShagunModalOpen(true)}
            onOpenAddress={() => setIsAddressDrawerOpen(true)}
            onScrollToRegistry={scrollToRegistry}
            onScrollToWall={scrollToWall}
          />

          {/* Registry Wishlist Section */}
          <WishlistSection
            items={items}
            currentGuest={currentGuest}
            onOpenReserve={(item) => setSelectedReserveItem(item)}
            onOpenGroupGift={(item) => setSelectedGroupItem(item)}
            onFastForwardAllReservations={handleFastForwardAllReservations}
          />

          {/* Blessing & Gift Wall */}
          <BlessingWall
            shagunList={shagunList}
            registryItems={items}
            wedding={wedding}
            onOpenShagunModal={() => setIsShagunModalOpen(true)}
          />

          {/* Clean Informational FAQ */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-[#E6DCCD]">
            <div className="bg-[#FCFAF6] rounded-3xl border border-[#E6DCCD] p-7 sm:p-10 shadow-xs space-y-6">
              <div className="text-[11px] text-[#9C7A4E] font-medium uppercase tracking-[0.2em]">
                Registry Information
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#2C2420]">
                Frequently Asked Questions
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#6B5E55] leading-relaxed font-light">
                <div className="space-y-1.5 p-4.5 bg-[#F8F4EE] rounded-2xl border border-[#E6DCCD]">
                  <h4 className="font-medium text-[#4A1521] text-xs">
                    How do store orders work?
                  </h4>
                  <p>
                    When you click "I'll Gift This", we hold the item for 48 hours so others don't purchase the same gift. You copy the delivery address, click through to the retailer, and checkout there.
                  </p>
                </div>

                <div className="space-y-1.5 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <h4 className="font-medium text-stone-900 text-xs">
                    Does this site hold any money?
                  </h4>
                  <p>
                    <strong>No money touches this site.</strong> All cash Shagun and contributions transfer directly from your bank to the couple's bank via UPI QR codes and deep links. Zero fees are deducted.
                  </p>
                </div>

                <div className="space-y-1.5 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <h4 className="font-medium text-stone-900 text-xs">
                    What if I change my mind after reserving?
                  </h4>
                  <p>
                    If you don't confirm your order within 48 hours, the hold automatically expires and the item returns to Available for another friend.
                  </p>
                </div>

                <div className="space-y-1.5 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <h4 className="font-medium text-stone-900 text-xs">
                    Can I send Shagun anonymously?
                  </h4>
                  <p>
                    Yes. Choosing "Anonymous" displays you as "A Well-Wisher" on the public wall. Note that your legal name will appear on the couple's private bank statement as per banking rules.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Modals and Drawers */}
      <ReserveModal
        item={selectedReserveItem}
        wedding={wedding}
        currentGuest={currentGuest}
        isOpen={Boolean(selectedReserveItem)}
        onClose={() => setSelectedReserveItem(null)}
        onReserve={handleReserve}
        onCancelReservation={handleCancelReservation}
        onConfirmPurchase={handleConfirmPurchase}
        onFastForwardExpiry={handleFastForwardExpiry}
        onOpenAddressDrawer={() => {
          setSelectedReserveItem(null);
          setIsAddressDrawerOpen(true);
        }}
      />

      <GroupGiftModal
        item={selectedGroupItem}
        wedding={wedding}
        currentGuest={currentGuest}
        isOpen={Boolean(selectedGroupItem)}
        onClose={() => setSelectedGroupItem(null)}
        onContribute={handleContribute}
      />

      <ShagunModal
        wedding={wedding}
        currentGuest={currentGuest}
        isOpen={isShagunModalOpen}
        onClose={() => setIsShagunModalOpen(false)}
        onSendShagun={handleSendShagun}
      />

      <DeliveryAddressDrawer
        address={wedding.deliveryAddress}
        isOpen={isAddressDrawerOpen}
        onClose={() => setIsAddressDrawerOpen(false)}
      />

      <GuestLoginModal
        isOpen={isGuestLoginOpen}
        onClose={() => setIsGuestLoginOpen(false)}
        onLogin={setCurrentGuest}
        currentGuest={currentGuest}
      />

      {/* Footer */}
      <footer className="bg-[#240B11] text-[#D8C7B5] py-12 px-4 sm:px-6 lg:px-8 border-t border-[#4A1521] text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#4A1521] border border-[#9C7A4E]/40 flex items-center justify-center text-[#F5EFEB] font-serif text-xs font-normal tracking-widest shadow-xs">
              ON
            </div>
            <div>
              <p className="text-[#FAF7F2] font-serif font-medium text-sm">
                {wedding.brideName} <span className="font-editorial italic text-[#C5A880]">&</span> {wedding.groomName}
              </p>
              <p className="text-[11px] text-[#A69588] font-light">
                Wedding Registry & Direct UPI Shagun
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] text-[#A69588]">
            <span>Direct-to-Bank UPI</span>
            <span className="text-[#5A2530]">•</span>
            <span>External Retailer Linkouts</span>
            <span className="text-[#5A2530]">•</span>
            <span>48-Hour Collision Prevention</span>
          </div>

          <div className="text-center md:text-right text-[11px] text-[#A69588] font-light">
            With love, {wedding.brideName} & {wedding.groomName}
          </div>
        </div>
      </footer>
    </div>
  );
}
