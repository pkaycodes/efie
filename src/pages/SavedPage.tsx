import { ArrowRight, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ListingCard } from '../components/ListingCard'
import { useStore } from '../lib/store'
import { usePageTitle } from '../lib/usePageTitle'

export function SavedPage() {
  usePageTitle('Saved rentals')
  const { saved, listings } = useStore()
  const savedListings = saved
    .map((id) => listings.find((listing) => listing.id === id))
    .filter((listing) => listing !== undefined)

  return (
    <section className="saved-page">
      <div className="container">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Your shortlist</span>
            <h1>Saved rentals</h1>
            <p>
              Keep the places you like in one spot. Tap the heart on any listing to
              add or remove it.
            </p>
          </div>
          {savedListings.length > 0 && (
            <span className="page-heading__count">
              {savedListings.length} {savedListings.length === 1 ? 'home' : 'homes'}
            </span>
          )}
        </div>

        {savedListings.length > 0 ? (
          <div className="listing-grid">
            {savedListings.map((listing) => (
              <ListingCard listing={listing} key={listing.id} />
            ))}
          </div>
        ) : (
          <div className="empty-state empty-state--tall">
            <span className="empty-state__icon" aria-hidden="true">
              <Heart size={28} />
            </span>
            <h2>Nothing saved yet.</h2>
            <p>
              When a place catches your eye, tap the heart and it will wait for you
              here.
            </p>
            <Link className="btn btn--dark btn--sm" to="/browse">
              Explore rentals
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
