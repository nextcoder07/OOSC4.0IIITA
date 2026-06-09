import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer glass-card">
      <div className="footer-grid-outer">
        
        {/* Brand Block */}
        <div className="footer-brand-column">
          <Link to="/" className="footer-logo" aria-label="Go to home page">
            <img src="/OOSC_logo.png" alt="OOSC logo" className="footer-logo-img" />
          </Link>
          <p className="footer-tagline">
            Opportunity Open Source Conference. Hosted by the Indian Institute of Information Technology, Allahabad.
          </p>
          <p className="footer-sub-tagline">
            Devghat, Jhalwa, Prayagraj, Uttar Pradesh, India - 211015
          </p>
          
          <div className="footer-socials">

           {/* <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>*/}

            <a href="https://www.linkedin.com/company/opportunityopensource/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="footer-links-column">
          <h4>Conference</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/schedule">Schedule</Link></li>
            <li><Link to="/speakers">Speakers</Link></li>
            <li><Link to="/sponsors">Sponsors</Link></li>
            <li><Link to="/team">Our Team</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="footer-links-column">
          <h4>Academic Links</h4>
          <ul>
            <li><a href="https://www.iiita.ac.in" target="_blank" rel="noreferrer">IIIT Allahabad</a></li>
            <li><a href="https://it.iiita.ac.in" target="_blank" rel="noreferrer">Department of IT</a></li>
            <li><a href="https://www.iiita.ac.in/research" target="_blank" rel="noreferrer">Research Labs</a></li>
            <li><Link to="/register">Register Interest</Link></li>
            <li><Link to="/contact">Inquiries</Link></li>
          </ul>
        </div>

        {/* Contact info column */}
        <div className="footer-links-column">
          <h4>Contact Hub</h4>
          <p className="contact-item"><strong>Email:</strong> <a href="mailto:contact.oosc4.0@gmail.com">contact.oosc4.0@gmail.com</a></p>
          <p className="contact-item"><strong>Phone:</strong> <a href="tel:+917318295789">+91 7318 295 789</a></p>
          <p className="contact-item"><strong>Office:</strong> <a href="https://www.google.com/maps/search/IIIT+Allahabad" target="_blank" rel="noreferrer">CC-3 Ground Floor, IIIT-A</a></p>
        </div>

      </div>

      {/* Footer Bottom Metadata & Copyrights */}
      <div className="footer-bottom-bar">
        <div className="footer-copyright">
          © {year} Indian Institute of Information Technology, Allahabad. All rights reserved.
        </div>
        <div className="footer-policies">

         {/* <Link to="/privacy">Privacy Policy</Link>
          <span className="dot">•</span>
          <Link to="/terms">Terms of Use</Link>
          <span className="dot">•</span> 8*/}

          <span className="made-with-love">
            Made with ❤️ at IIITA
          </span>
        </div>
      </div>
    </footer>
  )
}
