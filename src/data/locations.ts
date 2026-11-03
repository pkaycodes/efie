export const CITY_COORDS: Record<string, { lat: number; lng: number; region: string }> = {
  accra: { lat: 5.6037, lng: -0.187, region: 'Greater Accra' },
  tema: { lat: 5.6698, lng: -0.0166, region: 'Greater Accra' },
  kasoa: { lat: 5.5333, lng: -0.4167, region: 'Greater Accra' },
  madina: { lat: 5.6833, lng: -0.1667, region: 'Greater Accra' },
  adenta: { lat: 5.7104, lng: -0.1593, region: 'Greater Accra' },
  'east legon': { lat: 5.6356, lng: -0.1602, region: 'Greater Accra' },
  osu: { lat: 5.5584, lng: -0.1829, region: 'Greater Accra' },
  spintex: { lat: 5.6254, lng: -0.0952, region: 'Greater Accra' },
  'airport city': { lat: 5.6045, lng: -0.1737, region: 'Greater Accra' },
  'airport residential': { lat: 5.6058, lng: -0.1841, region: 'Greater Accra' },
  'cape coast': { lat: 5.1315, lng: -1.2795, region: 'Central' },
  winneba: { lat: 5.3511, lng: -0.625, region: 'Central' },
  kumasi: { lat: 6.6885, lng: -1.6244, region: 'Ashanti' },
  obuasi: { lat: 6.2027, lng: -1.6674, region: 'Ashanti' },
  konongo: { lat: 6.6167, lng: -1.2167, region: 'Ashanti' },
  takoradi: { lat: 4.9016, lng: -1.7831, region: 'Western' },
  'sekondi-takoradi': { lat: 4.934, lng: -1.7137, region: 'Western' },
  tarkwa: { lat: 5.3, lng: -1.9833, region: 'Western' },
  tamale: { lat: 9.4008, lng: -0.8393, region: 'Northern' },
  yendi: { lat: 9.4427, lng: -0.0099, region: 'Northern' },
  koforidua: { lat: 6.094, lng: -0.2591, region: 'Eastern' },
  nkawkaw: { lat: 6.5449, lng: -0.766, region: 'Eastern' },
  ho: { lat: 6.6008, lng: 0.4713, region: 'Volta' },
  hohoe: { lat: 7.1518, lng: 0.4734, region: 'Volta' },
  keta: { lat: 5.9167, lng: 0.9833, region: 'Volta' },
  sunyani: { lat: 7.3399, lng: -2.3268, region: 'Bono' },
  berekum: { lat: 7.4544, lng: -2.5847, region: 'Bono' },
  bolgatanga: { lat: 10.7856, lng: -0.8514, region: 'Upper East' },
  bawku: { lat: 11.0596, lng: -0.2417, region: 'Upper East' },
  wa: { lat: 10.0601, lng: -2.5099, region: 'Upper West' },
}

export const GHANA_CITIES = Object.keys(CITY_COORDS)
  .map((key) =>
    key
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '),
  )
  .sort((a, b) => a.localeCompare(b))

export function coordsForCity(city: string) {
  return CITY_COORDS[city.trim().toLowerCase()] ?? { lat: 7.9465, lng: -1.0232 }
}
