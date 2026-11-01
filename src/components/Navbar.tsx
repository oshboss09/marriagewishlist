import React, { useState } from 'react';
import { 
  Share2, 
  MapPin, 
  Sliders, 
  RotateCcw, 
  Clock, 
  Eye, 
  Settings2,
  Lock,
  LogOut
} from 'lucide-react';
import { Wedding, GuestProfile } from '../types';
import { resetAllDataToDefault } from '../utils/storage';

interface NavbarProps {
  wedding: Wedding;
  currentGuest: GuestProfile;
  currentRole: 'guest' | 'couple';
  onRoleChange: (role: 'guest' | 'couple') => void;
  onOpenAddressDrawer: () => void;
  onOpenGuestLogin: () => void;
  onOpenShareModal: () => void;
  onFastForwardAllReservations: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  wedding,
  currentGuest,
  currentRole,
  onRoleChange,
  onOpenAddressDrawer,
  onOpenGuestLogin,
  onOpenShareModal,
  onFastForwardAllReservations,
}) => {
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  const handleExitAdmin = () => {
    localStorage.removeItem('kalyanam_admin_auth');
    try {
      window.history.pushState(null, '', window.location.pathname.replace('/admin', '') || '/');
    } catch (e) {
      // ignore
    }
    onRoleChange('guest');
  };

  const handleViewPublicWishlist = () => {
    try {
      window.history.pushState(null, '', '/');
    } catch (e) {
      // ignore
    }
    onRoleChange('guest');
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
              {currentRole === 'couple' ? 'Couple Admin Dashboard' : 'Wishlist'}
            </p>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2">
          {/* If couple is logged in on admin view: show "View Public Wishlist" & Logout */}
          {currentRole === 'couple' ? (
            <>
              <button
                onClick={handleViewPublicWishlist}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white hover:bg-[#F6F1EA] border border-[#D5C7B5] text-[#4A1521] transition-colors shadow-2xs"
                title="Preview public guest wishlist"
              >
                <Eye className="w-3.5 h-3.5 text-[#7A1F2D]" />
                <span className="hidden sm:inline">View Public Wishlist</span>
                <span className="sm:hidden">Preview</span>
              </button>

              <button
                onClick={onOpenShareModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#4A1521] hover:bg-[#3A101A] text-[#FAF7F2] transition-colors shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="hidden sm:inline">Share Links</span>
                <span className="sm:hidden">Share</span>
              </button>

              <button
                onClick={handleExitAdmin}
                className="p-1.5 text-[#8A7B70] hover:text-[#4A1521] hover:bg-[#EFE8DD] rounded-lg transition-colors"
                title="Lock & Exit Admin"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* Guest View: Clean and minimal header without any admin toggle */
            <>
              {/* Delivery Address */}
              <button
                onClick={onOpenAddressDrawer}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#F3EDE4] hover:bg-[#EAE0D4] text-[#4A1521] border border-[#DDD2C4] transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-[#7A1F2D]" />
                <span>Shipping Address</span>
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

              {/* Developer / Demo Tools */}
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
                    <div className="px-3 py-2 border-b border-[#EFE8DD]">
                      <p className="font-semibold text-[11px] text-[#4A1521]">Developer Simulation Tools</p>
                      <p className="text-[10px] text-[#8A7B70]">Test 48h holds and sample data</p>
                    </div>

                    <button
                      onClick={onFastForwardAllReservations}
                      className="w-full text-left px-3 py-2 hover:bg-[#FAF7F2] text-xs flex items-center gap-2 text-[#4A3E38]"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#9C7A4E]" />
                      <span>Fast-forward 48h holds</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm('Reset all demo data back to Oyeshi & Nishant initial state?')) {
                          resetAllDataToDefault();
                        }
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-700 text-xs flex items-center gap-2 border-t border-[#EFE8DD]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset All Demo Data</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
