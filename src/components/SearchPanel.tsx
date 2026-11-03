import { useState, type FormEvent } from 'react'
import { ChevronDown, MapPin, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { searchAreas } from '../data/listings'
import { PROPERTY_TYPES } from '../types'

const budgets = [
  { label: 'Any budget', min: '', max: '' },
  { label: 'Under GH₵ 1,000', min: '', max: '1000' },
  { label: 'GH₵ 1,000 – 2,500', min: '1000', max: '2500' },
  { label: 'GH₵ 2,500 – 5,000', min: '2500', max: '5000' },
  { label: 'GH₵ 5,000 – 10,000', min: '5000', max: '10000' },
  { label: 'GH₵ 10,000+', min: '10000', max: '' },
]

export function SearchPanel() {
  const navigate = useNavigate()
  const [location, setLocation] = useState('')
  const [type, setType] = useState('')
  const [budget, setBudget] = useState('0')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (location.trim()) params.set('location', location.trim())
    if (type) params.set('type', type)
    const selectedBudget = budgets[Number(budget)]
    if (selectedBudget?.min) params.set('minPrice', selectedBudget.min)
    if (selectedBudget?.max) params.set('maxPrice', selectedBudget.max)
    navigate(`/browse?${params.toString()}`)
  }

  return (
    <form className="search-panel" onSubmit={handleSubmit} role="search">
      <div className="search-panel__field search-panel__where">
        <label htmlFor="home-location">Where</label>
        <div className="search-panel__input">
          <MapPin size={19} aria-hidden="true" />
          <input
            id="home-location"
            name="location"
            type="text"
            list="search-areas"
            placeholder="Area, city or region"
            autoComplete="off"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
          <datalist id="search-areas">
            {searchAreas.map((area) => (
              <option key={area} value={area} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="search-panel__field">
        <label htmlFor="home-type">Property type</label>
        <div className="search-panel__input search-panel__select">
          <select
            id="home-type"
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="">All types</option>
            {PROPERTY_TYPES.map((propertyType) => (
              <option key={propertyType} value={propertyType}>
                {propertyType}
              </option>
            ))}
          </select>
          <ChevronDown size={17} aria-hidden="true" />
        </div>
      </div>

      <div className="search-panel__field">
        <label htmlFor="home-budget">Budget</label>
        <div className="search-panel__input search-panel__select">
          <select
            id="home-budget"
            name="budget"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          >
            {budgets.map((option, index) => (
              <option key={option.label} value={index}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown size={17} aria-hidden="true" />
        </div>
      </div>

      <button className="btn btn--accent search-panel__submit" type="submit">
        <Search size={19} aria-hidden="true" />
        <span>Search</span>
      </button>
    </form>
  )
}
