import React from 'react';
import { Copy, Check, MapPin, Shield, X, Phone, User, Home, Navigation } from 'lucide-react';
import { DeliveryAddress } from '../types';
import { copyToClipboard } from '../utils/upi';

interface DeliveryAddressDrawerProps {
  address: DeliveryAddress;
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryAddressDrawer: React.FC<DeliveryAddressDrawerProps> = ({
  address,
  isOpen,
  onClose,
}) => {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const [copiedAll, setCopiedAll] = React.useState(false);

  if (!isOpen) return null;

  const fullFormattedAddress = `${address.recipientName}
${address.line1}
${address.line2 ? address.line2 + '\n' : ''}${address.landmark ? 'Landmark: ' + address.landmark + '\n' : ''}${address.city}, ${address.state} - ${address.pincode}
Phone: ${address.phone}
${address.deliveryInstructions ? 'Instructions: ' + address.deliveryInstructions : ''}`;

  const handleCopyAll = async () => {
    const success = await copyToClipboard(fullFormattedAddress);
    if (success) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleCopyIndividual = async (text: string, fieldName: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-[#FCFAF6] rounded-3xl shadow-2xl border border-[#E6DCCD] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Luxury Wine Header */}
        <div className="px-7 py-5 bg-[#4A1521] text-[#FAF7F2] flex items-center justify-between border-b border-[#9C7A4E]/30">
          <div>
            <h3 className="font-serif text-xl font-normal tracking-wide">Couple's Delivery Address</h3>
            <p className="text-xs text-[#D8C7B5] font-light">Shipping address for store checkouts</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#D8C7B5] hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-7 overflow-y-auto space-y-4 text-xs text-[#3E342F]">
          <div className="flex items-start gap-2.5 p-3.5 bg-[#F8F4EE] border border-[#E6DCCD] rounded-2xl text-[#6B5E55]">
            <Shield className="w-4 h-4 text-[#9C7A4E] shrink-0 mt-0.5" />
            <span>
              Shared only with wedding guests so gifts arrive safely at Oyeshi & Nishant's residence.
            </span>
          </div>

          {/* Quick Copy All Action */}
          <div className="p-4 bg-[#F8F4EE] rounded-2xl border border-[#E6DCCD] flex items-center justify-between gap-3">
            <div>
              <p className="font-serif font-bold text-[#2C2420] text-sm">One-Click Complete Address</p>
              <p className="text-[11px] text-[#7A6D63] font-light">Formatted for quick store checkout</p>
            </div>
            <button
              onClick={handleCopyAll}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-xs tracking-wider uppercase transition-all shrink-0 ${
                copiedAll
                  ? 'bg-[#22543D] text-white shadow-xs'
                  : 'bg-[#4A1521] hover:bg-[#381019] text-[#FAF7F2] shadow-xs'
              }`}
            >
              {copiedAll ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#C5A880]" /> Copy All
                </>
              )}
            </button>
          </div>

          {/* Granular Field Copiers */}
          <div className="space-y-2">
            <p className="text-[10px] font-medium text-[#9C7A4E] uppercase tracking-[0.16em]">
              Paste Field-By-Field into Store:
            </p>

            {/* Recipient Name */}
            <div className="p-3 bg-white border border-[#E0D5C7] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <User className="w-4 h-4 text-[#9C7A4E] shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-[#8A7B70] block uppercase">Recipient Name</span>
                  <span className="font-medium text-[#2C2420] text-xs truncate">{address.recipientName}</span>
                </div>
              </div>
              <button
                onClick={() => handleCopyIndividual(address.recipientName, 'name')}
                className="p-1 text-[#7A1F2D] hover:underline flex items-center gap-1"
              >
                {copiedField === 'name' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Flat / House / Line 1 */}
            <div className="p-3 bg-white border border-[#E0D5C7] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <Home className="w-4 h-4 text-[#9C7A4E] shrink-0" />
                <div className="truncate">
                  <span className="text-[10px] text-[#8A7B70] block uppercase">Address Line 1</span>
                  <span className="text-[#2C2420] text-xs truncate">{address.line1}</span>
                </div>
              </div>
              <button
                onClick={() => handleCopyIndividual(address.line1, 'line1')}
                className="p-1 text-[#7A1F2D] hover:underline flex items-center gap-1"
              >
                {copiedField === 'line1' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Line 2 / Area */}
            {address.line2 && (
              <div className="p-3 bg-white border border-[#E0D5C7] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <Navigation className="w-4 h-4 text-[#9C7A4E] shrink-0" />
                  <div className="truncate">
                    <span className="text-[10px] text-[#8A7B70] block uppercase">Area / Sector</span>
                    <span className="text-[#2C2420] text-xs truncate">{address.line2}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyIndividual(address.line2, 'line2')}
                  className="p-1 text-[#7A1F2D] hover:underline flex items-center gap-1"
                >
                  {copiedField === 'line2' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* City, State, PIN */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-white border border-[#E0D5C7] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8A7B70] block uppercase">City & State</span>
                  <span className="text-[#2C2420] text-xs font-medium">{address.city}, {address.state}</span>
                </div>
                <button
                  onClick={() => handleCopyIndividual(`${address.city}, ${address.state}`, 'cityState')}
                  className="p-1 text-[#7A1F2D] hover:underline"
                >
                  {copiedField === 'cityState' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="p-3 bg-white border border-[#E0D5C7] rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8A7B70] block uppercase">PIN Code</span>
                  <span className="text-[#2C2420] text-xs font-semibold font-mono">{address.pincode}</span>
                </div>
                <button
                  onClick={() => handleCopyIndividual(address.pincode, 'pincode')}
                  className="p-1 text-[#7A1F2D] hover:underline"
                >
                  {copiedField === 'pincode' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Phone */}
            <div className="p-3 bg-white border border-[#E0D5C7] rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#9C7A4E] shrink-0" />
                <div>
                  <span className="text-[10px] text-[#8A7B70] block uppercase">Delivery Phone</span>
                  <span className="text-[#2C2420] text-xs font-medium font-mono">{address.phone}</span>
                </div>
              </div>
              <button
                onClick={() => handleCopyIndividual(address.phone, 'phone')}
                className="p-1 text-[#7A1F2D] hover:underline flex items-center gap-1"
              >
                {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#E6DCCD] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#4A1521] hover:bg-[#381019] text-[#FAF7F2] rounded-xl text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
