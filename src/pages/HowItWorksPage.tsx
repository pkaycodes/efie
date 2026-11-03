import { useEffect } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Camera,
  Eye,
  FileText,
  Handshake,
  Home,
  MessageCircle,
  Search,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { usePageTitle } from '../lib/usePageTitle'

const faqs = [
  {
    question: 'Is Efie free to use?',
    answer:
      'Yes. Searching, saving homes and contacting landlords is free for renters. Landlords can also list their property for free — Efie does not take a commission when a tenancy is agreed.',
  },
  {
    question: 'How do I contact a landlord?',
    answer:
      'Every listing has a contact panel with the landlord’s phone number, a WhatsApp button and a call button. Messages go directly to the person who posted the property. There is no agent in between.',
  },
  {
    question: 'Are the listings verified?',
    answer:
      'Listings marked “Verified landlord” have been reviewed by our team. For every property, you should still visit in person, confirm ownership and read the tenancy agreement before paying anything.',
  },
  {
    question: 'Do I pay rent or deposit through Efie?',
    answer:
      'No. Efie is a listing platform. We never collect rent, deposits or viewing fees. All payments should be made directly to the landlord after you have seen the property and agreed the terms.',
  },
  {
    question: 'How long does it take to post a property?',
    answer:
      'About four minutes. Add a title, location, rent, a few details, photos and your contact number. Your listing goes live immediately.',
  },
  {
    question: 'Can I remove a listing?',
    answer:
      'Yes. Go to “Manage listings” from the footer or the listing page to view and delete the properties you have posted.',
  },
]

export function HowItWorksPage() {
  usePageTitle('How it works')
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return
    const timer = window.setTimeout(() => {
      document.getElementById(hash.replace('#', ''))?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 80)
    return () => window.clearTimeout(timer)
  }, [hash])

  return (
    <>
      <section className="info-hero">
        <div className="container info-hero__inner">
          <div>
            <span className="eyebrow">How Efie works</span>
            <h1>
              A simpler way to find a home — or fill one.
            </h1>
            <p>
              Efie connects renters directly with the people who own and manage
              property. Less noise, fewer middlemen and no surprises along the way.
            </p>
            <div className="info-hero__actions">
              <Link className="btn btn--dark" to="/browse">
                Find a rental
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link className="btn btn--outline" to="/how-it-works#landlords">
                I&apos;m a landlord
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="info-hero__quote">
            <span aria-hidden="true">“</span>
            <p>
              The best rental experience is a good conversation between a renter and
              a landlord. We just make that conversation easier to start.
            </p>
            <small>The Efie team</small>
          </div>
        </div>
      </section>

      <section className="guide-section" id="renters">
        <div className="container">
          <div className="guide-block">
            <div className="guide-block__intro">
              <span className="eyebrow">For renters</span>
              <h2>From search to keys, without the runaround.</h2>
              <p>
                Browse real listings, shortlist your favourites and speak to the
                landlord yourself. You are in control of the conversation.
              </p>
              <Link className="btn btn--dark btn--sm" to="/browse">
                Browse rentals
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <ol className="guide-steps">
              <li>
                <span className="guide-steps__num">01</span>
                <span className="guide-steps__icon" aria-hidden="true">
                  <Search size={22} />
                </span>
                <div>
                  <h3>Search where it matters</h3>
                  <p>
                    Filter by neighbourhood, budget, property type, bedrooms and
                    furnishing. Save the homes that fit.
                  </p>
                </div>
              </li>
              <li>
                <span className="guide-steps__num">02</span>
                <span className="guide-steps__icon" aria-hidden="true">
                  <MessageCircle size={22} />
                </span>
                <div>
                  <h3>Message the landlord</h3>
                  <p>
                    Call or send a WhatsApp message straight from the listing. Ask
                    about water, power, the deposit and what is included.
                  </p>
                </div>
              </li>
              <li>
                <span className="guide-steps__num">03</span>
                <span className="guide-steps__icon" aria-hidden="true">
                  <Home size={22} />
                </span>
                <div>
                  <h3>Visit before you commit</h3>
                  <p>
                    See the property in person, confirm the details and agree the
                    terms. Never pay a deposit before a viewing.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <div className="guide-block guide-block--green" id="landlords">
            <div className="guide-block__intro">
              <span className="eyebrow eyebrow--light">For landlords</span>
              <h2>Your empty property. The right tenant.</h2>
              <p>
                Post it once, share it with renters across Ghana and receive
                enquiries directly on WhatsApp. No listing fees, no middlemen.
              </p>
              <Link className="btn btn--accent btn--sm" to="/post">
                List your property
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <ol className="guide-steps guide-steps--light">
              <li>
                <span className="guide-steps__num">01</span>
                <span className="guide-steps__icon" aria-hidden="true">
                  <Camera size={22} />
                </span>
                <div>
                  <h3>Create your listing</h3>
                  <p>
                    Add the rent, location, amenities and photos. We have made it
                    quick enough to do from your phone.
                  </p>
                </div>
              </li>
              <li>
                <span className="guide-steps__num">02</span>
                <span className="guide-steps__icon" aria-hidden="true">
                  <Smartphone size={22} />
                </span>
                <div>
                  <h3>Get enquiries on WhatsApp</h3>
                  <p>
                    Interested renters contact you directly. Reply when it suits
                    you and arrange viewings.
                  </p>
                </div>
              </li>
              <li>
                <span className="guide-steps__num">03</span>
                <span className="guide-steps__icon" aria-hidden="true">
                  <Handshake size={22} />
                </span>
                <div>
                  <h3>Choose your tenant</h3>
                  <p>
                    Meet your shortlist, agree the terms and welcome your new
                    tenant. Efie takes no commission.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className="safety-section" id="safety">
        <div className="container">
          <div className="section-heading section-heading--split">
            <div>
              <span className="eyebrow">Renting safely</span>
              <h2>Trust your eyes, not just the photos.</h2>
            </div>
            <p className="section-heading__aside">
              A little care goes a long way. These four habits protect both renters
              and landlords.
            </p>
          </div>

          <div className="safety-grid">
            <article>
              <span aria-hidden="true">
                <Eye size={22} />
              </span>
              <h3>See it first</h3>
              <p>
                Visit the property in person before sending any money. Ask to see
                every room and the water and power systems.
              </p>
            </article>
            <article>
              <span aria-hidden="true">
                <BadgeCheck size={22} />
              </span>
              <h3>Check ownership</h3>
              <p>
                Ask who owns the property and confirm it matches the person you are
                paying. Speak to neighbours if you are unsure.
              </p>
            </article>
            <article>
              <span aria-hidden="true">
                <FileText size={22} />
              </span>
              <h3>Put it in writing</h3>
              <p>
                Agree the rent, deposit, notice period and house rules in a simple
                tenancy agreement before you move in.
              </p>
            </article>
            <article>
              <span aria-hidden="true">
                <Wallet size={22} />
              </span>
              <h3>Keep a record</h3>
              <p>
                Pay with a traceable method and get a signed receipt for every
                payment. Do not hand cash to someone you have just met.
              </p>
            </article>
          </div>

          <div className="safety-banner">
            <span className="safety-banner__icon" aria-hidden="true">
              <ShieldCheck size={22} />
            </span>
            <p>
              <strong>Efie never collects rent or deposits.</strong> If someone asks
              you to pay through Efie, stop and report it to us at{' '}
              <a href="mailto:safety@efie.com.gh">safety@efie.com.gh</a>.
            </p>
          </div>
        </div>
      </section>

      <section className="faq-section" id="faq">
        <div className="container faq-layout">
          <div className="faq-intro">
            <span className="eyebrow">Questions, answered</span>
            <h2>Good to know.</h2>
            <p>
              Everything you need before your first search, viewing or listing.
              Still stuck? Email us at{' '}
              <a href="mailto:hello@efie.com.gh">hello@efie.com.gh</a>.
            </p>
          </div>
          <div className="faq-list">
            {faqs.map((faq) => (
              <details className="faq-item" key={faq.question}>
                <summary>
                  {faq.question}
                  <span aria-hidden="true">+</span>
                </summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-cta">
        <div className="container closing-cta__inner">
          <div>
            <span className="eyebrow eyebrow--light">Ready when you are</span>
            <h2>Find a place. Or fill one.</h2>
          </div>
          <div className="closing-cta__actions">
            <Link className="btn btn--accent" to="/browse">
              Explore rentals
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="btn btn--ghost" to="/post">
              List a property
              <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
