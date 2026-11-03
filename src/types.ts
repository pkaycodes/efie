export const PROPERTY_TYPES = [
  'Apartment',
  'House',
  'Studio',
  'Hostel',
  'Single room',
  'Short stay',
] as const

export type PropertyType = (typeof PROPERTY_TYPES)[number]

export const REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Central',
  'Northern',
  'Eastern',
  'Volta',
  'Bono',
  'Upper East',
  'Upper West',
] as const

export type Region = (typeof REGIONS)[number]

export type Furnishing = 'Furnished' | 'Part-furnished' | 'Unfurnished'
export type RentPeriod = 'month' | 'night'

export interface Landlord {
  name: string
  phone: string
  whatsapp: string
  verified: boolean
  memberSince: string
  responseTime: string
}

export interface Listing {
  id: string
  title: string
  type: PropertyType
  price: number
  period: RentPeriod
  area: string
  city: string
  region: Region
  landmark: string
  lat: number
  lng: number
  bedrooms: number
  bathrooms: number
  sizeSqm: number
  furnishing: Furnishing
  amenities: string[]
  description: string
  photos: string[]
  landlord: Landlord
  featured: boolean
  verified: boolean
  availableNow: boolean
  availableFrom?: string
  depositMonths?: number
  utilitiesIncluded: boolean
  createdAt: string
  userCreated?: boolean
}

export type ListingDraft = Omit<
  Listing,
  'id' | 'createdAt' | 'featured' | 'verified' | 'userCreated'
>
