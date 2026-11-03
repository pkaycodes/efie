import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link className="brand" to="/">
      <span className="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" role="presentation">
          <path d="M7 18.8 20 7l13 11.8V32a2.5 2.5 0 0 1-2.5 2.5h-7.2V25a3.3 3.3 0 0 0-6.6 0v9.5H9.5A2.5 2.5 0 0 1 7 32V18.8Z" />
          <circle cx="30.5" cy="10" r="3.7" />
        </svg>
      </span>
      <span className="brand__text">
        <span className="brand__name">
          efie<span className="brand__dot">.</span>
        </span>
        <span className="brand__sub">Rentals Ghana</span>
      </span>
    </Link>
  )
}
