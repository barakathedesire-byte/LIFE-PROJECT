import { DeliveryZone } from '../types';

export const DEFAULT_DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: 'zone-dar-central',
    name: 'Dar es Salaam Central Zone',
    code: 'DAR-CTR',
    city: 'Dar es Salaam',
    region: 'Dar es Salaam',
    districts: ['Ilala', 'Kinondoni', 'Kariakoo', 'Posta', 'Masaki', 'Oysterbay', 'Mikocheni', 'Upanga', 'Sinza', 'Kijitonyama', 'Msasani'],
    centerCoordinates: { lat: -6.7924, lng: 39.2083 },
    radiusKm: 15,
    baseDeliveryFee: 4000,
    expressDeliveryFee: 7500,
    freeDeliveryThreshold: 50000, // TZS 50,000+ = 100% FREE DELIVERY
    isFreeDeliveryZone: true,
    status: 'ACTIVE'
  },
  {
    id: 'zone-dar-outer',
    name: 'Dar es Salaam Outer Zone',
    code: 'DAR-OUT',
    city: 'Dar es Salaam',
    region: 'Dar es Salaam',
    districts: ['Temeke', 'Ubungo', 'Kigamboni', 'Mbezi Beach', 'Tegeta', 'Goba', 'Bunju', 'Chanika', 'Mbagala'],
    centerCoordinates: { lat: -6.8300, lng: 39.2800 },
    radiusKm: 30,
    baseDeliveryFee: 6500,
    expressDeliveryFee: 10000,
    freeDeliveryThreshold: 80000,
    isFreeDeliveryZone: true,
    status: 'ACTIVE'
  },
  {
    id: 'zone-arusha',
    name: 'Arusha Hub & Municipal',
    code: 'ARU-CTR',
    city: 'Arusha',
    region: 'Arusha',
    districts: ['Arusha Urban', 'Kaloleni', 'Sakina', 'Njiro', 'Sekei'],
    centerCoordinates: { lat: -3.3869, lng: 36.6830 },
    radiusKm: 20,
    baseDeliveryFee: 8000,
    expressDeliveryFee: 12000,
    freeDeliveryThreshold: 100000,
    isFreeDeliveryZone: true,
    status: 'ACTIVE'
  },
  {
    id: 'zone-mwanza',
    name: 'Mwanza Lake Hub',
    code: 'MZA-CTR',
    city: 'Mwanza',
    region: 'Mwanza',
    districts: ['Nyamagana', 'Ilemela', 'Capri Point', 'Kirumba'],
    centerCoordinates: { lat: -2.5164, lng: 32.9175 },
    radiusKm: 20,
    baseDeliveryFee: 9000,
    expressDeliveryFee: 14000,
    freeDeliveryThreshold: 120000,
    isFreeDeliveryZone: true,
    status: 'ACTIVE'
  },
  {
    id: 'zone-dodoma',
    name: 'Dodoma Capital Zone',
    code: 'DOM-CTR',
    city: 'Dodoma',
    region: 'Dodoma',
    districts: ['Dodoma Urban', 'Area C', 'Area D', 'Kikuyu', 'Kisasa'],
    centerCoordinates: { lat: -6.1630, lng: 35.7516 },
    radiusKm: 25,
    baseDeliveryFee: 8500,
    expressDeliveryFee: 13000,
    freeDeliveryThreshold: 100000,
    isFreeDeliveryZone: true,
    status: 'ACTIVE'
  },
  {
    id: 'zone-zanzibar',
    name: 'Zanzibar Stone Town & Coast',
    code: 'ZNZ-ISL',
    city: 'Zanzibar',
    region: 'Zanzibar Urban/West',
    districts: ['Stone Town', 'Mkunazini', 'Malindi', 'Mazizini', 'Nungwi'],
    centerCoordinates: { lat: -6.1659, lng: 39.2026 },
    radiusKm: 35,
    baseDeliveryFee: 12000,
    expressDeliveryFee: 18000,
    freeDeliveryThreshold: 0,
    isFreeDeliveryZone: false, // Paid Delivery Zone - Water crossing logistics
    status: 'ACTIVE'
  },
  {
    id: 'zone-upcountry',
    name: 'Upcountry & Regional Mainland',
    code: 'TZ-UPC',
    city: 'Regional Centers',
    region: 'Upcountry',
    districts: ['Mbeya', 'Morogoro', 'Tanga', 'Kilimanjaro', 'Moshi', 'Tabora', 'Iringa', 'Kigoma', 'Shinyanga', 'Songea', 'Musoma', 'Sumbawanga', 'Singida', 'Lindi', 'Mtwara', 'Bukoba'],
    centerCoordinates: { lat: -8.9094, lng: 33.4608 },
    radiusKm: 80,
    baseDeliveryFee: 11000,
    expressDeliveryFee: 16000,
    freeDeliveryThreshold: 0,
    isFreeDeliveryZone: false, // Paid Delivery Zone - Long-distance inter-city freight
    status: 'ACTIVE'
  }
];

export interface DeliveryFeeCalculation {
  zone: DeliveryZone;
  standardFee: number;
  expressFee: number;
  isFreeDelivery: boolean;
  isFreeDeliveryZone: boolean;
  isFreeDeliveryEligible: boolean;
  amountNeededForFreeDelivery: number;
  deliveryDaysEstimate: string;
  expressDaysEstimate: string;
  ruleExplanation: string;
}

export function calculateDeliveryFee(
  locationName: string,
  subtotal: number,
  coordinates?: { lat: number; lng: number },
  deliveryType: 'standard' | 'express' | 'pickup' = 'standard'
): DeliveryFeeCalculation {
  const normLoc = (locationName || '').toLowerCase().trim();

  // Pick Matching Zone
  let matchedZone = DEFAULT_DELIVERY_ZONES.find(z =>
    z.districts.some(d => normLoc.includes(d.toLowerCase())) ||
    normLoc.includes(z.city.toLowerCase()) ||
    normLoc.includes(z.region.toLowerCase())
  );

  // Fallback to Dar es Salaam Central if not specified or unrecognized in demo
  if (!matchedZone) {
    matchedZone = DEFAULT_DELIVERY_ZONES[0];
  }

  // Check Free Delivery Eligibility Threshold
  const isFreeDeliveryZone = matchedZone.isFreeDeliveryZone;
  const isFreeDeliveryEligible = isFreeDeliveryZone && matchedZone.freeDeliveryThreshold > 0 && subtotal >= matchedZone.freeDeliveryThreshold;
  const amountNeededForFreeDelivery = isFreeDeliveryZone ? Math.max(0, matchedZone.freeDeliveryThreshold - subtotal) : 0;

  let finalStandardFee = isFreeDeliveryEligible ? 0 : matchedZone.baseDeliveryFee;
  let finalExpressFee = isFreeDeliveryEligible 
    ? Math.max(2500, matchedZone.expressDeliveryFee - matchedZone.baseDeliveryFee) 
    : matchedZone.expressDeliveryFee;

  if (deliveryType === 'pickup') {
    finalStandardFee = 0; // Free pickup at station
    finalExpressFee = 2500;
  }

  let ruleExplanation = '';
  if (isFreeDeliveryEligible) {
    ruleExplanation = `FREE DOOR DELIVERY DETECTED! Your subtotal (${subtotal.toLocaleString()} TZS) qualifies for 100% Free Door Delivery in ${matchedZone.name}.`;
  } else if (isFreeDeliveryZone && amountNeededForFreeDelivery > 0) {
    ruleExplanation = `Eligible for Free Door Delivery in ${matchedZone.name}! Add ${amountNeededForFreeDelivery.toLocaleString()} TZS more to reach the ${matchedZone.freeDeliveryThreshold.toLocaleString()} TZS free delivery threshold.`;
  } else {
    ruleExplanation = `Standard paid courier zone detected for ${matchedZone.name}. Fixed regional freight fee: ${matchedZone.baseDeliveryFee.toLocaleString()} TZS.`;
  }

  return {
    zone: matchedZone,
    standardFee: finalStandardFee,
    expressFee: finalExpressFee,
    isFreeDelivery: isFreeDeliveryEligible,
    isFreeDeliveryZone,
    isFreeDeliveryEligible,
    amountNeededForFreeDelivery,
    deliveryDaysEstimate: matchedZone.code.includes('DAR') ? '1 - 2 Business Days' : '2 - 4 Business Days',
    expressDaysEstimate: matchedZone.code.includes('DAR') ? 'Same-Day / Under 4 Hours' : 'Next-Day Express',
    ruleExplanation
  };
}
