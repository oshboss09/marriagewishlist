import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Lock, 
  ShieldCheck, 
  QrCode as QrIcon,
  Download,
  Users,
  Settings2,
  KeyRound,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Wedding } from '../types';
import { copyToClipboard } from '../utils/upi';

interface ShareAccessModalProps {
  wedding: Wedding;
  isOpen: boolean;
  onClose: () => void;
  onSwitchToCoupleMode: () => void;
  currentRole: 'guest' | 'couple';
}

export const ShareAccessModal: React.FC<ShareAccessModalProps> = ({
  wedding,
  isOpen,
  onClose,
  onSwitchToCoupleMode,
  currentRole,
}) => {
  const [activeTab, setActiveTab] = useState<'guest' | 'admin'>('guest');
  const [copiedGuestLink, setCopiedGuestLink] = useState(false);
  const [copiedAdminLink, setCopiedAdminLink] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showPin, setShowPin] = useState(false);

  // Short, clean URLs
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-npp5cvwjy4kmvglciing5i-26138510468.asia-southeast1.run.app';
  // Small, clean guest URL without query params
  const guestUrl = `${origin}/`;
  // Independent admin URL
  const adminUrl = `${origin}/?admin=true`;
  const adminPin = wedding.adminPin || '2026';

  // Generate dynamic QR Code for guest invite
  useEffect(() => {
    if (isOpen && guestUrl) {
      QRCode.toDataURL(guestUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#4A1521',
          light: '#FAF7F2',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [isOpen, guestUrl]);

  if (!isOpen) return null;

  const handleCopyGuestLink = async () => {
    const success = await copyToClipboard(guestUrl);
    if (success) {
      setCopiedGuestLink(true);
      setTimeout(() => setCopiedGuestLink(false), 2000);
    }
  };

  const handleCopyAdminLink = async () => {
    const success = await copyToClipboard(adminUrl);
    if (success) {
      setCopiedAdminLink(true);
      setTimeout(() => setCopiedAdminLink(false), 2000);
    }
  };

  const handleCopyPin = async () => {
    const success = await copyToClipboard(adminPin);
    if (success) {
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const message = `Namaste! 🌸\n\n${wedding.brideName} and ${wedding.groomName} have put together their wishlist for their new home together:\n\n✨ Browse wishlist items & gift from stores (Amazon, Croma, etc.)\n✨ Or send a blessing via direct UPI\n\nView our wishlist here:\n${guestUrl}\n\nWith love,\n${wedding.brideName} & ${wedding.groomName}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `oyeshi-nishant-wishlist-qr.png`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#FCFAF6] border border-[#D5C7B5] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#8A7B70] hover:text-[#2C2420] rounded-full hover:bg-[#EFE8DD] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EDE4] border border-[#DDD2C4] text-[10px] font-medium tracking-[0.25em] text-[#9C7A4E] uppercase">
            <Lock className="w-3 h-3 text-[#7A1F2D]" />
            <span>Couple Admin Tool</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#2C2420]">
            Invite Guests & Share Links
          </h2>
          <p className="text-xs text-[#6B5E55] max-w-md mx-auto font-light leading-relaxed">
            Copy the clean guest link or QR code to send to friends and family.
          </p>
        </div>

        {/* 403 / Account Permission Explanation */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-900 space-y-1.5">
          <div className="font-semibold flex items-center gap-1.5 text-xs text-amber-950">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Opening in a new Chrome window or different Google account?</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-relaxed font-light">
            Because this app is hosted in Google Cloud Run, it recognizes your primary Google account. If opened under a different Google account or in Incognito, Google Cloud will show <strong>403 Forbidden</strong> until you click the <strong>"Share"</strong> button in the top-right toolbar of Google AI Studio and toggle access to <strong>"Anyone with the link"</strong>.
          </p>
        </div>

        {/* Access Role Tabs */}
        <div className="flex p-1 bg-[#EFE8DD] rounded-2xl">
          <button
            onClick={() => setActiveTab('guest')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'guest'
                ? 'bg-white text-[#4A1521] shadow-xs font-semibold'
                : 'text-[#6B5E55] hover:text-[#2C2420]'
            }`}
          >
            <Users className="w-4 h-4 text-[#7A1F2D]" />
            <span>For Common People (Guest Link)</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'admin'
                ? 'bg-[#4A1521] text-[#FAF7F2] shadow-xs font-semibold'
                : 'text-[#6B5E55] hover:text-[#2C2420]'
            }`}
          >
            <Lock className="w-4 h-4 text-[#C5A880]" />
            <span>For Couple (Admin Link)</span>
          </button>
        </div>

        {/* TAB 1: GUEST LINK (COMMON PEOPLE) */}
        {activeTab === 'guest' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Direct URL Box */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E0D5C7] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#9C7A4E]">
                  Guest Wishlist Link (Short & Clean)
                </span>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Public & Safe for All Relatives
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white px-3.5 py-2.5 rounded-xl border border-[#D5C7B5] font-mono text-xs text-[#2C2420] truncate select-all">
                  {guestUrl}
                </div>
                <button
                  onClick={handleCopyGuestLink}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 shrink-0 transition-colors ${
                    copiedGuestLink
                      ? 'bg-[#EBF3ED] border-[#C2DEC9] text-[#22543D]'
                      : 'bg-[#4A1521] hover:bg-[#3A101A] text-white border-transparent'
                  }`}
                >
                  {copiedGuestLink ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedGuestLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>

              {/* 1-Click WhatsApp Share */}
              <button
                onClick={handleWhatsAppShare}
                className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20BE5B] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share via WhatsApp (Pre-composed Invite)</span>
              </button>
            </div>

            {/* QR Code Section for Physical Wedding Cards */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E0D5C7] flex flex-col sm:flex-row items-center gap-5">
              <div className="p-2.5 bg-white rounded-xl border border-[#D5C7B5] shadow-xs shrink-0">
                {qrDataUrl ? (
                  <img 
                    src={qrDataUrl} 
                    alt="Wishlist QR Code" 
                    className="w-28 h-28 object-contain"
                  />
                ) : (
                  <div className="w-28 h-28 flex items-center justify-center text-xs text-stone-400">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-medium text-[#4A1521]">
                  <QrIcon className="w-4 h-4 text-[#9C7A4E]" />
                  <span>Printable Card QR Code</span>
                </div>
                <p className="text-xs text-[#6B5E55] font-light leading-relaxed">
                  Print this QR code on physical invitations or attach it to digital e-invites so aunties, uncles, and friends can simply scan their phone camera to open the wishlist.
                </p>
                <button
                  onClick={handleDownloadQr}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F3EDE4] border border-[#D5C7B5] rounded-lg text-xs font-medium text-[#4A1521] transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-[#9C7A4E]" />
                  <span>Save QR Image (.png)</span>
                </button>
              </div>
            </div>

            {/* Permissions Breakdown for Common People */}
            <div className="p-4 bg-[#F8F4EE] rounded-2xl border border-[#E6DCCD] space-y-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9C7A4E] block">
                What Common Guests Experience
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#5A4D45]">
                <div className="space-y-1">
                  <div className="font-medium text-[#2C2420] flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Guest Capabilities:</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-[#6B5E55] space-y-0.5 font-light">
                    <li>Browse curated wishlist pieces</li>
                    <li>Click "I'll Gift This" (holds item for 48 hrs)</li>
                    <li>Copy delivery address for store checkout</li>
                    <li>Contribute any amount to group goals</li>
                    <li>Send blessings straight via UPI</li>
                  </ul>
                </div>

                <div className="space-y-1">
                  <div className="font-medium text-[#2C2420] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#9C7A4E]" />
                    <span>Security Protections:</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-[#6B5E55] space-y-0.5 font-light">
                    <li>No couple admin controls visible</li>
                    <li>Cannot edit or delete wishlist items</li>
                    <li>Cannot alter couple's bank UPI</li>
                    <li>Zero login friction for guests</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COUPLE ADMIN LINK (OYESHI & NISHANT) */}
        {activeTab === 'admin' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Direct Admin URL Box */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E0D5C7] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#9C7A4E]">
                  Private Couple Link (Independent Link)
                </span>
                <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Protected with Passcode
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white px-3.5 py-2.5 rounded-xl border border-[#D5C7B5] font-mono text-xs text-[#2C2420] truncate select-all">
                  {adminUrl}
                </div>
                <button
                  onClick={handleCopyAdminLink}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 shrink-0 transition-colors ${
                    copiedAdminLink
                      ? 'bg-[#EBF3ED] border-[#C2DEC9] text-[#22543D]'
                      : 'bg-white hover:bg-[#F6F1EA] border-[#D5C7B5] text-[#4A1521]'
                  }`}
                >
                  {copiedAdminLink ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAdminLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Passcode Card */}
            <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#E0D5C7] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-[#4A1521]">
                  <KeyRound className="w-4 h-4 text-[#9C7A4E]" />
                  <span>Couple Admin Passcode (PIN)</span>
                </div>
                <button
                  onClick={() => setShowPin(!showPin)}
                  className="text-[11px] text-[#7A1F2D] hover:underline"
                >
                  {showPin ? 'Hide PIN' : 'Reveal PIN'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#D5C7B5]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg tracking-[0.3em] font-bold text-[#4A1521]">
                    {showPin ? adminPin : '••••'}
                  </span>
                  <span className="text-[11px] text-[#8A7B70] font-light">
                    (Default: 2026)
                  </span>
                </div>

                <button
                  onClick={handleCopyPin}
                  className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F3EDE4] border border-[#D5C7B5] rounded-lg text-xs font-medium text-[#4A1521] flex items-center gap-1 transition-colors"
                >
                  {copiedPin ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#9C7A4E]" />}
                  <span>{copiedPin ? 'Copied' : 'Copy PIN'}</span>
                </button>
              </div>
            </div>

            {/* Quick Switch Button */}
            <div className="pt-2">
              <button
                onClick={() => {
                  onSwitchToCoupleMode();
                  onClose();
                }}
                className="w-full py-3 px-4 bg-[#4A1521] hover:bg-[#3A101A] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Settings2 className="w-4 h-4 text-[#D8C7B5]" />
                <span>Open Couple Admin Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            {/* Admin Capabilities */}
            <div className="p-4 bg-[#F8F4EE] rounded-2xl border border-[#E6DCCD] space-y-2 text-xs text-[#5A4D45]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9C7A4E] block">
                Couple Dashboard Capabilities
              </span>
              <ul className="list-disc list-inside text-[11px] text-[#6B5E55] space-y-1 font-light">
                <li><strong>Add Products:</strong> Paste URLs from Amazon, Croma, Pepperfry, Myntra, IKEA.</li>
                <li><strong>Private Ledger:</strong> Check incoming UPI transfers, verify bank deposits, and send thank-you notes.</li>
                <li><strong>Hold Overrides:</strong> See 48-hr reservations and manually release if needed.</li>
                <li><strong>Settings:</strong> Update story, delivery address, UPI ID, or destination/date once finalised.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="text-center pt-2 border-t border-[#EFE8DD] text-[11px] text-[#8A7B70] font-light">
          Oyeshi & Nishant • Curated Wishlist
        </div>
      </div>
    </div>
  );
};
