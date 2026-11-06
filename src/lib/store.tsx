import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { seedListings } from '../data/listings'
import { getSupabase, isSupabaseConfigured } from './supabase'
import type {
  Furnishing,
  Landlord,
  Listing,
  ListingDraft,
  PropertyType,
  Region,
  RentPeriod,
} from '../types'

const USER_LISTINGS_KEY = 'efie.user-listings.v1'
const SAVED_KEY = 'efie.saved-listings.v1'
const PHOTO_BUCKET = 'listing-photos'
const PHOTO_MARKER = `/storage/v1/object/public/${PHOTO_BUCKET}/`

interface ToastMessage {
  id: number
  message: string
}

interface StoreValue {
  listings: Listing[]
  userListings: Listing[]
  saved: string[]
  toast: ToastMessage | null
  isShared: boolean
  addListing: (draft: ListingDraft) => Promise<Listing>
  removeListing: (id: string) => Promise<void>
  toggleSaved: (id: string) => Promise<void>
  isSaved: (id: string) => boolean
  getListing: (id: string) => Listing | undefined
  notify: (message: string) => void
  dismissToast: () => void
}

interface ListingRow {
  id: string
  owner_id: string
  title: string
  type: string
  price: number
  period: string
  area: string
  city: string
  region: string
  landmark: string
  lat: number | null
  lng: number | null
  bedrooms: number
  bathrooms: number
  size_sqm: number
  furnishing: string
  amenities: string[] | null
  description: string
  photos: string[] | null
  landlord: Landlord
  featured: boolean
  verified: boolean
  available_now: boolean
  available_from: string | null
  deposit_months: number | null
  utilities_included: boolean
  created_at: string
}

const StoreContext = createContext<StoreValue | null>(null)

let viewerPromise: Promise<string> | null = null

function loadUserListings(): Listing[] {
  try {
    const raw = window.localStorage.getItem(USER_LISTINGS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isStoredListing)
  } catch {
    return []
  }
}

function isStoredListing(value: unknown): value is Listing {
  if (!value || typeof value !== 'object') return false
  const listing = value as Record<string, unknown>
  return (
    typeof listing.id === 'string' &&
    typeof listing.title === 'string' &&
    typeof listing.price === 'number' &&
    Array.isArray(listing.photos) &&
    Array.isArray(listing.amenities) &&
    typeof listing.landlord === 'object' &&
    listing.userCreated === true
  )
}

function loadSaved(): string[] {
  try {
    const raw = window.localStorage.getItem(SAVED_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

function saveUserListings(listings: Listing[]) {
  window.localStorage.setItem(USER_LISTINGS_KEY, JSON.stringify(listings))
}

function saveSaved(ids: string[]) {
  window.localStorage.setItem(SAVED_KEY, JSON.stringify(ids))
}

function makeId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `user-${crypto.randomUUID()}`
  }
  return `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function rowToListing(row: ListingRow): Listing {
  return {
    id: row.id,
    title: row.title,
    type: row.type as PropertyType,
    price: row.price,
    period: row.period as RentPeriod,
    area: row.area,
    city: row.city,
    region: row.region as Region,
    landmark: row.landmark,
    lat: row.lat ?? 0,
    lng: row.lng ?? 0,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    sizeSqm: row.size_sqm,
    furnishing: row.furnishing as Furnishing,
    amenities: row.amenities ?? [],
    description: row.description,
    photos: row.photos ?? [],
    landlord: row.landlord,
    featured: row.featured,
    verified: row.verified,
    availableNow: row.available_now,
    availableFrom: row.available_from ?? undefined,
    depositMonths: row.deposit_months ?? undefined,
    utilitiesIncluded: row.utilities_included,
    createdAt: row.created_at,
    userCreated: true,
  }
}

function listingToRow(listing: Listing, ownerId: string) {
  return {
    id: listing.id,
    owner_id: ownerId,
    title: listing.title,
    type: listing.type,
    price: listing.price,
    period: listing.period,
    area: listing.area,
    city: listing.city,
    region: listing.region,
    landmark: listing.landmark,
    lat: listing.lat,
    lng: listing.lng,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    size_sqm: listing.sizeSqm,
    furnishing: listing.furnishing,
    amenities: listing.amenities,
    description: listing.description,
    photos: listing.photos,
    landlord: listing.landlord,
    featured: listing.featured,
    verified: listing.verified,
    available_now: listing.availableNow,
    available_from: listing.availableFrom ?? null,
    deposit_months: listing.depositMonths ?? null,
    utilities_included: listing.utilitiesIncluded,
    created_at: listing.createdAt,
  }
}

function getExistingViewerId(supabase: SupabaseClient): Promise<string | null> {
  return supabase.auth.getSession().then(({ data, error }) => {
    if (error) throw error
    return data.session?.user.id ?? null
  })
}

/**
 * Every visitor who posts or saves something gets a lightweight anonymous
 * Supabase user. It keeps the flow account-free while still letting people
 * manage only their own listings and saved rentals through row-level security.
 */
function getViewerId(supabase: SupabaseClient): Promise<string> {
  if (!viewerPromise) {
    viewerPromise = (async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      if (sessionData.session?.user) return sessionData.session.user.id

      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) throw error
      if (!data.user) throw new Error('Could not start a secure session.')
      return data.user.id
    })().catch((error: unknown) => {
      viewerPromise = null
      throw error
    })
  }
  return viewerPromise
}

async function uploadPhotos(
  supabase: SupabaseClient,
  photos: string[],
  viewerId: string,
): Promise<string[]> {
  const uploaded: string[] = []

  for (const photo of photos) {
    if (!photo.startsWith('data:')) {
      uploaded.push(photo)
      continue
    }

    const blob = await (await fetch(photo)).blob()
    const extension =
      blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg'
    const path = `${viewerId}/${makeId()}.${extension}`
    const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, {
      cacheControl: '31536000',
      contentType: blob.type || 'image/jpeg',
    })

    if (error) throw new Error('Could not upload your photos. Please try again.')

    uploaded.push(supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl)
  }

  return uploaded
}

async function removePhotos(supabase: SupabaseClient, photos: string[]) {
  const paths = photos
    .map((photo) => {
      const index = photo.indexOf(PHOTO_MARKER)
      return index >= 0 ? photo.slice(index + PHOTO_MARKER.length) : null
    })
    .filter((path): path is string => Boolean(path))

  if (!paths.length) return

  try {
    await supabase.storage.from(PHOTO_BUCKET).remove(paths)
  } catch {
    // Removing the listing matters more than tidying its photo files.
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [userListings, setUserListings] = useState<Listing[]>(loadUserListings)
  const [saved, setSaved] = useState<string[]>(loadSaved)
  const [sharedReady, setSharedReady] = useState(false)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const listings = useMemo(
    () => [...userListings, ...seedListings],
    [userListings],
  )

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const notify = useCallback((message: string) => {
    setToast({ id: Date.now(), message })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  useEffect(() => {
    const clientPromise = getSupabase()
    if (!clientPromise) return

    let cancelled = false

    void (async () => {
      try {
        const supabase = await clientPromise
        const viewerId = await getExistingViewerId(supabase)
        const listingsResult = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false })

        if (listingsResult.error) throw listingsResult.error
        if (cancelled) return

        const remoteListings = (listingsResult.data as ListingRow[]).map(rowToListing)
        setUserListings(remoteListings)
        setSharedReady(true)
        try {
          saveUserListings(remoteListings)
        } catch {
          // The shared copy is authoritative; the cache is only a fallback.
        }

        if (viewerId) {
          const savedResult = await supabase
            .from('saved_listings')
            .select('listing_id')
            .eq('user_id', viewerId)

          if (!savedResult.error && !cancelled) {
            const ids = (savedResult.data as { listing_id: string }[]).map(
              (row) => row.listing_id,
            )
            setSaved(ids)
            saveSaved(ids)
          }
        }
      } catch {
        if (!cancelled) {
          notify('Could not reach the shared listings. Showing what is saved in this browser.')
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [notify])

  const addListing = useCallback(
    async (draft: ListingDraft): Promise<Listing> => {
      const listing: Listing = {
        ...draft,
        id: makeId(),
        featured: false,
        verified: false,
        userCreated: true,
        createdAt: new Date().toISOString(),
      }

      const clientPromise = getSupabase()

      if (clientPromise) {
        const supabase = await clientPromise
        const viewerId = await getViewerId(supabase)
        const photos = await uploadPhotos(supabase, draft.photos, viewerId)
        const savedListing = { ...listing, photos }
        const { error } = await supabase
          .from('listings')
          .insert(listingToRow(savedListing, viewerId))

        if (error) {
          throw new Error('Could not publish your listing. Please try again.')
        }

        setUserListings((current) => {
          const next = [savedListing, ...current]
          try {
            saveUserListings(next)
          } catch {
            // The shared copy is safe even if the local cache is full.
          }
          return next
        })
        notify('Your property is live. Share it with a tenant on WhatsApp.')
        return savedListing
      }

      const next = [listing, ...userListings]
      setUserListings(next)
      try {
        saveUserListings(next)
        notify('Your property is live. Share it with a tenant on WhatsApp.')
      } catch {
        notify('Your property is live, but this browser could not save it. Try fewer photos.')
      }
      return listing
    },
    [notify, userListings],
  )

  const removeListing = useCallback(
    async (id: string) => {
      const clientPromise = getSupabase()

      if (clientPromise) {
        try {
          const supabase = await clientPromise
          const viewerId = await getViewerId(supabase)
          const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', id)
            .eq('owner_id', viewerId)

          if (error) throw error

          await supabase
            .from('saved_listings')
            .delete()
            .eq('user_id', viewerId)
            .eq('listing_id', id)

          const removed = userListings.find((listing) => listing.id === id)
          if (removed) void removePhotos(supabase, removed.photos)
        } catch {
          notify('Could not delete that listing. Check your connection and try again.')
          return
        }
      }

      const next = userListings.filter((listing) => listing.id !== id)
      setUserListings(next)
      setSaved((current) => {
        const nextSaved = current.filter((savedId) => savedId !== id)
        try {
          saveSaved(nextSaved)
        } catch {
          // Saving the shortlist is best effort.
        }
        return nextSaved
      })
      try {
        saveUserListings(next)
        notify('Listing deleted.')
      } catch {
        notify('The listing was removed, but this browser could not update its storage.')
      }
    },
    [notify, userListings],
  )

  const toggleSaved = useCallback(
    async (id: string) => {
      const isInList = saved.includes(id)
      const next = isInList ? saved.filter((item) => item !== id) : [...saved, id]

      setSaved(next)
      try {
        saveSaved(next)
      } catch {
        // Saving the shortlist is best effort.
      }

      const clientPromise = getSupabase()
      if (!clientPromise) return

      try {
        const supabase = await clientPromise
        const viewerId = await getViewerId(supabase)

        if (isInList) {
          const { error } = await supabase
            .from('saved_listings')
            .delete()
            .eq('user_id', viewerId)
            .eq('listing_id', id)
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('saved_listings')
            .insert({ user_id: viewerId, listing_id: id })
          if (error && error.code !== '23505') throw error
        }
      } catch {
        setSaved((current) => {
          const rolledBack = isInList
            ? [...current, id]
            : current.filter((item) => item !== id)
          try {
            saveSaved(rolledBack)
          } catch {
            // Saving the shortlist is best effort.
          }
          return rolledBack
        })
        notify('Could not sync your saved rentals. Please try again.')
      }
    },
    [notify, saved],
  )

  const isSaved = useCallback((id: string) => saved.includes(id), [saved])

  const getListing = useCallback(
    (id: string) => listings.find((listing) => listing.id === id),
    [listings],
  )

  const value = useMemo<StoreValue>(
    () => ({
      listings,
      userListings,
      saved,
      toast,
      isShared: isSupabaseConfigured && sharedReady,
      addListing,
      removeListing,
      toggleSaved,
      isSaved,
      getListing,
      notify,
      dismissToast,
    }),
    [
      listings,
      userListings,
      saved,
      toast,
      sharedReady,
      addListing,
      removeListing,
      toggleSaved,
      isSaved,
      getListing,
      notify,
      dismissToast,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used inside StoreProvider')
  return context
}
