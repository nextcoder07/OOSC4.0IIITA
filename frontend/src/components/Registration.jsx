import { Check, ExternalLink, Ticket, Zap, Shield } from 'lucide-react'
import './Registration.css'

export default function Registration() {
  return (
    <div className="registration-page">
      {/* Passes Overview Section */}
      <section className="content-section">
        <div className="section-heading text-center">
          <span>OOSC 4.0 Registration</span>
          <h2>Secure Your Access Key</h2>
          <p>Join over 500+ developers, researchers, and open-source advocates at the premier technical conference.</p>
        </div>

        <div className="passes-grid">
          <div className="pass-card glass-card">
            <div className="pass-icon"><Ticket size={32} /></div>
            <h3>General Admission</h3>
            <div className="pass-price">Free</div>
            <p className="pass-desc">For students and professionals looking to attend keynotes and panels.</p>
            <ul className="pass-features">
              <li><Check size={16} /> Access to all keynotes</li>
              <li><Check size={16} /> Entry to exhibition area</li>
              <li><Check size={16} /> Networking events</li>
            </ul>
          </div>
          
          <div className="pass-card glass-card featured">
            <div className="pass-icon"><Zap size={32} /></div>
            <h3>Hacker Pass</h3>
            <div className="pass-price">Application</div>
            <p className="pass-desc">For developers participating in the 36-hour infrastructure hackathon.</p>
            <ul className="pass-features">
              <li><Check size={16} /> All General features</li>
              <li><Check size={16} /> Dedicated hackathon workspace</li>
              <li><Check size={16} /> Technical mentorship access</li>
              <li><Check size={16} /> Free meals & swag kit</li>
            </ul>
          </div>

          <div className="pass-card glass-card">
            <div className="pass-icon"><Shield size={32} /></div>
            <h3>Speaker / VIP</h3>
            <div className="pass-price">Invite Only</div>
            <p className="pass-desc">Exclusive access for speakers, sponsors, and key community leaders.</p>
            <ul className="pass-features">
              <li><Check size={16} /> All Hacker features</li>
              <li><Check size={16} /> Speaker lounge access</li>
              <li><Check size={16} /> Exclusive VIP dinner invite</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section className="content-section" id="register">
        <div className="contact-layout-grid">
          {/* Info Left Side */}
          <div className="contact-info-panel">
            <div className="section-heading">
              <span>Ready to join?</span>
              <h2>Registration Form</h2>
              <p>Fill out the form to request your access key. Early applications are prioritized for the Hacker Pass.</p>
            </div>

            <div className="contact-details-cards">
              <div className="contact-detail-card glass-card">
                <div>
                  <h4>Important Dates</h4>
                  <p><strong>Registration Opens:</strong> July 1, 2026</p>
                  <p><strong>Registration Closes:</strong> August 10, 2026</p>
                </div>
              </div>
              <div className="contact-detail-card glass-card">
                <div>
                  <h4>Group Registrations</h4>
                  <p>Coming with a university lab or corporate team? Please indicate this in the form to get grouped together.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Google Form Right Side */}
          <div className="contact-form-panel glass-card registration-form-panel">
            <div className="registration-form-header">
              <span className="registration-form-label">Official Registration</span>
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSeZdxKgPh47KOgQvQzy_ChtiXLzmsbzDyRASR-MUbNuzXZ6oQ/viewform?usp=sharing&ouid=110152741337293500969" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-admin-mini"
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Open in New Tab <ExternalLink size={16} color="var(--color-brand-blue)" /></span>
              </a>
            </div>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSeZdxKgPh47KOgQvQzy_ChtiXLzmsbzDyRASR-MUbNuzXZ6oQ/viewform?usp=sharing&ouid=110152741337293500969"
              width="100%"
              height="800"
              className="registration-form-iframe"
              title="OOSC 4.0 Registration Form"
            >
              Loading Google Form...
            </iframe>
          </div>
        </div>
      </section>
    </div>
  )
}
