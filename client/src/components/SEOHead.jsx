import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({ title, description, image, url, type = 'website' }) => {
  const siteName = 'ShriMaruti.com';
  const defaultTitle = 'ShriMaruti.com | India\'s Premier Online Gifting Store';
  const defaultDesc = 'Send fresh flowers, cakes, personalized gifts, 3D printed mandirs & luxury hampers across India with express delivery.';
  const defaultImg = 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&auto=format&fit=crop';
  const currentUrl = url || window.location.href;

  const metaTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const metaDesc = description || defaultDesc;
  const metaImg = image || defaultImg;

  return (
    <Helmet>
      <title>{metaTitle}</title>
      <meta name="description" content={metaDesc} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:image" content={metaImg} />
      <meta property="og:url" content={currentUrl} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image" content={metaImg} />
    </Helmet>
  );
};

export default SEOHead;
