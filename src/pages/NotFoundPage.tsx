import { ArrowLeft, Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageTitle } from '../lib/usePageTitle'

export function NotFoundPage() {
  usePageTitle('Page not found')

  return (
    <section className="not-found">
      <div className="container not-found__inner">
        <span className="not-found__icon" aria-hidden="true">
          <Compass size={30} />
        </span>
        <span className="not-found__code">404</span>
        <h1>This address doesn&apos;t exist.</h1>
        <p>
          The page you were looking for may have moved. Let&apos;s get you back to
          somewhere familiar.
        </p>
        <Link className="btn btn--dark" to="/">
          Back to home
          <ArrowLeft size={17} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
