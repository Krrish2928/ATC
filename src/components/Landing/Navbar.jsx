import { useState, useEffect } from 'react'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`} id="navbar">
      <div className={styles.inner}>
        {/* Logo */}
        <a href="#" className={styles.logo} aria-label="Orbis home">
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <circle cx="50" cy="50" r="44" stroke="#4d9fff" strokeWidth="4" fill="none"/>
            <ellipse cx="50" cy="50" rx="20" ry="44" stroke="#4d9fff" strokeWidth="2.5" fill="none" opacity="0.7"/>
            <line x1="6" y1="50" x2="94" y2="50" stroke="#4d9fff" strokeWidth="2.5" opacity="0.7"/>
            <line x1="14" y1="30" x2="86" y2="30" stroke="#4d9fff" strokeWidth="1.5" opacity="0.4"/>
            <line x1="14" y1="70" x2="86" y2="70" stroke="#4d9fff" strokeWidth="1.5" opacity="0.4"/>
          </svg>
          <span className={styles.logoText}>Orbis</span>
        </a>

        {/* Desktop links */}
        <ul className={styles.links} role="list">
          {['Product', 'Pricing', 'Docs'].map((link) => (
            <li key={link}>
              <a href={`#${link.toLowerCase()}`} className={styles.link}>
                {link}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className={styles.actions}>
          <a href="#signin" className={styles.signIn} id="nav-signin">
            Sign in
          </a>
          <a href="#started" className={`btn btn-primary ${styles.navCta}`} id="nav-cta">
            Get started
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          className={styles.burger}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          id="nav-burger"
        >
          <span className={`${styles.burgerLine} ${menuOpen ? styles.open1 : ''}`} />
          <span className={`${styles.burgerLine} ${menuOpen ? styles.open2 : ''}`} />
          <span className={`${styles.burgerLine} ${menuOpen ? styles.open3 : ''}`} />
        </button>
      </div>

      {/* Mobile drawer */}
      <div className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`} aria-hidden={!menuOpen}>
        {['Product', 'Pricing', 'Docs', 'Sign in'].map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase().replace(' ', '')}`}
            className={styles.drawerLink}
            onClick={() => setMenuOpen(false)}
          >
            {link}
          </a>
        ))}
        <a href="#started" className="btn btn-primary" onClick={() => setMenuOpen(false)} id="mobile-cta">
          Get started
        </a>
      </div>
    </nav>
  )
}
