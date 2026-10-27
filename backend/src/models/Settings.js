import mongoose from 'mongoose';

/** Single document (key "site") holding the store configuration edited on the admin Settings page. */
const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'site', unique: true },
    storeName: { type: String, default: 'Di-Grow' },
    tagline: { type: String, default: 'Health, wellness and growth products delivered in Kigali' },
    phone: { type: String, default: '+250 790 911 427' },
    whatsapp: { type: String, default: '250790911427' },
    email: { type: String, default: 'hello@digrow.rw' },
    address: { type: String, default: 'KN 4 Ave, Nyarugenge, Kigali' },
    openingHours: { type: String, default: 'Mon - Sat, 8:00 AM - 7:00 PM' },
    deliveryFee: { type: Number, default: 1500 },
    freeDeliveryThreshold: { type: Number, default: 50000 },
    deliveryNote: { type: String, default: '' },
    announcement: { type: String, default: '' },
    announcementEnabled: { type: Boolean, default: false },
    notifyEmail: { type: Boolean, default: true },
    notifySms: { type: Boolean, default: true },
    notifyEmailRecipients: { type: String, default: '' },
    notifySmsRecipients: { type: String, default: '' },
    socialFacebook: { type: String, default: '' },
    socialInstagram: { type: String, default: '' },
    socialTwitter: { type: String, default: '' },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

settingsSchema.statics.get = async function get() {
  return (await this.findOne({ key: 'site' })) || this.create({ key: 'site' });
};

export const PUBLIC_SETTINGS_FIELDS = [
  'storeName',
  'tagline',
  'phone',
  'whatsapp',
  'email',
  'address',
  'openingHours',
  'deliveryFee',
  'freeDeliveryThreshold',
  'deliveryNote',
];

settingsSchema.methods.toPublic = function toPublic() {
  const out = {};
  PUBLIC_SETTINGS_FIELDS.forEach((k) => {
    out[k] = this[k];
  });
  out.announcement = this.announcementEnabled ? this.announcement : '';
  out.socialFacebook = this.socialFacebook;
  out.socialInstagram = this.socialInstagram;
  out.socialTwitter = this.socialTwitter;
  out.seoTitle = this.seoTitle;
  out.seoDescription = this.seoDescription;
  return out;
};

export const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
