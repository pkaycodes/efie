import type { Listing } from '../types'

export function formatPrice(amount: number) {
  return `GH₵ ${amount.toLocaleString('en-GH')}`
}

export function formatRent(listing: Pick<Listing, 'price' | 'period'>) {
  return `${formatPrice(listing.price)}${listing.period === 'month' ? '/month' : '/night'}`
}

export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('233') && digits.length === 12) {
    return `+233 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
  }
  return phone
}

export function whatsappLink(listing: Listing, message?: string) {
  const text =
    message ??
    `Hello ${listing.landlord.name.split(' ')[0]}, I saw your listing "${listing.title}" on Efie. Is it still available?`
  return `https://wa.me/${listing.landlord.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`
}

export function mapsLink(listing: Listing) {
  return `https://www.google.com/maps/search/?api=1&query=${listing.lat},${listing.lng}`
}

export function openStreetMapLink(listing: Listing) {
  const lat = listing.lat
  const lng = listing.lng
  const pad = 0.012
  const bbox = [lng - pad, lat - pad, lng + pad, lat + pad].join(',')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lng}`
}

export function timeAgo(isoDate: string) {
  const then = new Date(isoDate).getTime()
  if (Number.isNaN(then)) return 'Recently'
  const diff = Math.max(0, Date.now() - then)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days < 1) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 14) return '1 week ago'
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 60) return '1 month ago'
  return `${Math.floor(days / 30)} months ago`
}

export function specsLabel(listing: Listing) {
  const bedLabel =
    listing.bedrooms === 0
      ? 'Studio'
      : `${listing.bedrooms} ${listing.bedrooms === 1 ? 'bed' : 'beds'}`
  return bedLabel
}

export function countByType(listings: Listing[], type: string) {
  return listings.filter((listing) => listing.type === type).length
}

export function listingSearchText(listing: Listing) {
  return [
    listing.title,
    listing.description,
    listing.area,
    listing.city,
    listing.region,
    listing.type,
    listing.landlord.name,
  ]
    .join(' ')
    .toLowerCase()
}

export function normalisePhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('233')) return digits
  if (digits.startsWith('0') && digits.length === 10) return `233${digits.slice(1)}`
  if (digits.length === 9) return `233${digits}`
  return digits
}
