import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'
import './ContactPage.css'

export default function ContactPage({ siteConfig, form, setForm, formStatus, handleFormSubmit }) {
  return (
    <section className="content-section contact-section" id="contact">
      <div className="contact-layout-grid">
        <div className="contact-info-panel">
          <div className="section-heading">
            <span>{siteConfig.contactEyebrow || 'Connect'}</span>
            <h2>{siteConfig.contactTitle || 'Contact the Organizers'}</h2>
            <p>{siteConfig.contactSubtitle || 'Inquire about sponsorship opportunities, speaker submissions, or registration access keys.'}</p>
          </div>

          <div className="contact-details-cards">
            <div className="contact-detail-card glass-card">
              <span className="icon"><Mail size={24} /></span>
              <div>
                <h4>Official Email</h4>
                <p>contact@oosc4.0.iiita.ac.in</p>
              </div>
            </div>
            <div className="contact-detail-card glass-card">
              <span className="icon"><Phone size={24} /></span>
              <div>
                <h4>Call / WhatsApp</h4>
                <p>+91 7318 295 789</p>
              </div>
            </div>
            <div className="contact-detail-card glass-card">
              <span className="icon"><MapPin size={24} /></span>
              <div>
                <h4>Venue Location</h4>
                <p>CC-3, IIIT Allahabad, Devghat, Jhalwa, Prayagraj, UP 211015</p>
              </div>
            </div>
          </div>

          <div className="map-wrapper glass-card">
            <iframe
              title="IIIT Allahabad Campus Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3603.237248107936!2d81.76916531102919!3d25.430327377457788!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398ffd42b938924b%3A0xc4aa002a2468307d!2sIndian%20Institute%20of%20Information%20Technology%2C%20Allahabad!5e0!3m2!1sen!2sin!4v1717320000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              className="map-iframe"
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
        </div>

        <div className="contact-form-panel glass-card">
          <h3>Send an Inquiry</h3>
          <p>Complete the form below to reach our communications committee.</p>
          <form className="contact-form-elements" onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="contact-name">Full Name</label>
              <input
                id="contact-name"
                type="text"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                required
                placeholder="Your name"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-email">Email Address</label>
              <input
                id="contact-email"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
                placeholder="you@example.com"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-msg">Message</label>
              <textarea
                id="contact-msg"
                rows="5"
                value={form.message}
                onChange={(event) => setForm({ ...form, message: event.target.value })}
                required
                placeholder="Write your message details..."
                className="form-control"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block">
              Submit Message
            </button>
            {formStatus && <p className="form-status-message">{formStatus}</p>}
          </form>
        </div>
      </div>
    </section>
  )
}
