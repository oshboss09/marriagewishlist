import QRCode from 'qrcode';

/**
 * Formats a number to Indian Rupee notation (e.g. ₹1,49,990)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Generates a standard NPCI UPI Deep Link URL for direct mobile app intents (GPay, PhonePe, Paytm, BHIM, etc.)
 */
export function buildUpiDeepLink({
  upiId,
  payeeName,
  amount,
  transactionNote = 'Wedding Gift',
}: {
  upiId: string;
  payeeName: string;
  amount?: number;
  transactionNote?: string;
}): string {
  const cleanUpi = encodeURIComponent(upiId.trim());
  const cleanName = encodeURIComponent(payeeName.trim());
  const cleanNote = encodeURIComponent(transactionNote.trim());

  let url = `upi://pay?pa=${cleanUpi}&pn=${cleanName}&tn=${cleanNote}&cu=INR`;
  if (amount && amount > 0) {
    url += `&am=${amount.toFixed(2)}`;
  }
  return url;
}

/**
 * Generates an SVG or PNG data URL for displaying an interactive QR Code
 */
export async function generateUpiQrCode(upiUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(upiUrl, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#262626',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate UPI QR code:', err);
    return '';
  }
}

/**
 * Calculates remaining hours and minutes for 48h reservation
 */
export function getReservationTimeRemaining(reservedUntilStr?: string): {
  isExpired: boolean;
  hours: number;
  minutes: number;
  seconds: number;
  formatted: string;
} {
  if (!reservedUntilStr) {
    return { isExpired: true, hours: 0, minutes: 0, seconds: 0, formatted: 'Expired' };
  }

  const now = new Date().getTime();
  const target = new Date(reservedUntilStr).getTime();
  const difference = target - now;

  if (difference <= 0) {
    return { isExpired: true, hours: 0, minutes: 0, seconds: 0, formatted: 'Expired' };
  }

  const hours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);

  const formatted = `${hours}h ${minutes}m ${seconds}s`;
  return { isExpired: false, hours, minutes, seconds, formatted };
}

/**
 * Helper to copy text to clipboard with modern API and fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.warn('Copy failed:', err);
    return false;
  }
}
