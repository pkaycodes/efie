import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { ListingCard } from '../components/ListingCard'
import { listingSearchText } from '../lib/format'
import { useStore } from '../lib/store'
import { usePageTitle } from '../lib/usePageTitle'
import { PROPERTY_TYPES } from '../types'

const bedroomOptions = [
  { label: 'Any', value: '' },
  { label: '1+', value: '1' },
  { label: '2+', value: '2' },
  { label: '3+', value: '3' },
  { label: '4+', value: '4' },
]

const furnishingOptions = ['Furnished', 'Part-furnished', 'Unfurnished']

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
]

export function BrowsePage() {
  usePageTitle('Rentals in Ghana')
  const { listings } = useStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const queryString = searchParams.toString()
  const q = searchParams.get('q') ?? ''
  const location = searchParams.get('location') ?? ''
  const type = searchParams.get('type') ?? ''
  const minPrice = searchParams.get('minPrice') ?? ''
  const maxPrice = searchParams.get('maxPrice') ?? ''
  const beds = searchParams.get('beds') ?? ''
  const furnishing = searchParams.get('furnishing') ?? ''
  const verifiedOnly = searchParams.get('verified') === '1'
  const sort = searchParams.get('sort') ?? 'newest'

  const [searchText, setSearchText] = useState(q)
  const [locationInput, setLocationInput] = useState(location)
  const [minInput, setMinInput] = useState(minPrice)
  const [maxInput, setMaxInput] = useState(maxPrice)

  useEffect(() => {
    setSearchText(q)
    setLocationInput(location)
    setMinInput(minPrice)
    setMaxInput(maxPrice)
  }, [queryString, q, location, minPrice, maxPrice])

  useEffect(() => {
    if (!filtersOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [filtersOpen])

  const filtered = useMemo(() => {
    const normalizedLocation = location.trim().toLowerCase()
    const normalizedQuery = q.trim().toLowerCase()
    const min = minPrice ? Number(minPrice) : null
    const max = maxPrice ? Number(maxPrice) : null
    const bedroomCount = beds ? Number(beds) : null

    const matches = listings.filter((listing) => {
      if (type && listing.type !== type) return false
      if (verifiedOnly && !listing.verified) return false
      if (furnishing && listing.furnishing !== furnishing) return false
      if (bedroomCount !== null && listing.bedrooms < bedroomCount) return false
      if (min !== null && listing.price < min) return false
      if (max !== null && listing.price > max) return false
      if (normalizedLocation) {
        const haystack = `${listing.area} ${listing.city} ${listing.region}`.toLowerCase()
        if (!haystack.includes(normalizedLocation)) return false
      }
      if (normalizedQuery && !listingSearchText(listing).includes(normalizedQuery)) {
        return false
      }
      return true
    })

    return matches.sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [
    listings,
    type,
    verifiedOnly,
    furnishing,
    beds,
    minPrice,
    maxPrice,
    location,
    q,
    sort,
  ])

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
  }

  function applyFilters(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    const next = new URLSearchParams(searchParams)
    if (locationInput.trim()) next.set('location', locationInput.trim())
    else next.delete('location')
    if (minInput) next.set('minPrice', minInput)
    else next.delete('minPrice')
    if (maxInput) next.set('maxPrice', maxInput)
    else next.delete('maxPrice')
    setSearchParams(next, { replace: true })
    setFiltersOpen(false)
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateParam('q', searchText.trim())
  }

  function resetFilters() {
    setSearchParams({}, { replace: true })
    setFiltersOpen(false)
  }

  function chooseBeds(value: string) {
    updateParam('beds', value)
  }

  const activeFilters: { key: string; label: string; remove: () => void }[] = []
  if (q) {
    activeFilters.push({
      key: 'q',
      label: `“${q}”`,
      remove: () => updateParam('q', ''),
    })
  }
  if (location) {
    activeFilters.push({
      key: 'location',
      label: location,
      remove: () => updateParam('location', ''),
    })
  }
  if (type) {
    activeFilters.push({ key: 'type', label: type, remove: () => updateParam('type', '') })
  }
  if (minPrice || maxPrice) {
    const budgetLabel = `GH₵ ${minPrice || '0'} – ${maxPrice || 'any'}`
    activeFilters.push({
      key: 'price',
      label: budgetLabel,
      remove: () => {
        const next = new URLSearchParams(searchParams)
        next.delete('minPrice')
        next.delete('maxPrice')
        setSearchParams(next, { replace: true })
      },
    })
  }
  if (beds) {
    activeFilters.push({
      key: 'beds',
      label: `${beds}+ bedrooms`,
      remove: () => updateParam('beds', ''),
    })
  }
  if (furnishing) {
    activeFilters.push({
      key: 'furnishing',
      label: furnishing,
      remove: () => updateParam('furnishing', ''),
    })
  }
  if (verifiedOnly) {
    activeFilters.push({
      key: 'verified',
      label: 'Verified only',
      remove: () => updateParam('verified', ''),
    })
  }

  const hasActiveFilters = activeFilters.length > 0

  return (
    <>
      <section className="browse-hero">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>Rentals</span>
          </nav>
          <div className="browse-hero__heading">
            <div>
              <span className="eyebrow">Rentals in Ghana</span>
              <h1>Find your next home.</h1>
            </div>
            <p>
              Search apartments, houses, hostels and short stays. Every listing
              shows the rent, the area and a direct way to reach the landlord.
            </p>
          </div>

          <form className="browse-search" onSubmit={submitSearch} role="search">
            <Search size={21} aria-hidden="true" />
            <label className="sr-only" htmlFor="browse-keyword">
              Search rentals
            </label>
            <input
              id="browse-keyword"
              type="search"
              placeholder="Search by area, property name or landmark..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            <button className="btn btn--dark" type="submit">
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="browse-results">
        <div className="container browse-layout">
          <aside className={`filters${filtersOpen ? ' is-open' : ''}`} aria-label="Rental filters">
            <div className="filters__header">
              <h2>Filters</h2>
              <div className="filters__header-actions">
                {hasActiveFilters && (
                  <button className="text-button" type="button" onClick={resetFilters}>
                    <RotateCcw size={14} aria-hidden="true" />
                    Reset
                  </button>
                )}
                <button
                  className="icon-button filters__close"
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
            </div>

            <form onSubmit={applyFilters}>
              <div className="filters__group">
                <label className="filters__label" htmlFor="filter-location">
                  Location
                </label>
                <div className="filters__input-with-icon">
                  <MapPin size={17} aria-hidden="true" />
                  <input
                    id="filter-location"
                    type="text"
                    placeholder="Area, city or region"
                    value={locationInput}
                    onChange={(event) => setLocationInput(event.target.value)}
                  />
                </div>
              </div>

              <div className="filters__group">
                <label className="filters__label" htmlFor="filter-type">
                  Property type
                </label>
                <div className="select-wrap">
                  <select
                    id="filter-type"
                    value={type}
                    onChange={(event) => updateParam('type', event.target.value)}
                  >
                    <option value="">Any type</option>
                    {PROPERTY_TYPES.map((propertyType) => (
                      <option key={propertyType} value={propertyType}>
                        {propertyType}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </div>
              </div>

              <div className="filters__group">
                <span className="filters__label">Price range</span>
                <div className="filters__price">
                  <label>
                    <span>Min</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      placeholder="0"
                      value={minInput}
                      onChange={(event) => setMinInput(event.target.value)}
                    />
                  </label>
                  <span className="filters__price-dash" aria-hidden="true">
                    –
                  </span>
                  <label>
                    <span>Max</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      placeholder="Any"
                      value={maxInput}
                      onChange={(event) => setMaxInput(event.target.value)}
                    />
                  </label>
                </div>
                <p className="filters__hint">Ghana cedis, per month or night</p>
              </div>

              <div className="filters__group">
                <span className="filters__label">Bedrooms</span>
                <div className="pill-group" role="group" aria-label="Minimum bedrooms">
                  {bedroomOptions.map((option) => (
                    <button
                      className={`pill${beds === option.value ? ' is-active' : ''}`}
                      type="button"
                      key={option.label}
                      aria-pressed={beds === option.value}
                      onClick={() => chooseBeds(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filters__group">
                <label className="filters__label" htmlFor="filter-furnishing">
                  Furnishing
                </label>
                <div className="select-wrap">
                  <select
                    id="filter-furnishing"
                    value={furnishing}
                    onChange={(event) => updateParam('furnishing', event.target.value)}
                  >
                    <option value="">Any</option>
                    {furnishingOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </div>
              </div>

              <label className="switch-row">
                <span>
                  <BadgeCheck size={17} aria-hidden="true" />
                  Verified landlords only
                </span>
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(event) => updateParam('verified', event.target.checked ? '1' : '')}
                />
                <span className="switch" aria-hidden="true" />
              </label>

              <button className="btn btn--dark filters__apply" type="submit">
                Show {filtered.length} {filtered.length === 1 ? 'home' : 'homes'}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </form>
          </aside>

          {filtersOpen && (
            <button
              className="filters-backdrop"
              type="button"
              aria-label="Close filters"
              onClick={() => setFiltersOpen(false)}
            />
          )}

          <div className="browse-main">
            <div className="browse-toolbar">
              <div>
                <p className="browse-toolbar__count">
                  <strong>{filtered.length}</strong>{' '}
                  {filtered.length === 1 ? 'rental' : 'rentals'} found
                </p>
                <p className="browse-toolbar__sub">
                  {location ? `In ${location}` : 'Across Ghana'}
                </p>
              </div>
              <div className="browse-toolbar__actions">
                <button
                  className="btn btn--outline btn--sm filter-toggle"
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                >
                  <SlidersHorizontal size={16} aria-hidden="true" />
                  Filters
                  {hasActiveFilters && <span className="filter-count">{activeFilters.length}</span>}
                </button>
                <div className="select-wrap sort-select">
                  <label className="sr-only" htmlFor="sort">
                    Sort listings
                  </label>
                  <select
                    id="sort"
                    value={sort}
                    onChange={(event) => updateParam('sort', event.target.value)}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} aria-hidden="true" />
                </div>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="active-filters">
                {activeFilters.map((filter) => (
                  <button
                    className="active-filter"
                    type="button"
                    key={filter.key}
                    onClick={filter.remove}
                    aria-label={`Remove filter ${filter.label}`}
                  >
                    {filter.label}
                    <X size={13} aria-hidden="true" />
                  </button>
                ))}
                <button className="active-filters__clear" type="button" onClick={resetFilters}>
                  Clear all
                </button>
              </div>
            )}

            {filtered.length > 0 ? (
              <div className="listing-grid browse-grid">
                {filtered.map((listing) => (
                  <ListingCard listing={listing} key={listing.id} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-state__icon" aria-hidden="true">
                  <Search size={28} />
                </span>
                <h2>No homes match that search yet.</h2>
                <p>
                  Try a different area or widen your budget. New listings are added
                  every week.
                </p>
                <button className="btn btn--dark btn--sm" type="button" onClick={resetFilters}>
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
