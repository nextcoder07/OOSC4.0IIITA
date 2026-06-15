import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="site-footer glass-card" role="contentinfo">
      <div className="footer-grid-outer">
        
        {/* Brand Block */}
        <div className="footer-brand-column">
          <Link to="/" className="footer-logo" aria-label="OOSC 4.0 home page" onClick={scrollToTop}>
            <img src="/OOSC_logo.png" alt="OOSC 4.0 Open Source Systems Conference logo" className="footer-logo-img" />
          </Link>
          <p className="footer-tagline">
            Opportunity Open Source Conference. Hosted by the Indian Institute of Information Technology, Allahabad.
          </p>
          <p className="footer-sub-tagline">
            Devghat, Jhalwa, Prayagraj, Uttar Pradesh, India - 211015
          </p>
          
          <div className="footer-socials">
            <a href="https://www.instagram.com/oosc_iiita/" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="https://www.linkedin.com/company/opportunityopensource/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="footer-links-column">
          <h4>Conference</h4>
          <ul>
            <li><Link to="/" onClick={scrollToTop}>Home</Link></li>
            <li><Link to="/about" onClick={scrollToTop}>About</Link></li>
            <li><Link to="/schedule" onClick={scrollToTop}>Schedule</Link></li>
            <li><Link to="/speakers" onClick={scrollToTop}>Speakers</Link></li>
            <li><Link to="/sponsors" onClick={scrollToTop}>Sponsors</Link></li>
            <li><Link to="/team" onClick={scrollToTop}>Our Team</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="footer-links-column">
          <h4>Academic Links</h4>
          <ul>
            <li><a href="https://www.iiita.ac.in" target="_blank" rel="noreferrer">IIIT Allahabad</a></li>
            <li><a href="https://it.iiita.ac.in" target="_blank" rel="noreferrer">Department of IT</a></li>
            <li><a href="https://www.iiita.ac.in/research" target="_blank" rel="noreferrer">Research Labs</a></li>
            <li><Link to="/register" onClick={scrollToTop}>Register Interest</Link></li>
            <li><Link to="/contact" onClick={scrollToTop}>Inquiries</Link></li>
          </ul>
        </div>

        {/* Contact info column */}
        <div className="footer-links-column">
          <h4>Contact Hub</h4>
          <p className="contact-item"><strong>Email:</strong> <a href="mailto:oosc@iiita.ac.in">oosc@iiita.ac.in</a></p>
          <p className="contact-item"><strong>Phone:</strong> <a href="tel:+919236518179">+91 9236 518 179</a></p>
        </div>

      </div>

      {/* Footer Bottom Metadata & Copyrights */}
      <div className="footer-bottom-bar">
        <div className="footer-copyright">
          © {year} Indian Institute of Information Technology, Allahabad. All rights reserved.
        </div>
        <div className="footer-policies">

          <Link to="/privacy" onClick={scrollToTop}>Privacy Policy</Link>
          <span className="dot">•</span>
          <Link to="/terms" onClick={scrollToTop}>Terms of Use</Link>
          <span className="dot">•</span>

          <span className="made-with-love" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Made with <Heart size={14} color="var(--color-brand-red)" fill="var(--color-brand-red)" /> at IIITA
          </span>
        </div>
      </div>
    </footer>
  )
}
