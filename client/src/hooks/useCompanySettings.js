import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../services/api';
import companyConfig from '../config/companyConfig';
import toast from 'react-hot-toast';

export const useCompanySettings = () => {
  const queryClient = useQueryClient();

  const { data: rawSettings, isLoading, refetch } = useQuery({
    queryKey: ['companySettings'],
    queryFn: async () => {
      try {
        const res = await API.get('/content/company-settings');
        return res.data.settings || {};
      } catch (err) {
        return {};
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutes cache
  });

  // Deeply merge DB settings with companyConfig defaults
  const settings = {
    brandName: rawSettings?.brandName || companyConfig.brandName,
    companyLegalName: rawSettings?.companyLegalName || companyConfig.companyLegalName,
    cin: rawSettings?.cin || companyConfig.cin,
    gstin: rawSettings?.gstin || companyConfig.gstin,
    establishedYear: rawSettings?.establishedYear || companyConfig.establishedYear,

    registeredOffice: {
      line1: rawSettings?.registeredOffice?.line1 || companyConfig.registeredOffice.line1,
      city: rawSettings?.registeredOffice?.city || companyConfig.registeredOffice.city,
      state: rawSettings?.registeredOffice?.state || companyConfig.registeredOffice.state,
      pincode: rawSettings?.registeredOffice?.pincode || companyConfig.registeredOffice.pincode,
      country: rawSettings?.registeredOffice?.country || companyConfig.registeredOffice.country
    },

    mailingAddress: {
      line1: rawSettings?.mailingAddress?.line1 || companyConfig.mailingAddress.line1,
      city: rawSettings?.mailingAddress?.city || companyConfig.mailingAddress.city,
      state: rawSettings?.mailingAddress?.state || companyConfig.mailingAddress.state,
      pincode: rawSettings?.mailingAddress?.pincode || companyConfig.mailingAddress.pincode,
      country: rawSettings?.mailingAddress?.country || companyConfig.mailingAddress.country
    },

    support: {
      email: rawSettings?.support?.email || companyConfig.support.email,
      phone: rawSettings?.support?.phone || companyConfig.support.phone,
      whatsapp: rawSettings?.support?.whatsapp || companyConfig.support.whatsapp,
      hours: rawSettings?.support?.hours || companyConfig.support.hours,
      isCodAvailable: rawSettings?.support?.isCodAvailable ?? companyConfig.support.isCodAvailable
    },

    recruitment: {
      email: rawSettings?.recruitment?.email || companyConfig.recruitment.email,
      phone: rawSettings?.recruitment?.phone || companyConfig.recruitment.phone
    },

    media: {
      contactName: rawSettings?.media?.contactName || companyConfig.media.contactName,
      email: rawSettings?.media?.email || companyConfig.media.email,
      phone: rawSettings?.media?.phone || companyConfig.media.phone
    },

    grievance: {
      officerName: rawSettings?.grievance?.officerName || companyConfig.grievance.officerName,
      designation: rawSettings?.grievance?.designation || companyConfig.grievance.designation,
      email: rawSettings?.grievance?.email || companyConfig.grievance.email,
      phone: rawSettings?.grievance?.phone || companyConfig.grievance.phone,
      address: rawSettings?.grievance?.address || companyConfig.grievance.address
    },

    social: {
      youtube: rawSettings?.social?.youtube || companyConfig.social?.youtube || '#',
      instagram: rawSettings?.social?.instagram || companyConfig.social?.instagram || '#',
      linkedin: rawSettings?.social?.linkedin || companyConfig.social?.linkedin || '#',
      twitter: rawSettings?.social?.twitter || companyConfig.social?.twitter || '#',
      facebook: rawSettings?.social?.facebook || companyConfig.social?.facebook || '#'
    },

    epr: {
      isConfigured: rawSettings?.epr?.isConfigured ?? companyConfig.epr.isConfigured,
      registrationNumber: rawSettings?.epr?.registrationNumber || companyConfig.epr.registrationNumber,
      category: rawSettings?.epr?.category || companyConfig.epr.category,
      responsibleEntity: rawSettings?.epr?.responsibleEntity || companyConfig.epr.responsibleEntity,
      contactEmail: rawSettings?.epr?.contactEmail || companyConfig.epr.contactEmail
    },

    legal: {
      lastUpdatedDate: rawSettings?.legal?.lastUpdatedDate || companyConfig.legal.lastUpdatedDate,
      cancellationWindowHours: rawSettings?.legal?.cancellationWindowHours || companyConfig.legal.cancellationWindowHours,
      returnEligibilityDays: rawSettings?.legal?.returnEligibilityDays || companyConfig.legal.returnEligibilityDays
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await API.put('/content/company-settings', updatedData);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Company settings updated successfully! ✓');
      queryClient.invalidateQueries({ queryKey: ['companySettings'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update company settings');
    }
  });

  return {
    settings,
    rawSettings,
    isLoading,
    refetch,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending
  };
};

export default useCompanySettings;
