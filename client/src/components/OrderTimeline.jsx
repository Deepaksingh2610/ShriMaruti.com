import React from 'react';
import { CheckCircle2, Clock, Truck, PackageCheck, Home, AlertCircle } from 'lucide-react';

const stages = [
  { id: 'Placed', label: 'Order Placed', icon: Clock },
  { id: 'Confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { id: 'Packed', label: 'Gift Packed', icon: PackageCheck },
  { id: 'Shipped', label: 'Shipped', icon: Truck },
  { id: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
  { id: 'Delivered', label: 'Delivered', icon: Home }
];

const OrderTimeline = ({ currentStatus = 'Placed' }) => {
  if (currentStatus === 'Cancelled') {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600" />
        <span className="font-bold text-sm">Order Has Been Cancelled</span>
      </div>
    );
  }

  const currentIdx = stages.findIndex((s) => s.id === currentStatus);

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative max-w-2xl mx-auto px-2">
        {/* Background Bar */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
        {/* Progress Bar */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-amber-600 -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(Math.max(0, currentIdx) / (stages.length - 1)) * 100}%` }}
        ></div>

        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isCompleted = idx <= currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div key={stage.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCurrent
                    ? 'bg-amber-600 text-white ring-4 ring-amber-200 scale-110 shadow-md'
                    : isCompleted
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-slate-400 border-2 border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[10px] sm:text-xs font-bold mt-2 text-center max-w-[65px] ${
                  isCurrent ? 'text-amber-700 font-extrabold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
