import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { seedListings } from '../data/listings'
import type { Listing, ListingDraft } from '../types'

const USER_LISTINGS_KEY = 'efie.user-listings.v1'
const SAVED_KEY = 'efie.saved-listings.v1'

interface ToastMessage {
  id: number
  message: string
}

interface StoreValue {
  listings: Listing[]
  userListings: Listing[]
  saved: string[]
  toast: ToastMessage | null
  addListing: (draft: ListingDraft) => Listing
  removeListing: (id: string) => void
  toggleSaved: (id: string) => void
  isSaved: (id: string) => boolean
  getListing: (id: string) => Listing | undefined
  notify: (message: string) => void
  dismissToast: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

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

export function StoreProvider({ children }: { children: ReactNode }) {
  const [userListings, setUserListings] = useState<Listing[]>(loadUserListings)
  const [saved, setSaved] = useState<string[]>(loadSaved)
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

  const addListing = useCallback(
    (draft: ListingDraft) => {
      const listing: Listing = {
        ...draft,
        id: makeId(),
        featured: false,
        verified: false,
        userCreated: true,
        createdAt: new Date().toISOString(),
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
    (id: string) => {
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

  const toggleSaved = useCallback((id: string) => {
    setSaved((current) => {
      const isInList = current.includes(id)
      const next = isInList ? current.filter((item) => item !== id) : [...current, id]
      try {
        saveSaved(next)
      } catch {
        // Saving the shortlist is best effort.
      }
      return next
    })
  }, [])

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
