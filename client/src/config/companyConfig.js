/**
 * ShriMaruti.com — Centralized Company Configuration
 * 
 * IMPORTANT:
 * All business details, legal parameters, contact details, and compliance data
 * are centralized here. Where official facts are not yet established or legally verified,
 * clearly marked placeholders [CONFIGURE ...] are used. Update these fields to reflect
 * verified production data without modifying individual page components.
 */

export const companyConfig = {
  // Brand & Entity
  brandName: 'Shri Maruti',
  companyLegalName: '[CONFIGURE COMPANY NAME]', // e.g. Shri Maruti Internet Pvt. Ltd.
  cin: '[CONFIGURE CIN]',                       // e.g. U51109UP2026PTC066107
  gstin: '[CONFIGURE GST DETAILS]',             // e.g. 09ABCDE1234F1Z5
  establishedYear: '2007',

  // Official Addresses
  registeredOffice: {
    line1: '[CONFIGURE OFFICIAL BUSINESS ADDRESS]',
    city: '[CONFIGURE CITY]',
    state: '[CONFIGURE STATE]',
    pincode: '[CONFIGURE PINCODE]',
    country: 'India'
  },
  mailingAddress: {
    line1: '[CONFIGURE MAILING ADDRESS]',
    city: '[CONFIGURE CITY]',
    state: '[CONFIGURE STATE]',
    pincode: '[CONFIGURE PINCODE]',
    country: 'India'
  },

  // Customer Support & Helpline
  support: {
    email: '[CONFIGURE EMAIL]', // e.g. support@shrimaruti.com
    phone: '[CONFIGURE PHONE]', // e.g. 1800-419-7700
    whatsapp: '[CONFIGURE WHATSAPP NUMBER]', // e.g. +91 98765 43210
    hours: '[CONFIGURE SUPPORT HOURS]', // e.g. Monday to Saturday: 9:00 AM - 8:00 PM IST
    isCodAvailable: true // COD availability checked dynamically at checkout based on PIN
  },

  // Recruitment / Careers
  recruitment: {
    email: '[CONFIGURE RECRUITMENT EMAIL]', // e.g. careers@shrimaruti.com
    phone: '[CONFIGURE RECRUITMENT PHONE]'
  },

  // Media & Press
  media: {
    contactName: '[CONFIGURE MEDIA CONTACT]',
    email: '[CONFIGURE MEDIA EMAIL]',
    phone: '[CONFIGURE MEDIA PHONE]'
  },

  // Grievance Redressal
  grievance: {
    officerName: '[CONFIGURE GRIEVANCE OFFICER]',
    designation: 'Grievance Officer',
    email: '[CONFIGURE GRIEVANCE EMAIL]',
    phone: '[CONFIGURE GRIEVANCE PHONE]',
    address: '[CONFIGURE GRIEVANCE ADDRESS]'
  },

  // Extended Producer Responsibility (EPR)
  epr: {
    isConfigured: false, // Set to true once official EPR registration is completed
    registrationNumber: '[CONFIGURE EPR NUMBER]',
    category: '[CONFIGURE EPR CATEGORY]', // e.g. Plastic Packaging & E-Waste Management
    responsibleEntity: '[CONFIGURE RESPONSIBLE ENTITY]',
    contactEmail: '[CONFIGURE EPR CONTACT EMAIL]',
    officialDocuments: [] // [{ name: 'EPR Certificate', url: '/docs/epr.pdf' }]
  },

  // Legal & Policy Settings
  legal: {
    lastUpdatedDate: '[CONFIGURE DATE]', // e.g. January 2026
    termsEffectiveDate: '[CONFIGURE DATE]',
    privacyEffectiveDate: '[CONFIGURE DATE]',
    cancellationWindowHours: 1, // 1 hour for custom manufactured products before production starts
    returnEligibilityDays: 7
  },

  // Social Links (if verified)
  social: {
    instagram: '#',
    facebook: '#',
    twitter: '#',
    youtube: '#'
  }
};

export default companyConfig;
