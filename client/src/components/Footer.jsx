import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Gift, Store, Megaphone, HelpCircle, ChevronDown, ChevronUp, Mail, MapPin, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import { FaInstagram, FaYoutube, FaTwitter, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { useCompanySettings } from '../hooks/useCompanySettings';

const Footer = () => {
  const { settings: companyConfig } = useCompanySettings();
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const footerSections = [
    {
      id: 'about',
      title: 'About',
      links: [
        { label: 'About Us', to: '/about-us' },
        { label: 'Careers (Hiring)', to: '/careers' },
        { label: 'Shri Maruti Stories', to: '/stories' },
        { label: 'Corporate Bulk Gifting', to: '/corporate-bulk-gifting' },
        { label: 'Press & Media', to: '/press-media' }
      ]
    },
    {
      id: 'group',
      title: 'Group Companies',
      links: [
        { label: 'Shri Maruti Flora', to: '/flora' },
        { label: 'Shri Maruti 3D Studio', to: '/3d-studio' },
        { label: 'Shri Maruti Bakes', to: '/bakes' },
        { label: 'Shri Maruti Luxe', to: '/luxe' }
      ]
    },
    {
      id: 'help',
      title: 'Help',
      links: [
        { label: 'Payments & FAQ', to: '/payments-faq' },
        { label: 'Express Shipping & Delivery', to: '/shipping-delivery' },
        { label: 'Cancellation & Returns', to: '/cancellation-returns' },
        { label: 'Help Center & Support', to: '/help-center' }
      ]
    },
    {
      id: 'policy',
      title: 'Consumer Policy',
      links: [
        { label: 'Terms of Use', to: '/terms-of-use' },
        { label: 'Security & Privacy', to: '/privacy-policy' },
        { label: 'Grievance Redressal', to: '/grievance-redressal' },
        { label: 'EPR Compliance', to: '/epr-compliance' }
      ]
    }
  ];

  return (
    <footer className="bg-neutral-900 text-slate-300 text-xs border-t border-neutral-800">
      
      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 pb-10 border-b border-neutral-800">
          
          {/* Responsive Sections: Desktop Grid / Mobile Accordions */}
          {footerSections.map((sec) => (
            <div key={sec.id} className="border-b border-neutral-800 md:border-b-0 pb-4 md:pb-0">
              {/* Mobile Header Button */}
              <button
                onClick={() => toggleSection(sec.id)}
                className="w-full flex items-center justify-between md:hidden py-1 text-left"
                aria-expanded={openSection === sec.id}
              >
                <h4 className="text-amber-500 font-bold uppercase tracking-wider text-[11px]">{sec.title}</h4>
                <span className="text-slate-400">
                  {openSection === sec.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {/* Desktop Header */}
              <h4 className="hidden md:block text-amber-500 font-bold uppercase tracking-wider text-[11px] mb-3">
                {sec.title}
              </h4>

              {/* Links List */}
              <ul className={`space-y-2.5 mt-2 md:mt-0 ${openSection === sec.id ? 'block' : 'hidden md:block'}`}>
                {sec.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="hover:text-amber-400 text-slate-300 transition duration-150 block py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Col 5: Mail Us */}
          <div className="border-b border-neutral-800 md:border-b-0 pb-4 md:pb-0">
            <h4 className="text-amber-500 font-bold uppercase tracking-wider text-[11px] mb-3">Mail Us:</h4>
            <p className="text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-200">{companyConfig.brandName}</span><br />
              {companyConfig.mailingAddress.line1}<br />
              {companyConfig.mailingAddress.city !== '[CONFIGURE CITY]' ? `${companyConfig.mailingAddress.city}, ` : ''}
              {companyConfig.mailingAddress.state !== '[CONFIGURE STATE]' ? `${companyConfig.mailingAddress.state} - ` : ''}
              {companyConfig.mailingAddress.pincode !== '[CONFIGURE PINCODE]' ? companyConfig.mailingAddress.pincode : ''}<br />
              {companyConfig.mailingAddress.country}
            </p>
            <div className="mt-4 flex items-center gap-3 text-slate-400">
              <span className="text-[11px] font-semibold text-slate-300">Social:</span>
              <a href={companyConfig.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-amber-400 text-sm transition"><FaInstagram /></a>
              <a href={companyConfig.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-amber-400 text-sm transition"><FaYoutube /></a>
              <a href={companyConfig.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-amber-400 text-sm transition"><FaLinkedin /></a>
              <a href={companyConfig.social.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-amber-400 text-sm transition"><FaTwitter /></a>
              <a href={companyConfig.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-amber-400 text-sm transition"><FaFacebook /></a>
            </div>
          </div>

          {/* Col 6: Registered Office */}
          <div>
            <h4 className="text-amber-500 font-bold uppercase tracking-wider text-[11px] mb-3">Registered Office:</h4>
            <p className="text-slate-400 leading-relaxed">
              <span className="font-semibold text-slate-200">{companyConfig.companyLegalName}</span><br />
              {companyConfig.registeredOffice.line1}<br />
              {companyConfig.registeredOffice.city !== '[CONFIGURE CITY]' ? `${companyConfig.registeredOffice.city}, ` : ''}
              {companyConfig.registeredOffice.state !== '[CONFIGURE STATE]' ? `${companyConfig.registeredOffice.state} - ` : ''}
              {companyConfig.registeredOffice.pincode !== '[CONFIGURE PINCODE]' ? companyConfig.registeredOffice.pincode : ''}<br />
              CIN: <span className="font-mono text-slate-300">{companyConfig.cin}</span><br />
              Support: <span className="text-slate-300">{companyConfig.support.phone}</span>
            </p>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col lg:flex-row items-center justify-between gap-6 text-slate-400 font-medium">
          
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs">
            <Link to="/corporate-bulk-gifting" className="flex items-center gap-2 hover:text-amber-400 transition">
              <Store className="w-4 h-4 text-amber-500" />
              <span>Corporate Gifting</span>
            </Link>
            <Link to="/corporate-bulk-gifting" className="flex items-center gap-2 hover:text-amber-400 transition">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Bulk Inquiries</span>
            </Link>
            <Link to="/gift-cards" className="flex items-center gap-2 hover:text-amber-400 transition">
              <Gift className="w-4 h-4 text-amber-500" />
              <span>Digital Gift Cards</span>
            </Link>
            <Link to="/help-center" className="flex items-center gap-2 hover:text-amber-400 transition">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Help Center & Support</span>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 text-xs">
            <span>© {companyConfig.establishedYear}-2026 {companyConfig.brandName}.com</span>
            <div className="flex items-center gap-2 bg-neutral-800/90 px-3 py-1.5 rounded-lg border border-neutral-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] text-slate-300 font-semibold">100% Secure Payments</span>
              <img src="https://img.icons8.com/color/48/visa.png" alt="Visa" className="h-3.5" />
              <img src="https://img.icons8.com/color/48/mastercard.png" alt="Mastercard" className="h-3.5" />
              <img src="https://img.icons8.com/color/48/upi.png" alt="UPI" className="h-3.5" />
            </div>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
