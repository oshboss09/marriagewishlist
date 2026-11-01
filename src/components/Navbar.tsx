import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  MapPin, 
  Sliders, 
  RotateCcw, 
  Clock, 
  Eye, 
  Settings2
} from 'lucide-react';
import { Wedding, GuestProfile } from '../types';
import { copyToClipboard } from '../utils/upi';
import { resetAllDataToDefault } from '../utils/storage';

interface NavbarProps {
  wedding: Wedding;
  currentGuest: GuestProfile;
  currentRole: 'guest' | 'couple';
  onRoleChange: (role: 'guest' | 'couple') => void;
  onOpenAddressDrawer: () => void;
  onOpenGuestLogin: () => void;
  onFastForwardAllReservations: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  wedding,
  currentGuest,
  currentRole,
  onRoleChange,
  onOpenAddressDrawer,
  onOpenGuestLogin,
  onFastForwardAllReservations,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const handleCopyInviteLink = async () => {
    const inviteUrl = `${window.location.origin}/?wedding=${wedding.slug}`;
    const success = await copyToClipboard(inviteUrl);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E6DCCD]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Monogram & Names */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#4A1521] border border-[#9C7A4E]/30 flex items-center justify-center text-[#F5EFEB] font-serif text-xs font-normal tracking-widest shadow-xs">
            ON
          </div>
          <div>
            <div className="font-serif text-base font-normal tracking-tight text-[#2C2420]">
              {wedding.brideName} <span className="font-editorial italic text-[#7A1F2D]">&</span> {wedding.groomName}
            </div>
            <p className="text-[10px] text-[#8A7B70] tracking-widest uppercase font-light">
              Wedding Registry
            </p>
          </div>
        </div>

        {/* Center: Mode Switcher */}
        <div className="bg-[#EFE8DD] p-1 rounded-full flex items-center text-xs">
          <button
            onClick={() => onRoleChange('guest')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentRole === 'guest'
                ? 'bg-white text-[#4A1521] shadow-xs'
                : 'text-[#6B5E55] hover:text-[#2C2420]'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[#7A1F2D]" />
            <span>Guest View</span>
          </button>

          <button
            onClick={() => onRoleChange('couple')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              currentRole === 'couple'
                ? 'bg-[#4A1521] text-[#FAF7F2] shadow-xs'
                : 'text-[#6B5E55] hover:text-[#2C2420]'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Couple Dashboard</span>
          </button>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Copy Invite Link */}
          <button
            onClick={handleCopyInviteLink}
            className={`hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              copiedLink 
                ? 'bg-[#EBF3ED] border-[#C2DEC9] text-[#22543D]'
                : 'bg-white hover:bg-[#F6F1EA] border-[#E0D5C7] text-[#5A4D45]'
            }`}
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-[#9C7A4E]" />}
            <span>{copiedLink ? 'Link Copied' : 'Invite Link'}</span>
          </button>

          {/* Delivery Address */}
          <button
            onClick={onOpenAddressDrawer}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#F3EDE4] hover:bg-[#EAE0D4] text-[#4A1521] border border-[#DDD2C4] transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-[#7A1F2D]" />
            <span>Address</span>
          </button>

          {/* Guest Profile */}
          <button
            onClick={onOpenGuestLogin}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white border border-[#E0D5C7] text-[#4A1521] hover:bg-[#F8F4EE] transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-[#EFE8DD] text-[#4A1521] flex items-center justify-center text-[10px] font-serif font-medium">
              {currentGuest.name.charAt(0)}
            </div>
            <span className="hidden sm:inline max-w-[90px] truncate text-xs">{currentGuest.name}</span>
          </button>

          {/* Settings / Fast-Forward */}
          <div className="relative">
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="p-1.5 text-[#7A6D63] hover:text-[#2C2420] hover:bg-[#EFE8DD] rounded-lg transition-colors"
              title="Test tools"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {showDemoMenu && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E0D5C7] py-1.5 text-xs text-[#4A3E38] z-50 animate-in fade-in"
                onClick={() => setShowDemoMenu(false)}
              >
                <div className="px-3 py-1.5 border-b border-[#EFE8DD] font-medium uppercase text-[10px] text-[#9C7A4E] tracking-wider">
                  Registry Utilities
                </div>
                <button
                  onClick={onFastForwardAllReservations}
                  className="w-full px-3 py-2 text-left hover:bg-[#FAF7F2] flex items-center gap-2 text-[#4A1521]"
                >
                  <Clock className="w-3.5 h-3.5 text-[#9C7A4E]" />
                  <span>Fast-Forward 48h (Auto-Release)</span>
                </button>
                <button
                  onClick={onOpenAddressDrawer}
                  className="w-full px-3 py-2 text-left hover:bg-[#FAF7F2] flex items-center gap-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#7A6D63]" />
                  <span>View Delivery Address</span>
                </button>
                <button
                  onClick={handleCopyInviteLink}
                  className="w-full px-3 py-2 text-left hover:bg-[#FAF7F2] flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5 text-[#7A6D63]" />
                  <span>Copy Invite Link</span>
                </button>
                <div className="border-t border-[#EFE8DD] my-1" />
                <button
                  onClick={resetAllDataToDefault}
                  className="w-full px-3 py-2 text-left hover:bg-[#FAF7F2] text-[#7A1F2D] flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#7A1F2D]" />
                  <span>Reset Sample Data</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
