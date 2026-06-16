import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Mail, Phone, MapPin, MessageSquare, Handshake, Info } from 'lucide-react'
import './ContactPage.css'

export default function ContactPage({ siteConfig, form, setForm, formStatus, handleFormSubmit }) {
  return (
    <div className="contact-page">
      <Helmet>
        <title>Contact — OOSC 4.0 | IIIT Allahabad</title>
        <meta name="description" content="Get in touch with the OOSC 4.0 organizing team at IIIT Allahabad for inquiries, sponsorships, hackathon registration, and venue information." />
        <link rel="canonical" href="https://oosc.iiita.ac.in/contact" />
        <meta property="og:title" content="Contact — OOSC 4.0 | IIIT Allahabad" />
        <meta property="og:description" content="Get in touch with the OOSC 4.0 organizing team for inquiries, sponsorships, and hackathon registration." />
        <meta property="og:url" content="https://oosc.iiita.ac.in/contact" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="Contact — OOSC 4.0 | IIIT Allahabad" />
        <meta name="twitter:description" content="Reach out to the OOSC 4.0 organizing team at IIIT Allahabad." />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "ContactPage",
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "https://oosc.iiita.ac.in/contact"
              },
              "name": "Contact — OOSC 4.0 | IIIT Allahabad",
              "description": "Get in touch with the OOSC 4.0 organizing team at IIIT Allahabad for inquiries, sponsorships, hackathon registration, and venue information.",
              "publisher": {
                "@type": "Organization",
                "name": "OOSC IIITA Team",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://oosc.iiita.ac.in/OOSC_logo.png"
                }
              }
            }
          `}
        </script>
      </Helmet>
      {/* Top Section: Quick Channels */}
      <section className="content-section">
        <div className="section-heading text-center">
          <span>{siteConfig.contactEyebrow || 'Connect'}</span>
          <h1>{siteConfig.contactTitle || 'Get in Touch'}</h1>
          <p>{siteConfig.contactSubtitle || 'Have questions about OOSC 4.0? Reach out to our dedicated teams below.'}</p>
        </div>

        <div className="channels-grid">
          <div className="channel-card glass-card">
            <div className="channel-icon"><Mail size={32} /></div>
            <h3>Official Email</h3>
            <p className="channel-desc">For general inquiries, sponsorships, and speaker submissions.</p>
            <div className="channel-value">oosc@iita.ac.in</div>
          </div>
          
          <div className="channel-card glass-card featured">
            <div className="channel-icon"><Phone size={32} /></div>
            <h3>Call / WhatsApp</h3>
            <p className="channel-desc">Urgent queries regarding hackathon registration or venue directions.</p>
            <div className="channel-value">+91 9236 518 179</div>
          </div>

          <div className="channel-card glass-card">
            <div className="channel-icon"><MapPin size={32} /></div>
            <h3>Venue Location</h3>
            <p className="channel-desc">IIIT Allahabad Campus. Open for visitors during conference days.</p>
            <div className="channel-value">Jhalwa, Prayagraj, Uttar Pradesh, India - 211015</div>
          </div>
        </div>
      </section>

      {/* Bottom Section: Form & Map */}
      <section className="content-section contact-section" id="contact">
        <div className="contact-layout-grid">
          
          <div className="contact-info-panel">
            <div className="section-heading">
              <span>Direct Message</span>
              <h2>Send an Inquiry</h2>
              <p>Looking for a specific department? Use the form to reach out directly to our communications team.</p>
            </div>

            <div className="contact-details-cards">
              <div className="contact-detail-card glass-card">
                <span className="icon"><Handshake size={24} /></span>
                <div>
                  <h4>Sponsorships</h4>
                  <p>Partner with us to empower open source.</p>
                </div>
              </div>
              <div className="contact-detail-card glass-card">
                <span className="icon"><Info size={24} /></span>
                <div>
                  <h4>General Questions</h4>
                  <p>Schedule, travel, and accommodation.</p>
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
            <div className="contact-form-header">
              <span className="icon"><MessageSquare size={20} /></span>
              <h3>Contact Form</h3>
            </div>
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
                  rows="6"
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
    </div>
  )
}
