import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowUpRight, Heart, Menu, X } from 'lucide-react'
import { useStore } from '../lib/store'
import { Logo } from './Logo'

const NAV_ITEMS = [
  { to: '/browse', label: 'Explore rentals' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/post', label: 'For landlords' },
]

export function Header() {
  const { saved } = useStore()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Logo />

        <nav className="site-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `site-nav__link${isActive ? ' is-active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <Link
            className="icon-button saved-button"
            to="/saved"
            aria-label={`Saved rentals${saved.length ? ` (${saved.length})` : ''}`}
            title="Saved rentals"
          >
            <Heart size={20} aria-hidden="true" />
            {saved.length > 0 && <span className="saved-button__count">{saved.length}</span>}
          </Link>
          <Link className="btn btn--dark btn--sm header-cta" to="/post">
            List your property
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <button
            className="icon-button menu-toggle"
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open &&
        createPortal(
          <div className="mobile-menu" id="mobile-menu">
            <nav className="container mobile-menu__nav" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item, index) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `mobile-menu__link${isActive ? ' is-active' : ''}`
                  }
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  <span>{item.label}</span>
                  <ArrowUpRight size={20} aria-hidden="true" />
                </NavLink>
              ))}
              <NavLink
                to="/saved"
                className={({ isActive }) =>
                  `mobile-menu__link${isActive ? ' is-active' : ''}`
                }
                style={{ animationDelay: '135ms' }}
              >
                <span>Saved rentals</span>
                {saved.length > 0 ? (
                  <span className="saved-button__count">{saved.length}</span>
                ) : (
                  <Heart size={19} aria-hidden="true" />
                )}
              </NavLink>
              <Link className="btn btn--accent mobile-menu__cta" to="/post">
                List your property
                <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
              <p className="mobile-menu__note">
                Direct to landlords. No agent runaround.
              </p>
            </nav>
          </div>,
          document.body,
        )}
    </header>
  )
}
