import { ArrowUpRight, Heart, Mail, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'

const exploreLinks = [
  { label: 'Apartments for rent', to: '/browse?type=Apartment' },
  { label: 'Houses for rent', to: '/browse?type=House' },
  { label: 'Student hostels', to: '/browse?type=Hostel' },
  { label: 'Short stays', to: '/browse?type=Short%20stay' },
  { label: 'Single rooms', to: '/browse?type=Single%20room' },
]

const areaLinks = [
  { label: 'East Legon, Accra', to: '/browse?location=East%20Legon' },
  { label: 'Osu, Accra', to: '/browse?location=Osu' },
  { label: 'Spintex, Accra', to: '/browse?location=Spintex' },
  { label: 'Kumasi', to: '/browse?location=Kumasi' },
  { label: 'Takoradi', to: '/browse?location=Takoradi' },
]

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__top">
        <div className="site-footer__brand">
          <Logo />
          <p>
            A simpler way to find a place to live in Ghana. Real listings, clear
            prices and a direct line to the landlord.
          </p>
          <div className="site-footer__contact">
            <span>
              <MapPin size={16} aria-hidden="true" /> Accra, Ghana
            </span>
            <a href="mailto:hello@efie.com.gh">
              <Mail size={16} aria-hidden="true" /> hello@efie.com.gh
            </a>
          </div>
          <p className="site-footer__demo">
            Demo project: property details and phone numbers are samples.
          </p>
        </div>

        <div className="site-footer__column">
          <h2>Explore</h2>
          {exploreLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="site-footer__column">
          <h2>Popular areas</h2>
          {areaLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="site-footer__column">
          <h2>Efie</h2>
          <Link to="/how-it-works">How it works</Link>
          <Link to="/how-it-works#safety">Safety &amp; viewing tips</Link>
          <Link to="/how-it-works#faq">Frequently asked questions</Link>
          <Link to="/post">List your property</Link>
          <Link to="/my-listings">Manage listings</Link>
          <Link className="site-footer__saved" to="/saved">
            <Heart size={16} aria-hidden="true" /> Saved rentals
          </Link>
        </div>
      </div>

      <div className="container site-footer__bottom">
        <p>© {new Date().getFullYear()} Efie. Made for Ghana.</p>
        <p className="site-footer__tagline">
          Find your place. <span>Feel at home.</span>
        </p>
        <Link to="/how-it-works#safety">
          Privacy &amp; safety
          <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </footer>
  )
}
