const mongoose = require('mongoose');

const companySettingsSchema = new mongoose.Schema({
  key: { type: String, default: 'primary', unique: true },

  // Brand & Legal Entity
  brandName: { type: String, default: 'Shri Maruti' },
  companyLegalName: { type: String, default: '[CONFIGURE COMPANY NAME]' },
  cin: { type: String, default: '[CONFIGURE CIN]' },
  gstin: { type: String, default: '[CONFIGURE GST DETAILS]' },
  establishedYear: { type: String, default: '2007' },

  // Official Addresses
  registeredOffice: {
    line1: { type: String, default: '[CONFIGURE OFFICIAL BUSINESS ADDRESS]' },
    city: { type: String, default: '[CONFIGURE CITY]' },
    state: { type: String, default: '[CONFIGURE STATE]' },
    pincode: { type: String, default: '[CONFIGURE PINCODE]' },
    country: { type: String, default: 'India' }
  },
  mailingAddress: {
    line1: { type: String, default: '[CONFIGURE MAILING ADDRESS]' },
    city: { type: String, default: '[CONFIGURE CITY]' },
    state: { type: String, default: '[CONFIGURE STATE]' },
    pincode: { type: String, default: '[CONFIGURE PINCODE]' },
    country: { type: String, default: 'India' }
  },

  // Customer Support & Helpline
  support: {
    email: { type: String, default: '[CONFIGURE EMAIL]' },
    phone: { type: String, default: '[CONFIGURE PHONE]' },
    whatsapp: { type: String, default: '[CONFIGURE WHATSAPP NUMBER]' },
    hours: { type: String, default: '[CONFIGURE SUPPORT HOURS]' },
    isCodAvailable: { type: Boolean, default: true }
  },

  // Recruitment / Careers
  recruitment: {
    email: { type: String, default: '[CONFIGURE RECRUITMENT EMAIL]' },
    phone: { type: String, default: '[CONFIGURE RECRUITMENT PHONE]' }
  },

  // Media & Press
  media: {
    contactName: { type: String, default: '[CONFIGURE MEDIA CONTACT]' },
    email: { type: String, default: '[CONFIGURE MEDIA EMAIL]' },
    phone: { type: String, default: '[CONFIGURE MEDIA PHONE]' }
  },

  // Grievance Redressal
  grievance: {
    officerName: { type: String, default: '[CONFIGURE GRIEVANCE OFFICER]' },
    designation: { type: String, default: 'Grievance Officer' },
    email: { type: String, default: '[CONFIGURE GRIEVANCE EMAIL]' },
    phone: { type: String, default: '[CONFIGURE GRIEVANCE PHONE]' },
    address: { type: String, default: '[CONFIGURE GRIEVANCE ADDRESS]' }
  },

  // Social Links
  social: {
    youtube: { type: String, default: '#' },
    instagram: { type: String, default: '#' },
    linkedin: { type: String, default: '#' },
    twitter: { type: String, default: '#' },
    facebook: { type: String, default: '#' }
  },

  // Extended Producer Responsibility (EPR)
  epr: {
    isConfigured: { type: Boolean, default: false },
    registrationNumber: { type: String, default: '[CONFIGURE EPR NUMBER]' },
    category: { type: String, default: '[CONFIGURE EPR CATEGORY]' },
    responsibleEntity: { type: String, default: '[CONFIGURE RESPONSIBLE ENTITY]' },
    contactEmail: { type: String, default: '[CONFIGURE EPR CONTACT EMAIL]' }
  },

  // Legal & Policy Settings
  legal: {
    lastUpdatedDate: { type: String, default: '[CONFIGURE DATE]' },
    cancellationWindowHours: { type: Number, default: 1 },
    returnEligibilityDays: { type: Number, default: 7 }
  },

  updatedBy: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('CompanySettings', companySettingsSchema);
