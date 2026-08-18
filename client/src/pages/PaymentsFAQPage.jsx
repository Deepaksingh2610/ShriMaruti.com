import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { HelpCircle, ChevronDown, ChevronUp, Search, CreditCard, ShieldCheck, Truck, RotateCcw, User, Mail } from 'lucide-react';
import companyConfig from '../config/companyConfig';

const FAQ_SECTIONS = [
  {
    category: 'Payments',
    icon: CreditCard,
    items: [
      {
        q: 'What payment methods are available?',
        a: 'Customers can use the payment methods displayed at checkout. Available payment options may include online payment methods supported by Shri Maruti at the time of purchase, including cards, net banking, UPI, and supported digital wallets.'
      },
      {
        q: 'Is online payment secure?',
        a: 'Shri Maruti uses appropriate security measures to protect customer and transaction information. Customers should always complete payments through the official Shri Maruti website or approved payment interface. Sensitive payment credentials (such as card PINs or passwords) are never stored on our servers.'
      },
      {
        q: 'My payment was successful but the order is not showing.',
        a: 'Please wait a short while for the payment gateway status to update. If the order is still not visible after a few minutes, please contact customer support with your transaction reference number, email address, and payment screenshot.'
      },
      {
        q: 'What happens if my payment fails?',
        a: 'If your payment fails, please try again using another available payment method. If money has been deducted from your bank or wallet but the order was not confirmed, the issuing bank typically releases the funds back within 3-5 business days. You can also contact support with the transaction details for immediate assistance.'
      },
      {
        q: 'Can I pay on delivery?',
        a: 'Cash on Delivery (COD) availability depends on the selected delivery PIN code, item customization requirements, and order value. Where supported, the COD option will be selectable at checkout.'
      }
    ]
  },
  {
    category: 'Orders & Tracking',
    icon: Truck,
    items: [
      {
        q: 'How do I track my order status?',
        a: 'Once your order is placed, you can track its live fulfillment and transit progress by visiting the "My Orders" page in your account, or by using the tracking link sent to your registered email and phone number.'
      },
      {
        q: 'Can I modify my delivery address after placing an order?',
        a: 'Address changes can be requested before the order enters dispatch. Please reach out to customer support as quickly as possible with your Order ID.'
      },
      {
        q: 'Can I add a personalized gift message?',
        a: 'Yes, during checkout you can enter a custom greeting message to be printed and included with your gift parcel.'
      }
    ]
  },
  {
    category: 'Delivery & Shipping',
    icon: Truck,
    items: [
      {
        q: 'How is the delivery date estimated?',
        a: 'Estimated delivery timelines are computed at checkout based on your destination PIN code, product availability, and whether standard or express shipping is selected.'
      },
      {
        q: 'What happens if the recipient is unavailable at delivery?',
        a: 'Our delivery partners attempt contact via phone upon arrival. If delivery cannot be completed, re-attempt protocols apply depending on local courier logistics.'
      }
    ]
  },
  {
    category: 'Cancellations & Returns',
    icon: RotateCcw,
    items: [
      {
        q: 'Can I cancel my order?',
        a: 'Standard non-custom orders can be cancelled before dispatch. For personalized or custom-manufactured products (such as laser engraved plaques or custom 3D prints), cancellation requests must be submitted before production begins.'
      },
      {
        q: 'How do I report a damaged or incorrect product?',
        a: 'Please contact customer support within the eligible window from delivery, providing your Order ID and clear photographs or video showing the condition of the received package.'
      }
    ]
  }
];

const PaymentsFAQPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndex, setOpenIndex] = useState('0-0'); // Default open first question

  const handleToggle = (key) => {
    setOpenIndex(openIndex === key ? null : key);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <SEOHead
        title="Payments & FAQ - Shri Maruti"
        description="Find answers to frequently asked questions about payments, order tracking, shipping, and returns on Shri Maruti."
      />

      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center gap-2">
        <Link to="/" className="hover:text-amber-600">Home</Link>
        <span>/</span>
        <span className="text-slate-400">Help</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Payments & FAQ</span>
      </nav>

      {/* Header */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold rounded-full border border-amber-500/30">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Help & Answers</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
          Payments & Frequently Asked Questions
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Find straightforward answers to common questions about payment methods, transaction security, order fulfillment, and delivery.
        </p>

        {/* Search Bar */}
        <div className="pt-2 max-w-xl">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search questions (e.g. payment failed, tracking, return)..."
              className="w-full pl-11 pr-4 py-3 bg-neutral-800/90 text-white text-xs sm:text-sm rounded-2xl border border-neutral-700 outline-none focus:border-amber-500 transition placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* FAQ Sections Accordion */}
      <div className="space-y-8">
        {FAQ_SECTIONS.map((section, sIdx) => {
          const Icon = section.icon;
          const filteredItems = section.items.filter(
            item =>
              item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.a.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={sIdx} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  <Icon className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">{section.category}</h2>
              </div>

              <div className="space-y-3">
                {filteredItems.map((item, iIdx) => {
                  const key = `${sIdx}-${iIdx}`;
                  const isOpen = openIndex === key;
                  return (
                    <div
                      key={iIdx}
                      className="border border-slate-200/80 rounded-2xl overflow-hidden transition"
                    >
                      <button
                        onClick={() => handleToggle(key)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-slate-50/50 hover:bg-slate-50 transition"
                        aria-expanded={isOpen}
                      >
                        <span className="font-bold text-xs sm:text-sm text-slate-900 pr-4">{item.q}</span>
                        <span className="text-slate-400 flex-shrink-0">
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="p-4 sm:p-5 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Still Need Assistance Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-bold">Still have questions?</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Our support team is available to assist you with order or payment inquiries.
          </p>
        </div>
        <Link
          to="/help-center"
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 flex-shrink-0"
        >
          <Mail className="w-4 h-4" />
          Contact Help Center
        </Link>
      </div>
    </div>
  );
};

export default PaymentsFAQPage;
