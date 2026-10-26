/**
 * Kigali City districts and their sectors, used for delivery address forms.
 */
export const KIGALI_DISTRICTS = [
  {
    name: 'Gasabo',
    sectors: [
      'Bumbogo',
      'Gatsata',
      'Gikomero',
      'Gisozi',
      'Jabana',
      'Jali',
      'Kacyiru',
      'Kimihurura',
      'Kimironko',
      'Kinyinya',
      'Ndera',
      'Nduba',
      'Remera',
      'Rusororo',
      'Rutunga',
    ],
  },
  {
    name: 'Kicukiro',
    sectors: [
      'Gahanga',
      'Gatenga',
      'Gikondo',
      'Kagarama',
      'Kanombe',
      'Kicukiro',
      'Kigarama',
      'Masaka',
      'Niboye',
      'Nyarugunga',
    ],
  },
  {
    name: 'Nyarugenge',
    sectors: [
      'Gitega',
      'Kanyinya',
      'Kigali',
      'Kimisagara',
      'Mageragere',
      'Muhima',
      'Nyakabanda',
      'Nyamirambo',
      'Nyarugenge',
      'Rwezamenyo',
    ],
  },
];

export const DISTRICT_NAMES = KIGALI_DISTRICTS.map((d) => d.name);

export function getSectors(districtName) {
  return KIGALI_DISTRICTS.find((d) => d.name === districtName)?.sectors ?? [];
}

export default KIGALI_DISTRICTS;
