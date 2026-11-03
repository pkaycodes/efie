import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Check,
  DoorOpen,
  Home,
  LampDesk,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { popularAreas } from '../data/listings'
import { formatPrice } from '../lib/format'
import { useStore } from '../lib/store'
import { PROPERTY_TYPES, type PropertyType } from '../types'
import { ListingCard } from '../components/ListingCard'
import { SearchPanel } from '../components/SearchPanel'

const typeDetails: Record<
  PropertyType,
  { icon: typeof Home; description: string }
> = {
  Apartment: { icon: Building2, description: 'Modern city living' },
  House: { icon: Home, description: 'Room for the whole family' },
  Studio: { icon: LampDesk, description: 'Smart, compact spaces' },
  Hostel: { icon: UsersRound, description: 'Student-friendly stays' },
  'Single room': { icon: DoorOpen, description: 'Simple and private' },
  'Short stay': { icon: CalendarDays, description: 'Book by the night' },
}

export function HomePage() {
  const { listings } = useStore()
  const latest = [...listings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
  const verifiedCount = listings.filter((listing) => listing.verified).length

  return (
    <>
      <section className="home-hero">
        <div className="home-hero__grain" aria-hidden="true" />
        <div className="container home-hero__inner">
          <div className="home-hero__copy">
            <span className="eyebrow eyebrow--light">
              <Sparkles size={14} aria-hidden="true" />
              Ghana&apos;s rental marketplace
            </span>
            <h1>
              Find a place{' '}
              <br />
              that feels like <em>home.</em>
            </h1>
            <p className="home-hero__lede">
              Apartments, houses and hostels across Ghana. Real photos, clear
              prices and a direct line to the landlord on WhatsApp.
            </p>
            <div className="home-hero__trust">
              <span>
                <BadgeCheck size={16} aria-hidden="true" /> Verified landlords
              </span>
              <span>
                <MessageCircle size={16} aria-hidden="true" /> Chat on WhatsApp
              </span>
              <span>
                <ShieldCheck size={16} aria-hidden="true" /> No agent runaround
              </span>
            </div>
          </div>

          <div className="home-hero__visual">
            <div className="hero-photo">
              <img
                src="images/hero.jpg"
                alt="A modern white home with a swimming pool and palm trees"
              />
              <span className="hero-photo__label">
                <MapPin size={14} aria-hidden="true" />
                East Legon, Accra
              </span>
            </div>
            <span className="hero-visual__sun" aria-hidden="true" />
            <Link className="hero-listing" to="/listing/east-legon-pool-house">
              <img src="images/pool.jpg" alt="" />
              <span className="hero-listing__body">
                <span className="hero-listing__eyebrow">Featured in East Legon</span>
                <strong>3-bed home with a pool</strong>
                <span className="hero-listing__price">
                  {formatPrice(12000)} <small>/ month</small>
                </span>
              </span>
              <span className="hero-listing__arrow" aria-hidden="true">
                <ArrowUpRight size={18} />
              </span>
            </Link>
            <div className="hero-stat">
              <span className="hero-stat__icon" aria-hidden="true">
                <BadgeCheck size={18} />
              </span>
              <span>
                <strong>{verifiedCount} verified</strong>
                <small>places to call home</small>
              </span>
            </div>
          </div>

          <div className="home-hero__search">
            <SearchPanel />
          </div>
        </div>
      </section>

      <section className="section section--types">
        <div className="container">
          <div className="section-heading section-heading--split">
            <div>
              <span className="eyebrow">Start with the space</span>
              <h2>What are you looking for?</h2>
            </div>
            <Link className="text-link" to="/browse">
              Browse every rental
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>

          <div className="type-grid">
            {PROPERTY_TYPES.map((type) => {
              const Icon = typeDetails[type].icon
              const count = listings.filter((listing) => listing.type === type).length
              return (
                <Link
                  className="type-card"
                  to={`/browse?type=${encodeURIComponent(type)}`}
                  key={type}
                >
                  <span className="type-card__icon" aria-hidden="true">
                    <Icon size={23} strokeWidth={1.8} />
                  </span>
                  <span className="type-card__text">
                    <strong>{type}</strong>
                    <small>{typeDetails[type].description}</small>
                  </span>
                  <span className="type-card__meta">
                    {count} {count === 1 ? 'place' : 'places'}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section section--listings">
        <div className="container">
          <div className="section-heading section-heading--split">
            <div>
              <span className="eyebrow">Fresh on Efie</span>
              <h2>Places you&apos;ll want to come home to</h2>
              <p>
                Newly listed homes from landlords across Ghana. Save your favourites
                and reach out when you&apos;re ready.
              </p>
            </div>
            <Link className="btn btn--outline btn--sm section-heading__cta" to="/browse">
              View all rentals
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="listing-grid">
            {latest.map((listing) => (
              <ListingCard listing={listing} key={listing.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section--areas">
        <div className="container">
          <div className="section-heading section-heading--split">
            <div>
              <span className="eyebrow">Find your neighbourhood</span>
              <h2>Where in Ghana are you headed?</h2>
            </div>
            <p className="section-heading__aside">
              From the quiet streets of East Legon to the coast in Takoradi, start
              with an area you know.
            </p>
          </div>

          <div className="area-grid">
            {popularAreas.map((area, index) => {
              const count = listings.filter(
                (listing) =>
                  listing.city.toLowerCase() === area.name.toLowerCase() ||
                  listing.area.toLowerCase() === area.name.toLowerCase(),
              ).length
              return (
                <Link
                  className={`area-card${index === 0 ? ' area-card--wide' : ''}`}
                  to={`/browse?location=${encodeURIComponent(area.name)}`}
                  key={area.name}
                >
                  <img src={area.image} alt="" loading="lazy" />
                  <span className="area-card__shade" aria-hidden="true" />
                  <span className="area-card__content">
                    <span className="area-card__city">{area.city}</span>
                    <strong>{area.name}</strong>
                    <small>
                      {area.blurb} · {count} {count === 1 ? 'rental' : 'rentals'}
                    </small>
                  </span>
                  <span className="area-card__arrow" aria-hidden="true">
                    <ArrowUpRight size={18} />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="section section--how">
        <div className="container how-strip">
          <div className="how-strip__intro">
            <span className="eyebrow">How Efie works</span>
            <h2>Less searching. More living.</h2>
            <p>
              No middlemen, no endless phone tag. Find a place you like and speak
              directly to the person who owns it.
            </p>
            <Link className="btn btn--dark btn--sm" to="/how-it-works">
              See how it works
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <ol className="how-steps">
            <li>
              <span className="how-steps__number">01</span>
              <span className="how-steps__icon" aria-hidden="true">
                <Search size={21} />
              </span>
              <div>
                <h3>Search with real filters</h3>
                <p>Browse by area, budget, type and number of bedrooms.</p>
              </div>
            </li>
            <li>
              <span className="how-steps__number">02</span>
              <span className="how-steps__icon" aria-hidden="true">
                <MessageCircle size={21} />
              </span>
              <div>
                <h3>Message the landlord</h3>
                <p>Tap WhatsApp or call. No agent in the middle.</p>
              </div>
            </li>
            <li>
              <span className="how-steps__number">03</span>
              <span className="how-steps__icon" aria-hidden="true">
                <Check size={21} />
              </span>
              <div>
                <h3>Visit, agree and move in</h3>
                <p>Inspect the place, agree the terms and settle in.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="landlord-band">
        <div className="container landlord-band__inner">
          <div className="landlord-band__copy">
            <span className="eyebrow eyebrow--light">For landlords</span>
            <h2>Your next tenant is already looking.</h2>
            <p>
              Post your apartment, house or hostel for free. Renters find you,
              message you on WhatsApp and arrange a viewing — without the usual
              runaround.
            </p>
            <ul className="check-list">
              <li>
                <Check size={16} aria-hidden="true" /> Free to list in minutes
              </li>
              <li>
                <Check size={16} aria-hidden="true" /> Calls and WhatsApp straight
                to you
              </li>
              <li>
                <Check size={16} aria-hidden="true" /> Reach renters across Ghana
              </li>
            </ul>
            <div className="landlord-band__actions">
              <Link className="btn btn--accent" to="/post">
                List your property
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <span>It takes about 4 minutes.</span>
            </div>
          </div>

          <div className="landlord-band__visual">
            <img
              src="images/garden.jpg"
              alt="A modern home with a deck and a pool"
              loading="lazy"
            />
            <div className="enquiry-card">
              <span className="enquiry-card__icon" aria-hidden="true">
                <MessageCircle size={18} />
              </span>
              <div>
                <strong>New WhatsApp enquiry</strong>
                <p>&ldquo;Hello, is the East Legon apartment still available?&rdquo;</p>
              </div>
              <span className="enquiry-card__time">now</span>
            </div>
            <div className="landlord-band__badge">
              <BadgeCheck size={17} aria-hidden="true" />
              Direct to the landlord
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
