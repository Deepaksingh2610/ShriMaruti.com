import React from 'react';
import { Truck, Gift, Sparkles } from 'lucide-react';

const TopAnnouncementBar = () => {
  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium shadow-sm flex items-center justify-center gap-2">
      <Truck className="w-4 h-4 animate-bounce" />
      <span>FREE DELIVERY!!! Enjoy ₹0 shipping on all orders over ₹499 with express delivery slots</span>
      <Sparkles className="w-4 h-4 text-amber-200 hidden sm:inline" />
    </div>
  );
};

export default TopAnnouncementBar;
