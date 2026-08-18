import { useEffect } from 'react';

const AnalyticsTracker = () => {
  useEffect(() => {
    // Inject Google Analytics 4 Script only if valid ID provided
    const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (gaMeasurementId && gaMeasurementId !== 'G-SAMPLE_ID' && !document.getElementById('ga-script')) {
      const script = document.createElement('script');
      script.id = 'ga-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag() { window.dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', gaMeasurementId);
    }

    // Inject Microsoft Clarity Script only if valid ID provided
    const clarityId = import.meta.env.VITE_CLARITY_ID;
    if (clarityId && clarityId !== 'SAMPLE_CLARITY_ID' && !document.getElementById('clarity-script')) {
      const clarityScript = document.createElement('script');
      clarityScript.id = 'clarity-script';
      clarityScript.type = 'text/javascript';
      clarityScript.text = `
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${clarityId}");
      `;
      document.head.appendChild(clarityScript);
    }
  }, []);

  return null;
};

export default AnalyticsTracker;
