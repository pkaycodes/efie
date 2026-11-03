import { ArrowUpRight, BadgeCheck, Bath, BedDouble, Heart, MapPin, Ruler } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Listing } from '../types'
import { formatPrice, specsLabel } from '../lib/format'
import { useStore } from '../lib/store'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
}

export function ListingCard({ listing }: { listing: Listing }) {
  const { isSaved, toggleSaved } = useStore()
  const saved = isSaved(listing.id)
  const locationLabel = `${listing.area}, ${listing.city}`

  return (
    <article className="listing-card">
      <div className="listing-card__media">
        <Link to={`/listing/${listing.id}`} tabIndex={-1} aria-hidden="true">
          <img src={listing.photos[0]} alt="" loading="lazy" />
        </Link>
        <div className="listing-card__badges">
          <span className="badge badge--light">{listing.type}</span>
          {listing.featured && <span className="badge badge--featured">Featured</span>}
          {listing.userCreated && <span className="badge badge--new">Your listing</span>}
        </div>
        <button
          className={`save-button${saved ? ' is-saved' : ''}`}
          type="button"
          aria-label={saved ? `Remove ${listing.title} from saved rentals` : `Save ${listing.title}`}
          aria-pressed={saved}
          onClick={() => toggleSaved(listing.id)}
        >
          <Heart size={18} aria-hidden="true" fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="listing-card__body">
        <div className="listing-card__price">
          {formatPrice(listing.price)}
          <span>{listing.period === 'month' ? '/ month' : '/ night'}</span>
        </div>
        <h3>
          <Link to={`/listing/${listing.id}`}>{listing.title}</Link>
        </h3>
        <p className="listing-card__location">
          <MapPin size={14} aria-hidden="true" />
          {locationLabel}
        </p>
        <div className="listing-card__specs" aria-label="Property details">
          <span>
            <BedDouble size={15} aria-hidden="true" />
            {specsLabel(listing)}
          </span>
          <span>
            <Bath size={15} aria-hidden="true" />
            {listing.bathrooms} {listing.bathrooms === 1 ? 'bath' : 'baths'}
          </span>
          {listing.sizeSqm > 0 && (
            <span>
              <Ruler size={15} aria-hidden="true" />
              {listing.sizeSqm} m²
            </span>
          )}
        </div>
        <div className="listing-card__footer">
          <span className="listing-card__landlord">
            <span className="avatar avatar--sm" aria-hidden="true">
              {initials(listing.landlord.name)}
            </span>
            <span>{listing.landlord.name.split(' ')[0]}</span>
            {listing.landlord.verified && (
              <BadgeCheck
                className="verified-icon"
                size={15}
                aria-label="Verified landlord"
              />
            )}
          </span>
          <Link className="listing-card__link" to={`/listing/${listing.id}`}>
            View
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}
