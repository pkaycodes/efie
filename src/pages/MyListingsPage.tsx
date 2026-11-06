import { useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Bath,
  BedDouble,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { formatPrice, timeAgo } from '../lib/format'
import { useStore } from '../lib/store'
import { usePageTitle } from '../lib/usePageTitle'

export function MyListingsPage() {
  usePageTitle('My listings')
  const { userListings, removeListing, isShared } = useStore()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const listingToDelete = userListings.find((listing) => listing.id === deleteId)

  return (
    <section className="saved-page my-listings-page">
      <div className="container">
        <div className="page-heading">
          <div>
            <span className="eyebrow">Landlord dashboard</span>
            <h1>Your listings</h1>
            <p>
              Manage the properties you have posted
              {isShared ? ' to Efie' : ' from this browser'}. Keep details fresh so
              renters know what is still available.
            </p>
          </div>
          <Link className="btn btn--dark btn--sm page-heading__cta" to="/post">
            <Plus size={16} aria-hidden="true" />
            Add property
          </Link>
        </div>

        {userListings.length > 0 ? (
          <>
            <p className="dashboard-note">
              {userListings.length}{' '}
              {userListings.length === 1 ? 'live listing' : 'live listings'} ·{' '}
              {isShared ? 'Visible to everyone' : 'Posted on this device'}
            </p>
            <div className="managed-list">
              {userListings.map((listing) => (
                <article className="managed-card" key={listing.id}>
                  <Link
                    className="managed-card__image"
                    to={`/listing/${listing.id}`}
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <img src={listing.photos[0] ?? 'images/placeholder.svg'} alt="" />
                  </Link>
                  <div className="managed-card__body">
                    <div className="managed-card__status">
                      <span className="status-dot" aria-hidden="true" />
                      Live
                      <span>· Posted {timeAgo(listing.createdAt).toLowerCase()}</span>
                    </div>
                    <h2>
                      <Link to={`/listing/${listing.id}`}>{listing.title}</Link>
                    </h2>
                    <p className="managed-card__location">
                      <MapPin size={14} aria-hidden="true" />
                      {listing.area}, {listing.city}
                    </p>
                    <div className="managed-card__meta">
                      <span className="managed-card__price">
                        {formatPrice(listing.price)}
                        <small>{listing.period === 'month' ? '/month' : '/night'}</small>
                      </span>
                      <span>
                        <BedDouble size={15} aria-hidden="true" />
                        {listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms} beds`}
                      </span>
                      <span>
                        <Bath size={15} aria-hidden="true" />
                        {listing.bathrooms} baths
                      </span>
                    </div>
                  </div>
                  <div className="managed-card__actions">
                    <Link className="btn btn--outline btn--sm" to={`/listing/${listing.id}`}>
                      View
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </Link>
                    <button
                      className="icon-button delete-button"
                      type="button"
                      aria-label={`Delete ${listing.title}`}
                      onClick={() => setDeleteId(listing.id)}
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state empty-state--tall">
            <span className="empty-state__icon" aria-hidden="true">
              <Plus size={28} />
            </span>
            <h2>No listings yet.</h2>
            <p>
              Post your first property and it will show up here, ready for renters to
              find.
            </p>
            <Link className="btn btn--dark btn--sm" to="/post">
              List a property
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this listing?"
        confirmLabel="Delete listing"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) void removeListing(deleteId)
          setDeleteId(null)
        }}
      >
        <p>
          {listingToDelete
            ? `“${listingToDelete.title}” will be removed from Efie. This cannot be undone.`
            : 'This listing will be removed from Efie.'}
        </p>
      </ConfirmDialog>
    </section>
  )
}
