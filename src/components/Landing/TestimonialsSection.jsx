import styles from './TestimonialsSection.module.css'

const testimonials = [
  {
    id: 't1',
    quote:
      '"Orbis transformed how our logistics team tracks global freight. The real-time globe view alone saved us 12% on route costs in the first quarter."',
    name: 'Sarah Chen',
    role: 'VP of Operations, Nexus Logistics',
    avatar: 'SC',
  },
  {
    id: 't2',
    quote:
      '"The predictive analytics caught a supply chain disruption in Southeast Asia 72 hours before our competitors even knew it was happening."',
    name: 'Marcus Ibarra',
    role: 'Head of Strategy, Meridian Capital',
    avatar: 'MI',
  },
  {
    id: 't3',
    quote:
      '"Best-in-class data visualisation. Our board presentations went from spreadsheets to live, interactive globe dashboards. The wow factor is real."',
    name: 'Priya Nair',
    role: 'Chief Data Officer, Solaris Energy',
    avatar: 'PN',
  },
]

export default function TestimonialsSection() {
  return (
    <section className={styles.section} id="testimonials" aria-labelledby="testimonials-heading">
      <div className="container">
        <div className={styles.header}>
          <span className="section-label">Customer Stories</span>
          <h2 id="testimonials-heading" className={styles.heading}>
            Trusted by teams who think globally
          </h2>
        </div>

        <div className={styles.grid}>
          {testimonials.map(({ id, quote, name, role, avatar }) => (
            <blockquote key={id} className={styles.card} id={id}>
              <div className={styles.stars} aria-label="5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#4d9fff" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p className={styles.quote}>{quote}</p>
              <footer className={styles.author}>
                <div className={styles.avatar} aria-hidden="true">{avatar}</div>
                <div>
                  <cite className={styles.name}>{name}</cite>
                  <span className={styles.role}>{role}</span>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
