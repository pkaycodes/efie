import { useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Bath,
  BedDouble,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  ImagePlus,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { amenitiesList } from '../data/listings'
import { GHANA_CITIES, coordsForCity } from '../data/locations'
import { formatPrice, normalisePhone } from '../lib/format'
import { compressImage } from '../lib/image'
import { useStore } from '../lib/store'
import { usePageTitle } from '../lib/usePageTitle'
import {
  PROPERTY_TYPES,
  REGIONS,
  type Furnishing,
  type PropertyType,
  type Region,
  type RentPeriod,
} from '../types'

interface FormState {
  title: string
  type: PropertyType
  description: string
  region: Region
  city: string
  area: string
  landmark: string
  price: string
  period: RentPeriod
  bedrooms: number
  bathrooms: number
  sizeSqm: string
  furnishing: Furnishing
  amenities: string[]
  availableNow: boolean
  availableFrom: string
  depositMonths: string
  utilitiesIncluded: boolean
  landlordName: string
  phone: string
  whatsappSame: boolean
  whatsapp: string
  consent: boolean
}

const initialState: FormState = {
  title: '',
  type: 'Apartment',
  description: '',
  region: 'Greater Accra',
  city: '',
  area: '',
  landmark: '',
  price: '',
  period: 'month',
  bedrooms: 1,
  bathrooms: 1,
  sizeSqm: '',
  furnishing: 'Furnished',
  amenities: [],
  availableNow: true,
  availableFrom: '',
  depositMonths: '2',
  utilitiesIncluded: false,
  landlordName: '',
  phone: '',
  whatsappSame: true,
  whatsapp: '',
  consent: false,
}

const bedroomValues = [0, 1, 2, 3, 4, 5, 6]

function formatDisplayDate(value: string) {
  if (!value) return undefined
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return undefined
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function PostPage() {
  usePageTitle('List your property')
  const navigate = useNavigate()
  const { addListing, userListings } = useStore()
  const [form, setForm] = useState<FormState>(initialState)
  const [photos, setPhotos] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const previewPhoto = photos[0] ?? 'images/placeholder.svg'
  const locationLabel = [form.area || 'Your area', form.city || 'City'].join(', ')
  const today = new Date().toISOString().split('T')[0]

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  function chooseType(type: PropertyType) {
    setForm((current) => {
      let bedrooms = current.bedrooms
      if (type === 'Studio') bedrooms = 0
      else if (bedrooms === 0) bedrooms = 1
      return {
        ...current,
        type,
        bedrooms,
        period: type === 'Short stay' ? 'night' : 'month',
      }
    })
  }

  function toggleAmenity(amenity: string) {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.includes(amenity)
        ? current.amenities.filter((item) => item !== amenity)
        : [...current.amenities, amenity],
    }))
  }

  async function addPhotos(files: FileList | File[]) {
    if (photos.length >= 4) {
      setPhotoError('You can add up to 4 photos.')
      return
    }
    const selected = Array.from(files)
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, 4 - photos.length)
    if (!selected.length) {
      setPhotoError('Please choose JPG, PNG or WebP images.')
      return
    }
    setPhotoError('')
    setUploading(true)
    try {
      const nextPhotos: string[] = []
      for (const file of selected) {
        nextPhotos.push(await compressImage(file))
      }
      setPhotos((current) => [...current, ...nextPhotos].slice(0, 4))
    } catch (error) {
      setPhotoError(error instanceof Error ? error.message : 'Could not add that photo.')
    } finally {
      setUploading(false)
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) void addPhotos(event.target.files)
    event.target.value = ''
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    if (event.dataTransfer.files) void addPhotos(event.dataTransfer.files)
  }

  function validate() {
    const nextErrors: Record<string, string> = {}
    if (form.title.trim().length < 8) {
      nextErrors.title = 'Give your listing a clear title of at least 8 characters.'
    }
    if (form.description.trim().length < 40) {
      nextErrors.description = 'Add at least a short paragraph (40 characters) about the place.'
    }
    if (!form.area.trim()) nextErrors.area = 'Enter the neighbourhood or area.'
    if (!form.city.trim()) nextErrors.city = 'Enter the city or town.'
    if (!form.price || Number(form.price) <= 0) {
      nextErrors.price = 'Enter a rent amount greater than zero.'
    }
    if (!form.sizeSqm || Number(form.sizeSqm) <= 0) {
      nextErrors.sizeSqm = 'Enter the approximate size in square metres.'
    }
    if (!form.availableNow && !form.availableFrom) {
      nextErrors.availableFrom = 'Choose the date the property becomes available.'
    }
    if (form.landlordName.trim().length < 3) {
      nextErrors.landlordName = 'Enter the name tenants should contact.'
    }
    const phone = normalisePhone(form.phone)
    if (!/^233\d{9}$/.test(phone)) {
      nextErrors.phone = 'Enter a valid Ghana mobile number, for example 024 123 4567.'
    }
    if (!form.whatsappSame) {
      const whatsapp = normalisePhone(form.whatsapp)
      if (!/^233\d{9}$/.test(whatsapp)) {
        nextErrors.whatsapp = 'Enter a valid WhatsApp number.'
      }
    }
    if (!form.consent) {
      nextErrors.consent = 'Please confirm that the details are accurate before posting.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!validate()) {
      window.setTimeout(() => {
        document.querySelector<HTMLElement>('.field-error')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 60)
      return
    }

    const phone = normalisePhone(form.phone)
    const whatsapp = form.whatsappSame ? phone : normalisePhone(form.whatsapp)
    const coords = coordsForCity(form.city)
    const listing = addListing({
      title: form.title.trim(),
      type: form.type,
      price: Number(form.price),
      period: form.period,
      area: form.area.trim(),
      city: form.city.trim(),
      region: form.region,
      landmark: form.landmark.trim() || `${form.area.trim()}, ${form.city.trim()}`,
      lat: coords.lat,
      lng: coords.lng,
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      sizeSqm: Number(form.sizeSqm),
      furnishing: form.furnishing,
      amenities: form.amenities,
      description: form.description.trim(),
      photos: photos.length ? photos : ['images/placeholder.svg'],
      landlord: {
        name: form.landlordName.trim(),
        phone,
        whatsapp,
        verified: false,
        memberSince: String(new Date().getFullYear()),
        responseTime: 'Usually responds within 1 day',
      },
      availableNow: form.availableNow,
      availableFrom: form.availableNow
        ? undefined
        : formatDisplayDate(form.availableFrom),
      depositMonths: form.depositMonths ? Number(form.depositMonths) : undefined,
      utilitiesIncluded: form.utilitiesIncluded,
    })

    navigate(`/listing/${listing.id}`)
  }

  return (
    <>
      <section className="post-hero">
        <div className="container post-hero__inner">
          <div>
            <span className="eyebrow eyebrow--light">
              <Sparkles size={14} aria-hidden="true" />
              For landlords
            </span>
            <h1>Let the right tenant find you.</h1>
            <p>
              List your apartment, house, hostel or single room on Efie. It is free,
              takes about four minutes, and puts your number straight in front of
              people looking for a home.
            </p>
            <div className="post-hero__chips">
              <span>
                <Check size={14} aria-hidden="true" /> Free to list
              </span>
              <span>
                <Check size={14} aria-hidden="true" /> Direct WhatsApp enquiries
              </span>
              <span>
                <Check size={14} aria-hidden="true" /> No account needed
              </span>
            </div>
          </div>
          <div className="post-hero__card">
            <div className="post-hero__card-icon" aria-hidden="true">
              <MessageCircle size={22} />
            </div>
            <p>
              &ldquo;Good afternoon. I saw your place on Efie — is it still
              available?&rdquo;
            </p>
            <span>That&apos;s the message you want to wake up to.</span>
          </div>
        </div>
      </section>

      <section className="post-page">
        <div className="container">
          <div className="post-layout">
            <form className="post-form" onSubmit={handleSubmit} noValidate>
              <section className="form-card">
                <div className="form-card__head">
                  <span className="form-step">01</span>
                  <div>
                    <h2>The basics</h2>
                    <p>A clear title and a good description do most of the work.</p>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="title">Listing title</label>
                  <input
                    id="title"
                    type="text"
                    placeholder="e.g. Sunlit 2-bedroom apartment in East Legon"
                    value={form.title}
                    onChange={(event) => updateField('title', event.target.value)}
                    aria-invalid={Boolean(errors.title)}
                    aria-describedby={errors.title ? 'title-error' : undefined}
                    maxLength={90}
                  />
                  <div className="field__meta">
                    <span>Include the type of home and the area.</span>
                    <span>{form.title.length}/90</span>
                  </div>
                  {errors.title && (
                    <p className="field-error" id="title-error">
                      {errors.title}
                    </p>
                  )}
                </div>

                <fieldset className="field">
                  <legend>Property type</legend>
                  <div className="type-picker">
                    {PROPERTY_TYPES.map((type) => (
                      <button
                        className={`type-picker__option${form.type === type ? ' is-selected' : ''}`}
                        type="button"
                        key={type}
                        onClick={() => chooseType(type)}
                        aria-pressed={form.type === type}
                      >
                        {form.type === type && (
                          <span className="type-picker__check" aria-hidden="true">
                            <Check size={12} />
                          </span>
                        )}
                        {type}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="field">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    rows={6}
                    placeholder="Tell renters what makes the place special, what is nearby, and what is included. Mention the condition, water supply, security and any house rules."
                    value={form.description}
                    onChange={(event) => updateField('description', event.target.value)}
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby={errors.description ? 'description-error' : undefined}
                  />
                  <div className="field__meta">
                    <span>A honest, detailed description gets better enquiries.</span>
                    <span>{form.description.length} characters</span>
                  </div>
                  {errors.description && (
                    <p className="field-error" id="description-error">
                      {errors.description}
                    </p>
                  )}
                </div>
              </section>

              <section className="form-card">
                <div className="form-card__head">
                  <span className="form-step">02</span>
                  <div>
                    <h2>Location</h2>
                    <p>Renters search by area, so be specific but keep the exact address private.</p>
                  </div>
                </div>

                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="region">Region</label>
                    <div className="select-wrap">
                      <select
                        id="region"
                        value={form.region}
                        onChange={(event) => updateField('region', event.target.value as Region)}
                      >
                        {REGIONS.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} aria-hidden="true" />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="city">City or town</label>
                    <input
                      id="city"
                      type="text"
                      list="city-options"
                      placeholder="e.g. Accra"
                      value={form.city}
                      onChange={(event) => updateField('city', event.target.value)}
                      aria-invalid={Boolean(errors.city)}
                      aria-describedby={errors.city ? 'city-error' : undefined}
                    />
                    <datalist id="city-options">
                      {GHANA_CITIES.map((city) => (
                        <option key={city} value={city} />
                      ))}
                    </datalist>
                    {errors.city && (
                      <p className="field-error" id="city-error">
                        {errors.city}
                      </p>
                    )}
                  </div>
                  <div className="field">
                    <label htmlFor="area">Neighbourhood or area</label>
                    <input
                      id="area"
                      type="text"
                      placeholder="e.g. East Legon"
                      value={form.area}
                      onChange={(event) => updateField('area', event.target.value)}
                      aria-invalid={Boolean(errors.area)}
                      aria-describedby={errors.area ? 'area-error' : undefined}
                    />
                    {errors.area && (
                      <p className="field-error" id="area-error">
                        {errors.area}
                      </p>
                    )}
                  </div>
                  <div className="field">
                    <label htmlFor="landmark">
                      Nearest landmark <span className="field__optional">Optional</span>
                    </label>
                    <input
                      id="landmark"
                      type="text"
                      placeholder="e.g. Near Palace Mall"
                      value={form.landmark}
                      onChange={(event) => updateField('landmark', event.target.value)}
                    />
                  </div>
                </div>
                <p className="form-hint">
                  <MapPin size={15} aria-hidden="true" />
                  We show the general area on a map. Do not publish your full house
                  address.
                </p>
              </section>

              <section className="form-card">
                <div className="form-card__head">
                  <span className="form-step">03</span>
                  <div>
                    <h2>The details</h2>
                    <p>Clear numbers help renters decide faster.</p>
                  </div>
                </div>

                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="price">Rent</label>
                    <div className="price-input">
                      <span>GH₵</span>
                      <input
                        id="price"
                        type="number"
                        inputMode="numeric"
                        min="0"
                        placeholder="4,500"
                        value={form.price}
                        onChange={(event) => updateField('price', event.target.value)}
                        aria-invalid={Boolean(errors.price)}
                        aria-describedby={errors.price ? 'price-error' : undefined}
                      />
                      <span className="price-input__period">
                        / {form.period === 'month' ? 'month' : 'night'}
                      </span>
                    </div>
                    {errors.price && (
                      <p className="field-error" id="price-error">
                        {errors.price}
                      </p>
                    )}
                  </div>

                  <fieldset className="field">
                    <legend>Rent period</legend>
                    <div className="segment-control">
                      <label>
                        <input
                          type="radio"
                          name="period"
                          value="month"
                          checked={form.period === 'month'}
                          onChange={() => updateField('period', 'month')}
                        />
                        <span>Per month</span>
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="period"
                          value="night"
                          checked={form.period === 'night'}
                          onChange={() => updateField('period', 'night')}
                        />
                        <span>Per night</span>
                      </label>
                    </div>
                  </fieldset>

                  <div className="field">
                    <label htmlFor="bedrooms">Bedrooms</label>
                    <div className="select-wrap">
                      <select
                        id="bedrooms"
                        value={form.bedrooms}
                        onChange={(event) => updateField('bedrooms', Number(event.target.value))}
                      >
                        {bedroomValues.map((value) => (
                          <option key={value} value={value}>
                            {value === 0 ? 'Studio / no separate bedroom' : value}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} aria-hidden="true" />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="bathrooms">Bathrooms</label>
                    <div className="select-wrap">
                      <select
                        id="bathrooms"
                        value={form.bathrooms}
                        onChange={(event) => updateField('bathrooms', Number(event.target.value))}
                      >
                        {[1, 2, 3, 4, 5, 6].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} aria-hidden="true" />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="size">Size (m²)</label>
                    <input
                      id="size"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      placeholder="e.g. 110"
                      value={form.sizeSqm}
                      onChange={(event) => updateField('sizeSqm', event.target.value)}
                      aria-invalid={Boolean(errors.sizeSqm)}
                      aria-describedby={errors.sizeSqm ? 'size-error' : undefined}
                    />
                    {errors.sizeSqm && (
                      <p className="field-error" id="size-error">
                        {errors.sizeSqm}
                      </p>
                    )}
                  </div>

                  <div className="field">
                    <label htmlFor="furnishing">Furnishing</label>
                    <div className="select-wrap">
                      <select
                        id="furnishing"
                        value={form.furnishing}
                        onChange={(event) =>
                          updateField('furnishing', event.target.value as Furnishing)
                        }
                      >
                        <option value="Furnished">Furnished</option>
                        <option value="Part-furnished">Part-furnished</option>
                        <option value="Unfurnished">Unfurnished</option>
                      </select>
                      <ChevronDown size={16} aria-hidden="true" />
                    </div>
                  </div>

                  <div className="field">
                    <label htmlFor="deposit">Deposit</label>
                    <div className="select-wrap">
                      <select
                        id="deposit"
                        value={form.depositMonths}
                        onChange={(event) => updateField('depositMonths', event.target.value)}
                      >
                        <option value="">No deposit</option>
                        <option value="1">1 month</option>
                        <option value="2">2 months</option>
                        <option value="3">3 months</option>
                        <option value="6">6 months</option>
                      </select>
                      <ChevronDown size={16} aria-hidden="true" />
                    </div>
                  </div>
                </div>

                <div className="toggle-grid">
                  <label className="switch-row switch-row--card">
                    <span>
                      <CalendarDays size={17} aria-hidden="true" />
                      Available now
                    </span>
                    <input
                      type="checkbox"
                      checked={form.availableNow}
                      onChange={(event) => updateField('availableNow', event.target.checked)}
                    />
                    <span className="switch" aria-hidden="true" />
                  </label>
                  <label className="switch-row switch-row--card">
                    <span>
                      <ShieldCheck size={17} aria-hidden="true" />
                      Utilities included
                    </span>
                    <input
                      type="checkbox"
                      checked={form.utilitiesIncluded}
                      onChange={(event) =>
                        updateField('utilitiesIncluded', event.target.checked)
                      }
                    />
                    <span className="switch" aria-hidden="true" />
                  </label>
                </div>

                {!form.availableNow && (
                  <div className="field date-field">
                    <label htmlFor="availableFrom">Available from</label>
                    <input
                      id="availableFrom"
                      type="date"
                      min={today}
                      value={form.availableFrom}
                      onChange={(event) => updateField('availableFrom', event.target.value)}
                      aria-invalid={Boolean(errors.availableFrom)}
                      aria-describedby={errors.availableFrom ? 'available-error' : undefined}
                    />
                    {errors.availableFrom && (
                      <p className="field-error" id="available-error">
                        {errors.availableFrom}
                      </p>
                    )}
                  </div>
                )}
              </section>

              <section className="form-card">
                <div className="form-card__head">
                  <span className="form-step">04</span>
                  <div>
                    <h2>Amenities</h2>
                    <p>Select everything the property offers.</p>
                  </div>
                </div>

                <div className="amenity-picker">
                  {amenitiesList
                    .filter((amenity) => amenity !== 'Furnished')
                    .map((amenity) => {
                      const selected = form.amenities.includes(amenity)
                      return (
                        <label
                          className={`amenity-choice${selected ? ' is-selected' : ''}`}
                          key={amenity}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleAmenity(amenity)}
                          />
                          <span className="amenity-choice__box" aria-hidden="true">
                            {selected && <Check size={13} />}
                          </span>
                          {amenity}
                        </label>
                      )
                    })}
                </div>
              </section>

              <section className="form-card">
                <div className="form-card__head">
                  <span className="form-step">05</span>
                  <div>
                    <h2>Photos</h2>
                    <p>Natural light and wide shots help your place stand out.</p>
                  </div>
                </div>

                <div
                  className={`photo-uploader${dragging ? ' is-dragging' : ''}${photos.length >= 4 ? ' is-full' : ''}`}
                  onDragOver={(event) => {
                    event.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    id="photos"
                    className="sr-only"
                    type="file"
                    accept="image/*"
                    multiple
                    aria-label="Choose property photos"
                    onChange={handleFileChange}
                    disabled={uploading || photos.length >= 4}
                  />
                  <span className="photo-uploader__icon" aria-hidden="true">
                    {uploading ? <UploadCloud size={26} /> : <ImagePlus size={26} />}
                  </span>
                  <h3>{uploading ? 'Adding your photos…' : 'Add photos of your place'}</h3>
                  <p>Drag and drop here, or choose files from your device.</p>
                  <button
                    className="btn btn--outline btn--sm"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || photos.length >= 4}
                  >
                    <Camera size={16} aria-hidden="true" />
                    {photos.length >= 4 ? 'Maximum 4 photos' : 'Choose photos'}
                  </button>
                  <span className="photo-uploader__hint">
                    JPG, PNG or WebP · up to 4 photos · first photo is the cover
                  </span>
                </div>

                {photoError && <p className="field-error">{photoError}</p>}

                {photos.length > 0 && (
                  <ul className="photo-previews">
                    {photos.map((photo, index) => (
                      <li key={`${photo.slice(0, 40)}-${index}`}>
                        <img src={photo} alt={`Upload ${index + 1}`} />
                        {index === 0 && <span className="photo-previews__cover">Cover</span>}
                        <button
                          type="button"
                          aria-label={`Remove photo ${index + 1}`}
                          onClick={() =>
                            setPhotos((current) =>
                              current.filter((_, photoIndex) => photoIndex !== index),
                            )
                          }
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {photos.length === 0 && (
                  <p className="form-hint">
                    <Camera size={15} aria-hidden="true" />
                    No photo yet? We&apos;ll use a neutral placeholder so you can still
                    preview and publish. Add a real photo later for better results.
                  </p>
                )}
              </section>

              <section className="form-card">
                <div className="form-card__head">
                  <span className="form-step">06</span>
                  <div>
                    <h2>Your contact details</h2>
                    <p>These appear on the listing so renters can reach you directly.</p>
                  </div>
                </div>

                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="landlordName">Your name</label>
                    <input
                      id="landlordName"
                      type="text"
                      placeholder="e.g. Ama Mensah"
                      value={form.landlordName}
                      onChange={(event) => updateField('landlordName', event.target.value)}
                      aria-invalid={Boolean(errors.landlordName)}
                      aria-describedby={
                        errors.landlordName ? 'landlord-name-error' : undefined
                      }
                      autoComplete="name"
                    />
                    {errors.landlordName && (
                      <p className="field-error" id="landlord-name-error">
                        {errors.landlordName}
                      </p>
                    )}
                  </div>
                  <div className="field">
                    <label htmlFor="phone">Phone number</label>
                    <div className="phone-input">
                      <span>+233</span>
                      <input
                        id="phone"
                        type="tel"
                        placeholder="24 123 4567"
                        value={form.phone}
                        onChange={(event) => updateField('phone', event.target.value)}
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                        autoComplete="tel"
                      />
                    </div>
                    <div className="field__meta">
                      <span>Shown on your listing. WhatsApp works with this number.</span>
                    </div>
                    {errors.phone && (
                      <p className="field-error" id="phone-error">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <label className="switch-row switch-row--card">
                  <span>
                    <MessageCircle size={17} aria-hidden="true" />
                    WhatsApp number is the same
                  </span>
                  <input
                    type="checkbox"
                    checked={form.whatsappSame}
                    onChange={(event) => updateField('whatsappSame', event.target.checked)}
                  />
                  <span className="switch" aria-hidden="true" />
                </label>

                {!form.whatsappSame && (
                  <div className="field">
                    <label htmlFor="whatsapp">WhatsApp number</label>
                    <div className="phone-input">
                      <span>+233</span>
                      <input
                        id="whatsapp"
                        type="tel"
                        placeholder="24 123 4567"
                        value={form.whatsapp}
                        onChange={(event) => updateField('whatsapp', event.target.value)}
                        aria-invalid={Boolean(errors.whatsapp)}
                        aria-describedby={errors.whatsapp ? 'whatsapp-error' : undefined}
                      />
                    </div>
                    {errors.whatsapp && (
                      <p className="field-error" id="whatsapp-error">
                        {errors.whatsapp}
                      </p>
                    )}
                  </div>
                )}

                <div className="submit-block">
                  <label className="consent-row">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(event) => updateField('consent', event.target.checked)}
                      aria-invalid={Boolean(errors.consent)}
                      aria-describedby={errors.consent ? 'consent-error' : undefined}
                    />
                    <span>
                      I confirm that I own or manage this property, the details are
                      accurate, and I am happy to be contacted about it.
                    </span>
                  </label>
                  {errors.consent && (
                    <p className="field-error" id="consent-error">
                      {errors.consent}
                    </p>
                  )}
                  <button
                    className="btn btn--accent btn--wide submit-block__button"
                    type="submit"
                    disabled={uploading}
                  >
                    Publish my listing
                    <ArrowUpRight size={19} aria-hidden="true" />
                  </button>
                  <p className="submit-block__note">
                    <ShieldCheck size={15} aria-hidden="true" />
                    Free to list. Your full address is never shown publicly.
                  </p>
                </div>
              </section>
            </form>

            <aside className="post-sidebar">
              <div className="preview-card">
                <div className="preview-card__head">
                  <h2>Live preview</h2>
                  <span>How renters see you</span>
                </div>
                <article className="listing-card preview-card__listing">
                  <div className="listing-card__media">
                    <img src={previewPhoto} alt="" />
                    <div className="listing-card__badges">
                      <span className="badge badge--light">{form.type}</span>
                    </div>
                  </div>
                  <div className="listing-card__body">
                    <div className="listing-card__price">
                      {form.price ? formatPrice(Number(form.price)) : 'GH₵ —'}
                      <span>{form.period === 'month' ? '/ month' : '/ night'}</span>
                    </div>
                    <h3>{form.title || 'Your property title will appear here'}</h3>
                    <p className="listing-card__location">
                      <MapPin size={14} aria-hidden="true" />
                      {locationLabel}
                    </p>
                    <div className="listing-card__specs">
                      <span>
                        <BedDouble size={15} aria-hidden="true" />
                        {form.bedrooms === 0 ? 'Studio' : `${form.bedrooms} beds`}
                      </span>
                      <span>
                        <Bath size={15} aria-hidden="true" />
                        {form.bathrooms} {form.bathrooms === 1 ? 'bath' : 'baths'}
                      </span>
                      {form.sizeSqm && (
                        <span>{form.sizeSqm} m²</span>
                      )}
                    </div>
                    <div className="listing-card__footer">
                      <span className="listing-card__landlord">
                        <span className="avatar avatar--sm" aria-hidden="true">
                          {form.landlordName
                            ? form.landlordName
                                .split(' ')
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join('')
                            : 'You'}
                        </span>
                        {form.landlordName.split(' ')[0] || 'You'}
                      </span>
                      <span className="listing-card__link">
                        View
                        <ArrowUpRight size={15} aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </article>
              </div>

              <div className="post-tips">
                <span className="post-tips__icon" aria-hidden="true">
                  <Sparkles size={20} />
                </span>
                <h2>Make your listing stand out</h2>
                <ul>
                  <li>
                    <Check size={15} aria-hidden="true" /> Use daylight photos taken
                    from a corner of the room.
                  </li>
                  <li>
                    <Check size={15} aria-hidden="true" /> Mention water, power and
                    security — renters always ask.
                  </li>
                  <li>
                    <Check size={15} aria-hidden="true" /> Be clear about the deposit
                    and what is included.
                  </li>
                </ul>
                <Link className="text-link" to="/how-it-works#landlords">
                  More landlord tips
                  <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>

              {userListings.length > 0 && (
                <Link className="manage-card" to="/my-listings">
                  <span>
                    <strong>Your listings</strong>
                    <small>
                      {userListings.length}{' '}
                      {userListings.length === 1 ? 'property' : 'properties'} posted
                      from this browser
                    </small>
                  </span>
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
              )}

              <div className="post-help">
                <Phone size={18} aria-hidden="true" />
                <p>
                  Need a hand? Email{' '}
                  <a href="mailto:hello@efie.com.gh">hello@efie.com.gh</a>.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
