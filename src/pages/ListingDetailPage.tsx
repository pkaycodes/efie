import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  Bath,
  BedDouble,
  BookOpen,
  Building2,
  CalendarDays,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Droplets,
  Dumbbell,
  Heart,
  Home,
  Images,
  MapPin,
  MessageCircle,
  Phone,
  Plug,
  Ruler,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sofa,
  Sparkles,
  Tv,
  Utensils,
  Waves,
  WashingMachine,
  Wifi,
  Wind,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ListingCard } from '../components/ListingCard'
import {
  formatPhone,
  formatPrice,
  mapsLink,
  openStreetMapLink,
  specsLabel,
  timeAgo,
  whatsappLink,
} from '../lib/format'
import { useStore } from '../lib/store'
import { usePageTitle } from '../lib/usePageTitle'
import type { Listing } from '../types'

const amenityIcons: Record<string, LucideIcon> = {
  '24/7 security': ShieldCheck,
  Security: ShieldCheck,
  'Borehole water': Droplets,
  'Air conditioning': Wind,
  Parking: Car,
  'Wi-Fi': Wifi,
  'Prepaid meter': Zap,
  'Backup generator': Plug,
  'Backup power': Plug,
  'Fitted kitchen': Utensils,
  'Kitchen unit': Utensils,
  Kitchenette: Utensils,
  'Fully equipped kitchen': Utensils,
  'Shared kitchen': Utensils,
  Furnished: Sofa,
  Balcony: Building2,
  'Private garden': Home,
  'Swimming pool': Waves,
  Gym: Dumbbell,
  'Study desk': BookOpen,
  'Sea view': Waves,
  Housekeeping: Sparkles,
  'Cleaning service': Sparkles,
  'Gated compound': ShieldCheck,
  'Laundry area': WashingMachine,
  'Washing machine': WashingMachine,
  'Smart TV': Tv,
  "Boys' quarters": Home,
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
}

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { getListing, listings, isSaved, toggleSaved, notify } = useStore()
  const listing = id ? getListing(id) : undefined
  usePageTitle(listing?.title)

  if (!listing) {
    return (
      <section className="not-found">
        <div className="container not-found__inner">
          <span className="not-found__code">404</span>
          <h1>This listing has moved on.</h1>
          <p>
            The property may have been rented or removed by the landlord. There are
            plenty more homes waiting for you.
          </p>
          <Link className="btn btn--dark" to="/browse">
            Browse available rentals
            <ArrowLeft size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
    )
  }

  const current = listing
  const saved = isSaved(current.id)
  const similar = listings
    .filter(
      (item) =>
        item.id !== current.id &&
        (item.city === current.city || item.type === current.type),
    )
    .slice(0, 3)

  async function handleShare() {
    const shareData = {
      title: current.title,
      text: `Take a look at this rental in ${current.area}, ${current.city} on Efie.`,
      url: window.location.href,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        notify('Listing link copied. Send it to a friend.')
      }
    } catch {
      // Sharing was cancelled.
    }
  }

  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(formatPhone(current.landlord.phone))
      notify('Phone number copied.')
    } catch {
      notify('Could not copy the number. Please select it manually.')
    }
  }

  const availability = listing.availableNow
    ? 'Available now'
    : `Available from ${listing.availableFrom}`

  return (
    <>
      <article className="detail-page">
        <div className="container">
          <div className="detail-topbar">
            <Link className="back-link" to="/browse">
              <ArrowLeft size={17} aria-hidden="true" />
              All rentals
            </Link>
            <div className="detail-actions">
              <button
                className={`action-button${saved ? ' is-saved' : ''}`}
                type="button"
                onClick={() => toggleSaved(current.id)}
                aria-pressed={saved}
                aria-label={saved ? 'Remove from saved rentals' : 'Save rental'}
              >
                <Heart
                  size={17}
                  aria-hidden="true"
                  fill={saved ? 'currentColor' : 'none'}
                />
                <span>{saved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                className="action-button"
                type="button"
                onClick={handleShare}
                aria-label="Share listing"
              >
                <Share2 size={17} aria-hidden="true" />
                <span>Share</span>
              </button>
            </div>
          </div>

          <div className="detail-heading">
            <div>
              <div className="detail-badges">
                <span className="badge badge--soft">{listing.type}</span>
                {listing.featured && <span className="badge badge--featured">Featured</span>}
                {listing.landlord.verified && (
                  <span className="badge badge--verified">
                    <BadgeCheck size={13} aria-hidden="true" /> Verified landlord
                  </span>
                )}
                {listing.userCreated && (
                  <span className="badge badge--new">New listing</span>
                )}
              </div>
              <h1>{listing.title}</h1>
              <p className="detail-heading__location">
                <MapPin size={17} aria-hidden="true" />
                {listing.area}, {listing.city}, {listing.region}
                <span className="detail-heading__dot" aria-hidden="true">
                  •
                </span>
                Listed {timeAgo(listing.createdAt).toLowerCase()}
              </p>
            </div>
            <div className="detail-price">
              <strong>{formatPrice(listing.price)}</strong>
              <span>{listing.period === 'month' ? 'per month' : 'per night'}</span>
            </div>
          </div>

          <Gallery listing={listing} />

          <div className="detail-layout">
            <div className="detail-content">
              <section className="detail-section detail-overview">
                <div className="detail-facts">
                  <span>
                    <BedDouble size={19} aria-hidden="true" />
                    <strong>{specsLabel(listing)}</strong>
                  </span>
                  <span>
                    <Bath size={19} aria-hidden="true" />
                    <strong>
                      {listing.bathrooms} {listing.bathrooms === 1 ? 'bathroom' : 'bathrooms'}
                    </strong>
                  </span>
                  <span>
                    <Ruler size={19} aria-hidden="true" />
                    <strong>{listing.sizeSqm} m²</strong>
                  </span>
                  <span>
                    <Sofa size={19} aria-hidden="true" />
                    <strong>{listing.furnishing}</strong>
                  </span>
                </div>

                <h2>About this place</h2>
                {listing.description.split('\n').filter(Boolean).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <div className="detail-availability">
                  <CalendarDays size={17} aria-hidden="true" />
                  <span>{availability}</span>
                  {listing.depositMonths && (
                    <span>
                      {listing.depositMonths}{' '}
                      {listing.depositMonths === 1 ? 'month' : 'months'} deposit
                    </span>
                  )}
                  <span>{listing.utilitiesIncluded ? 'Utilities included' : 'Utilities separate'}</span>
                </div>
              </section>

              <section className="detail-section">
                <h2>What this place offers</h2>
                <ul className="amenity-grid">
                  {listing.amenities.map((amenity) => {
                    const Icon = amenityIcons[amenity] ?? Check
                    return (
                      <li key={amenity}>
                        <span className="amenity-grid__icon" aria-hidden="true">
                          <Icon size={19} />
                        </span>
                        {amenity}
                      </li>
                    )
                  })}
                </ul>
              </section>

              <section className="detail-section">
                <h2>Location</h2>
                <p className="detail-section__lede">
                  {listing.landmark}. The map shows the general area — confirm the
                  exact address with the landlord before your visit.
                </p>
                <div className="map-card">
                  <iframe
                    title={`Map showing ${listing.area}, ${listing.city}`}
                    src={openStreetMapLink(listing)}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="map-card__footer">
                    <span>
                      <MapPin size={17} aria-hidden="true" />
                      <span>
                        <strong>
                          {listing.area}, {listing.city}
                        </strong>
                        <small>{listing.landmark}</small>
                      </span>
                    </span>
                    <a
                      className="text-link"
                      href={mapsLink(listing)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </section>

              <section className="safety-note">
                <span className="safety-note__icon" aria-hidden="true">
                  <ShieldAlert size={24} />
                </span>
                <div>
                  <h2>Before you pay, view the property.</h2>
                  <p>
                    Never send money before you have seen the place and met the
                    landlord. Confirm ownership, read the tenancy agreement and keep
                    a receipt for every payment.
                  </p>
                  <Link className="text-link" to="/how-it-works#safety">
                    Read our safety tips
                  </Link>
                </div>
              </section>
            </div>

            <aside className="detail-sidebar">
              <ContactCard
                listing={listing}
                onCopyPhone={copyPhone}
              />
            </aside>
          </div>
        </div>

        {similar.length > 0 && (
          <section className="similar-section">
            <div className="container">
              <div className="section-heading section-heading--split">
                <div>
                  <span className="eyebrow">Keep looking</span>
                  <h2>You may also like</h2>
                </div>
                <Link className="text-link" to="/browse">
                  View all rentals
                  <ChevronRight size={17} aria-hidden="true" />
                </Link>
              </div>
              <div className="listing-grid">
                {similar.map((item) => (
                  <ListingCard listing={item} key={item.id} />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>

      <div className="mobile-contact">
        <div className="mobile-contact__price">
          <strong>{formatPrice(listing.price)}</strong>
          <span>{listing.period === 'month' ? '/ month' : '/ night'}</span>
        </div>
        <a
          className="btn btn--whatsapp btn--sm"
          href={whatsappLink(listing)}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={18} aria-hidden="true" />
          WhatsApp
        </a>
        <a
          className="btn btn--outline btn--sm mobile-contact__call"
          href={`tel:+${listing.landlord.phone.replace(/\D/g, '')}`}
          aria-label={`Call ${listing.landlord.name}`}
        >
          <Phone size={18} aria-hidden="true" />
        </a>
      </div>
    </>
  )
}

function ContactCard({
  listing,
  onCopyPhone,
}: {
  listing: Listing
  onCopyPhone: () => void
}) {
  return (
    <div className="contact-card">
      <div className="contact-card__landlord">
        <span className="avatar avatar--lg" aria-hidden="true">
          {initials(listing.landlord.name)}
        </span>
        <div>
          <span className="contact-card__pill">
            {listing.landlord.verified ? (
              <>
                <BadgeCheck size={14} aria-hidden="true" /> Verified landlord
              </>
            ) : (
              'New landlord'
            )}
          </span>
          <h2>{listing.landlord.name}</h2>
          <p>{listing.landlord.responseTime}</p>
        </div>
      </div>

      <div className="contact-card__price">
        <strong>{formatPrice(listing.price)}</strong>
        <span>{listing.period === 'month' ? '/ month' : '/ night'}</span>
      </div>

      <div className="contact-card__meta">
        <span>
          <CalendarDays size={15} aria-hidden="true" />
          {listing.availableNow ? 'Available now' : `From ${listing.availableFrom}`}
        </span>
        {listing.depositMonths && (
          <span>
            <ShieldCheck size={15} aria-hidden="true" />
            {listing.depositMonths}{' '}
            {listing.depositMonths === 1 ? 'month' : 'months'} deposit
          </span>
        )}
      </div>

      <a
        className="btn btn--whatsapp contact-card__cta"
        href={whatsappLink(listing)}
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle size={19} aria-hidden="true" />
        Message on WhatsApp
      </a>
      <a
        className="btn btn--outline contact-card__call"
        href={`tel:+${listing.landlord.phone.replace(/\D/g, '')}`}
      >
        <Phone size={18} aria-hidden="true" />
        {formatPhone(listing.landlord.phone)}
      </a>
      <button className="copy-number" type="button" onClick={onCopyPhone}>
        <Copy size={14} aria-hidden="true" />
        Copy phone number
      </button>

      <p className="contact-card__note">
        <ShieldCheck size={15} aria-hidden="true" />
        Talk directly with the landlord. Never pay before viewing.
      </p>
      <p className="contact-card__member">
        On Efie since {listing.landlord.memberSince}
      </p>
    </div>
  )
}

function Gallery({ listing }: { listing: Listing }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const photos = listing.photos.length ? listing.photos : ['images/living.jpg']

  useEffect(() => {
    if (activeIndex === null) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null)
      if (event.key === 'ArrowRight') {
        setActiveIndex((current) =>
          current === null ? null : (current + 1) % photos.length,
        )
      }
      if (event.key === 'ArrowLeft') {
        setActiveIndex((current) =>
          current === null ? null : (current - 1 + photos.length) % photos.length,
        )
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', handleKey)
    }
  }, [activeIndex, photos.length])

  return (
    <>
      <div className={`gallery gallery--${Math.min(photos.length, 3)}`}>
        <button
          className="gallery__main"
          type="button"
          onClick={() => setActiveIndex(0)}
          aria-label={`Open photo gallery, ${photos.length} ${
            photos.length === 1 ? 'photo' : 'photos'
          }`}
        >
          <img src={photos[0]} alt={`${listing.title} — main photo`} />
          <span className="gallery__count">
            <Images size={15} aria-hidden="true" />
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
          </span>
        </button>
        {photos.length > 1 && (
          <div className="gallery__side">
            {photos.slice(1, 3).map((photo, index) => (
              <button
                className="gallery__thumb"
                type="button"
                key={photo}
                onClick={() => setActiveIndex(index + 1)}
                aria-label={`Open photo ${index + 2}`}
              >
                <img src={photo} alt="" loading="lazy" />
              </button>
            ))}
            {photos.length > 3 && (
              <button
                className="gallery__more"
                type="button"
                onClick={() => setActiveIndex(3)}
              >
                +{photos.length - 3} more
              </button>
            )}
          </div>
        )}
      </div>

      {activeIndex !== null && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Photos of ${listing.title}`}
          onClick={() => setActiveIndex(null)}
        >
          <div className="lightbox__bar">
            <span>
              {activeIndex + 1} / {photos.length}
            </span>
            <span className="lightbox__title">{listing.title}</span>
            <button
              className="icon-button lightbox__close"
              type="button"
              onClick={() => setActiveIndex(null)}
              aria-label="Close gallery"
              ref={closeButtonRef}
            >
              <X size={22} aria-hidden="true" />
            </button>
          </div>
          <div className="lightbox__stage" onClick={(event) => event.stopPropagation()}>
            {photos.length > 1 && (
              <button
                className="lightbox__arrow lightbox__arrow--left"
                type="button"
                onClick={() =>
                  setActiveIndex((current) =>
                    current === null
                      ? null
                      : (current - 1 + photos.length) % photos.length,
                  )
                }
                aria-label="Previous photo"
              >
                <ChevronLeft size={25} aria-hidden="true" />
              </button>
            )}
            <img src={photos[activeIndex]} alt={`${listing.title} — photo ${activeIndex + 1}`} />
            {photos.length > 1 && (
              <button
                className="lightbox__arrow lightbox__arrow--right"
                type="button"
                onClick={() =>
                  setActiveIndex((current) =>
                    current === null ? null : (current + 1) % photos.length,
                  )
                }
                aria-label="Next photo"
              >
                <ChevronRight size={25} aria-hidden="true" />
              </button>
            )}
          </div>
          <div className="lightbox__thumbs" onClick={(event) => event.stopPropagation()}>
            {photos.map((photo, index) => (
              <button
                className={`lightbox__thumb${activeIndex === index ? ' is-active' : ''}`}
                type="button"
                key={`${photo}-${index}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to photo ${index + 1}`}
                aria-current={activeIndex === index}
              >
                <img src={photo} alt="" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
