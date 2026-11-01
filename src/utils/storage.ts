import { Wedding, RegistryItem, ShagunGift, GuestProfile } from '../types';
import { INITIAL_WEDDING, INITIAL_REGISTRY_ITEMS, INITIAL_SHAGUN_GIFTS, INITIAL_GUEST } from '../data/initialData';

const STORAGE_KEYS = {
  WEDDING: 'kalyanam_wedding',
  ITEMS: 'kalyanam_items',
  SHAGUN: 'kalyanam_shagun',
  GUEST: 'kalyanam_guest',
};

export function loadWedding(): Wedding {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WEDDING);
    if (data) {
      const parsed = JSON.parse(data);
      if (parsed.id === 'w-ananya-kabir-2026' || parsed.brideName !== 'Oyeshi') {
        saveWedding(INITIAL_WEDDING);
        return INITIAL_WEDDING;
      }
      if (!parsed.adminPin) {
        parsed.adminPin = '2026';
        saveWedding(parsed);
      }
      if (parsed.story && parsed.story.includes('We worked in Jio together')) {
        parsed.story = INITIAL_WEDDING.story;
        saveWedding(parsed);
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading wedding:', e);
  }
  return INITIAL_WEDDING;
}

export function saveWedding(wedding: Wedding) {
  try {
    localStorage.setItem(STORAGE_KEYS.WEDDING, JSON.stringify(wedding));
  } catch (e) {
    console.error('Error saving wedding:', e);
  }
}

export function loadItems(): RegistryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ITEMS);
    let items: RegistryItem[] = data ? JSON.parse(data) : INITIAL_REGISTRY_ITEMS;

    // Check if items belonged to the previous wedding demo
    if (items.some((i) => i.weddingId === 'w-ananya-kabir-2026')) {
      items = INITIAL_REGISTRY_ITEMS;
      saveItems(items);
      return items;
    }

    // Merge any missing initial items so new luxury items appear
    const existingIds = new Set(items.map((i) => i.id));
    const missingItems = INITIAL_REGISTRY_ITEMS.filter((i) => !existingIds.has(i.id));
    if (missingItems.length > 0) {
      items = [...items, ...missingItems];
      saveItems(items);
    }

    // Check for expired reservations and auto-revert to available
    const now = new Date().getTime();
    let hasChanges = false;

    items = items.map((item) => {
      if (item.status === 'reserved' && item.reservedBy?.reservedUntil) {
        const until = new Date(item.reservedBy.reservedUntil).getTime();
        if (now > until) {
          hasChanges = true;
          return {
            ...item,
            status: 'available' as const,
            reservedBy: undefined,
          };
        }
      }
      return item;
    });

    if (hasChanges) {
      saveItems(items);
    }
    return items;
  } catch (e) {
    console.error('Error loading items:', e);
    return INITIAL_REGISTRY_ITEMS;
  }
}

export function saveItems(items: RegistryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving items:', e);
  }
}

export function loadShagun(): ShagunGift[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SHAGUN);
    if (data) {
      const parsed: ShagunGift[] = JSON.parse(data);
      if (parsed.some((s) => s.weddingId === 'w-ananya-kabir-2026')) {
        saveShagun(INITIAL_SHAGUN_GIFTS);
        return INITIAL_SHAGUN_GIFTS;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading shagun:', e);
  }
  return INITIAL_SHAGUN_GIFTS;
}

export function saveShagun(shagun: ShagunGift[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SHAGUN, JSON.stringify(shagun));
  } catch (e) {
    console.error('Error saving shagun:', e);
  }
}

export function loadGuest(): GuestProfile {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GUEST);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Error loading guest:', e);
  }
  return INITIAL_GUEST;
}

export function saveGuest(guest: GuestProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.GUEST, JSON.stringify(guest));
  } catch (e) {
    console.error('Error saving guest:', e);
  }
}

export function resetAllDataToDefault() {
  localStorage.removeItem(STORAGE_KEYS.WEDDING);
  localStorage.removeItem(STORAGE_KEYS.ITEMS);
  localStorage.removeItem(STORAGE_KEYS.SHAGUN);
  localStorage.removeItem(STORAGE_KEYS.GUEST);
  window.location.reload();
}

/**
 * Downloads a CSV export of all gifts and Shagun cash blessings for the couple
 */
export function exportGiftsToCSV(items: RegistryItem[], shagunList: ShagunGift[], wedding: Wedding) {
  const headers = ['Type', 'Item/Description', 'Store/Method', 'Guest Name', 'Guest Phone', 'Amount (INR)', 'Status', 'UTR / Order ID', 'Date', 'Message/Notes', 'Thank You Sent'];
  
  const rows: (string | number)[][] = [];

  // 1. Shagun gifts
  shagunList.forEach((s) => {
    rows.push([
      'Shagun (Cash)',
      'Direct UPI Blessing',
      'UPI (' + wedding.upiId + ')',
      s.guestName + (s.visibility === 'anonymous_to_guests' ? ' [Anon on wall]' : ''),
      s.guestPhone,
      s.amount,
      s.confirmedByCouple ? 'Received' : 'Claimed (Pending Verification)',
      s.utr || 'N/A',
      new Date(s.createdAt).toLocaleDateString('en-IN'),
      `"${(s.message || '').replace(/"/g, '""')}"`,
      s.thankYouSent ? 'Yes' : 'No',
    ]);
  });

  // 2. Physical items & Group contributions
  items.forEach((item) => {
    if (item.status === 'gifted' && item.giftedBy) {
      rows.push([
        'Registry Item',
        `"${item.title.replace(/"/g, '""')}"`,
        item.store,
        item.giftedBy.name,
        item.giftedBy.phone || 'N/A',
        item.price,
        'Purchased',
        item.giftedBy.orderId || 'N/A',
        item.giftedBy.date,
        `"${(item.giftedBy.note || '').replace(/"/g, '""')}"`,
        'Yes',
      ]);
    }

    if (item.isGroupGift && item.contributions.length > 0) {
      item.contributions.forEach((c) => {
        rows.push([
          'Group Gift Share',
          `"${item.title.replace(/"/g, '""')}"`,
          'UPI Group Contribution',
          c.guestName,
          c.guestPhone,
          c.amount,
          c.confirmedByCouple ? 'Received' : 'Pending Verification',
          c.utr || 'N/A',
          c.date,
          'Group gift contribution',
          'Yes',
        ]);
      });
    }
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Wedding_Gift_Tracker_${wedding.slug}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
