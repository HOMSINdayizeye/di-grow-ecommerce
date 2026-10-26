import { settingsService } from '@/services/settingsService';
import { SITE } from '@/constants/site';
import { useFetch } from './useFetch';

const fallback = {
  storeName: SITE.name,
  tagline: SITE.tagline,
  phone: SITE.phone,
  whatsapp: SITE.whatsapp,
  email: SITE.email,
  address: SITE.address,
  openingHours: SITE.hours,
  deliveryFee: 1500,
  freeDeliveryThreshold: 50000,
  deliveryNote: '',
  announcement: '',
};

/** Public site settings with safe defaults while loading. */
export function useSettings() {
  const res = useFetch(() => settingsService.getPublic(), [], { initialData: fallback });
  return { ...res, settings: { ...fallback, ...(res.data || {}) } };
}

export default useSettings;
