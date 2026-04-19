import Navbar from './Navbar.jsx'
import HeroSection from './HeroSection.jsx'
import FeaturesSection from './FeaturesSection.jsx'
import TestimonialsSection from './TestimonialsSection.jsx'
import CTABanner from './CTABanner.jsx'
import Footer from './Footer.jsx'
import styles from './LandingPage.module.css'

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      <main>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTABanner />
      </main>

      <Footer />
    </div>
  )
}
