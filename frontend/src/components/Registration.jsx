import { Check, ExternalLink } from 'lucide-react'

export default function Registration() {
  return (
    <section className="content-section" id="register">
      <div className="contact-layout-grid">

        {/* Info Left Side */}
        <div className="contact-info-panel">
          <div className="section-heading">
            <span>Access Key</span>
            <h2>Register Your Interest</h2>
            <p>OOSC 4.0 is open to developers, student researchers, open source advocates, and campus ambassadors.</p>
          </div>

          <div className="contact-details-cards">
            <div className="contact-detail-card glass-card">
              <span className="icon"><Check size={24} /></span>
              <div>
                <h4>Attendee Access</h4>
                <p>Gain access to all keynotes, labs, and interactive panels.</p>
              </div>
            </div>
            <div className="contact-detail-card glass-card">
              <span className="icon"><Check size={24} /></span>
              <div>
                <h4>Speaker Proposals</h4>
                <p>Present your projects and systems research to a national audience.</p>
              </div>
            </div>
            <div className="contact-detail-card glass-card">
              <span className="icon"><Check size={24} /></span>
              <div>
                <h4>Sponsors &amp; Ambassadors</h4>
                <p>Host workshop modules or promote open science within your community.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Google Form Right Side */}
        <div className="contact-form-panel glass-card registration-form-panel">
          <div className="registration-form-header">
            <span className="registration-form-label">Registration Form</span>
            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLSeZdxKgPh47KOgQvQzy_ChtiXLzmsbzDyRASR-MUbNuzXZ6oQ/viewform?usp=sharing&ouid=110152741337293500969" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-admin-mini"
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Open in New Tab <ExternalLink size={16} /></span>
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
  )
}
