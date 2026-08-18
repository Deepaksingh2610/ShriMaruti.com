import React from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { FaWhatsapp, FaFacebook, FaTwitter, FaPinterest } from 'react-icons/fa';
import toast from 'react-hot-toast';

const SocialShareButtons = ({ title, url }) => {
  const shareUrl = url || window.location.href;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`Check out this special gift on Shri Maruti: ${title}`);

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
      <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
        <Share2 className="w-3.5 h-3.5" /> Share:
      </span>

      <a
        href={`https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-full transition"
        title="Share on WhatsApp"
      >
        <FaWhatsapp className="w-4 h-4" />
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition"
        title="Share on Facebook"
      >
        <FaFacebook className="w-4 h-4" />
      </a>

      <a
        href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-sky-50 text-sky-500 hover:bg-sky-100 rounded-full transition"
        title="Share on X"
      >
        <FaTwitter className="w-4 h-4" />
      </a>

      <a
        href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-full transition"
        title="Share on Pinterest"
      >
        <FaPinterest className="w-4 h-4" />
      </a>

      <button
        onClick={handleCopy}
        className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full transition"
        title="Copy Link"
      >
        <Copy className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SocialShareButtons;
