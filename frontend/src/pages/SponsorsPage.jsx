import React, { useState } from 'react'
import { GripVertical, Handshake, Phone, Mail } from 'lucide-react'
import './SponsorsPage.css'

export default function SponsorsPage({
  siteConfig, adminMode, sortedSponsors,
  draggedResource, draggedIndex, draggedCategory, dragOverIndex,
  handleDragStart, handleDragOver, handleDragEnd, handleDrop,
  openModal, editRecord, deleteRecord, setSponsors
}) {
  const [form, setForm] = useState({ name: '', email: '', organization: '', message: '' })
  const [formStatus, setFormStatus] = useState('')

  const handleSponsorSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.organization.trim()) {
      setFormStatus('Name, Email, and Organization are required.')
      return
    }

    try {
      const response = await fetch('/api/sponsor-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await response.json()
      if (response.ok) {
        setFormStatus('Application sent! We will contact you soon.')
        setForm({ name: '', email: '', organization: '', message: '' })
      } else {
        setFormStatus(data.error || 'Failed to submit application.')
      }
    } catch {
      setFormStatus('An error occurred while submitting. Please try again later.')
    }
  }

  return (
    <section className="content-section" id="sponsors">
      <div className="section-heading split">
        <div>
          <span>{siteConfig.sponsorsEyebrow || 'Partners'}</span>
          <h2>{siteConfig.sponsorsTitle || 'Conference Supporters'}</h2>
          <p>{siteConfig.sponsorsSubtitle || 'Academic institutions and corporate engineering partners supporting open systems research.'}</p>
        </div>
        {adminMode && (
          <button type="button" className="btn btn-admin-add" onClick={() => openModal('sponsors', 'create')}>
            + Add Sponsor
          </button>
        )}
      </div>

      <div className="sponsors-wrapper">
        {sortedSponsors.map(({ category, sponsors: group }) => {
          const tierClass = `sponsor-card--${category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}`
          if (group.length === 0 && !adminMode) return null
          return (
            <div key={category} className={`sponsor-tier-group sponsor-tier-group--${category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '')}`}>
              <div className="sponsor-tier-header">
                <h3>{category}</h3>
                <span className="divider-line"></span>
              </div>
              <div className="sponsor-logo-grid">
                {group.map((sponsor, index) => (
                  <div
                    key={sponsor.id}
                    draggable={adminMode}
                    className={`sponsor-card-outer ${adminMode ? 'admin-draggable' : ''} ${draggedResource === 'sponsors' && draggedCategory === category && draggedIndex === index ? 'dragging' : ''} ${draggedResource === 'sponsors' && draggedCategory === category && dragOverIndex === index ? 'drag-over' : ''}`.trim()}
                    onDragStart={(e) => handleDragStart(e, 'sponsors', index, category)}
                    onDragOver={(e) => handleDragOver(e, 'sponsors', index, category)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, 'sponsors', index, category)}
                  >
                    <a
                      href={sponsor.website ? (sponsor.website.trim().startsWith('http://') || sponsor.website.trim().startsWith('https://') ? sponsor.website.trim() : `https://${sponsor.website.trim()}`) : '#'}
                      target="_blank"
                      rel="noreferrer"
                      className={`sponsor-card ${tierClass}`}
                      draggable={false}
                    >
                      <div className="logo-container">
                        <img src={sponsor.logoURL} alt={sponsor.name} loading="lazy" draggable={false} />
                      </div>
                      <span className="sponsor-name">{sponsor.name}</span>
                    </a>
                    {adminMode && (
                      <div className="sponsor-admin-controls">
                        <button type="button" className="btn btn-admin-mini" onClick={() => editRecord('sponsors', sponsor)}>Edit</button>
                        <button type="button" className="btn-delete-sponsor" onClick={() => deleteRecord('sponsors', sponsor.id, setSponsors)}>Delete</button>
                      </div>
                    )}
                    {adminMode && (
                      <span className="drag-hint" aria-hidden="true">
                        <GripVertical size={16} /> Drag to Reorder
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── SPONSORSHIP TIERS & BROCHURE ── */}
      <div className="sponsorship-prospectus">
        <div className="prospectus-intro">
          <h3 className="prospectus-heading">Sponsorship Opportunities</h3>
          <p className="prospectus-desc">
            By sponsoring OOSC 4.0, your brand becomes an integral part of this massive milestone event. Your support directly funds the ecosystem—covering the travel and accommodation of global speakers, powering the hackathon infrastructure, and providing an unforgettable experience for attendees.
          </p>
        </div>

        <div className="tier-cards-grid">
          <div className="tier-card tier-card--title">
            <h4 className="tier-card__name">Title</h4>
            <p className="tier-card__slots">1 SLOT</p>
            <p className="tier-card__price-usd">$7,350+</p>
            <p className="tier-card__price-inr">₹7,00,000+</p>
          </div>
          <div className="tier-card tier-card--co-title">
            <h4 className="tier-card__name">Co-title</h4>
            <p className="tier-card__slots">2 SLOTS</p>
            <p className="tier-card__price-usd">$5,250+</p>
            <p className="tier-card__price-inr">₹5,00,000+</p>
          </div>
          <div className="tier-card tier-card--platinum">
            <h4 className="tier-card__name">Platinum</h4>
            <p className="tier-card__slots">3 SLOTS</p>
            <p className="tier-card__price-usd">$3,150+</p>
            <p className="tier-card__price-inr">₹3,00,000+</p>
          </div>
          <div className="tier-card tier-card--gold">
            <h4 className="tier-card__name">Gold</h4>
            <p className="tier-card__slots">4 SLOTS</p>
            <p className="tier-card__price-usd">$2,100+</p>
            <p className="tier-card__price-inr">₹2,00,000+</p>
          </div>
          <div className="tier-card tier-card--bronze">
            <h4 className="tier-card__name">Bronze</h4>
            <p className="tier-card__slots">5 SLOTS</p>
            <p className="tier-card__price-usd">$1,050+</p>
            <p className="tier-card__price-inr">₹1,00,000+</p>
          </div>
        </div>

        <div className="prospectus-brochure-cta">
          <a href="/Sponsorship_Brochure.pdf" download className="btn btn-primary prospectus-download-btn">
            <span className="prospectus-download-inner">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download Sponsorship Brochure
            </span>
          </a>
        </div>

        <div className="contact-us-section">
          <h3 className="contact-us-heading">Contact Us</h3>
          <p className="contact-us-desc">
            Thank you for considering sponsoring OOSC 4.0. For inquiries and to secure your sponsorship, contact the sponsorship team at <a href="mailto:oosc@iiita.ac.in" className="contact-us-link">oosc@iiita.ac.in</a>
          </p>

          <div className="contact-cards-grid">
            {/* Coordinator Cards */}
            <div className="contact-card coordinator-card-new">
              <h4 className="coordinator-name">Sudhanshu</h4>
              <p className="coordinator-role">OVERALL COORDINATOR</p>
              <div className="contact-info-row">
                <Phone size={18} strokeWidth={2} />
                <span>+91 98919 07290</span>
              </div>
              <div className="contact-info-row">
                <Mail size={18} strokeWidth={2} />
                <a href="mailto:iit2024081@iiita.ac.in">iit2024081@iiita.ac.in</a>
              </div>
            </div>

            <div className="contact-card coordinator-card-new">
              <h4 className="coordinator-name">Rishu Kumar</h4>
              <p className="coordinator-role">OVERALL COORDINATOR</p>
              <div className="contact-info-row">
                <Phone size={18} strokeWidth={2} />
                <span>+91 62395 91434</span>
              </div>
              <div className="contact-info-row">
                <Mail size={18} strokeWidth={2} />
                <a href="mailto:iit2024183@iiita.ac.in">iit2024183@iiita.ac.in</a>
              </div>
            </div>

            <div className="contact-card coordinator-card-new">
              <h4 className="coordinator-name">Aditya Ajay</h4>
              <p className="coordinator-role">OVERALL COORDINATOR</p>
              <div className="contact-info-row">
                <Phone size={18} strokeWidth={2} />
                <span>+91 92365 18179</span>
              </div>
              <div className="contact-info-row">
                <Mail size={18} strokeWidth={2} />
                <a href="mailto:iit2024174@iiita.ac.in">iit2024174@iiita.ac.in</a>
              </div>
            </div>
          </div>

          <div className="contact-cards-grid contact-cards-grid--two-col">
            <div className="contact-card info-card">
              <h5 className="info-card-title">Email</h5>
              <a href="mailto:oosc@iiita.ac.in" className="info-card-link">oosc@iiita.ac.in</a>

              <h5 className="info-card-title">Website</h5>
              <a href="https://oosc.iiita.ac.in" className="info-card-link" target="_blank" rel="noreferrer">oosc.iiita.ac.in</a>
            </div>

            <div className="contact-card info-card">
              <h5 className="info-card-title">Instagram</h5>
              <a href="https://instagram.com/oosc_iiita" className="info-card-link" target="_blank" rel="noreferrer">@oosc_iiita</a>

              <h5 className="info-card-title">Venue</h5>
              <p className="info-card-text">IIIT Allahabad, Prayagraj, UP, India</p>
            </div>
          </div>
        </div>

        {/* ── SPONSOR APPLICATION FORM ── */}
        <div className="sponsor-form-section" id="sponsors/form">
          <div className="sponsor-form-card">
            {/* radial shine overlay */}
            <div className="sponsor-form-shine" />

            {/* Handshake icon */}
            <div className="sponsor-form-icon">
              <Handshake size={56} strokeWidth={1.5} />
            </div>

            <h3 className="sponsor-form-heading">Become a Sponsor</h3>

            <form onSubmit={handleSponsorSubmit} className="sponsor-form-body">
              {/* Full Name */}
              <div className="sponsor-form-group">
                <label htmlFor="sponsor-name" className="sponsor-form-label">
                  Name <span className="sponsor-form-required">*</span>
                </label>
                <input
                  id="sponsor-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="sponsor-form-input"
                />
              </div>

              {/* Company */}
              <div className="sponsor-form-group">
                <label htmlFor="sponsor-org" className="sponsor-form-label">
                  Company Name <span className="sponsor-form-required">*</span>
                </label>
                <input
                  id="sponsor-org"
                  type="text"
                  value={form.organization}
                  onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  placeholder="Your company/organization"
                  className="sponsor-form-input"
                />
              </div>

              {/* Email */}
              <div className="sponsor-form-group">
                <label htmlFor="sponsor-email" className="sponsor-form-label">
                  Email <span className="sponsor-form-required">*</span>
                </label>
                <input
                  id="sponsor-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="sponsor-form-input"
                />
              </div>

              {/* Message */}
              <div className="sponsor-form-group">
                <label htmlFor="sponsor-message" className="sponsor-form-label">
                  Message (Optional)
                </label>
                <textarea
                  id="sponsor-message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows="3"
                  placeholder="Tell us what sponsorship tiers you are interested in..."
                  className="sponsor-form-textarea"
                />
              </div>

              {formStatus && (
                <p className={`sponsor-form-status ${formStatus.includes('sent') ? 'sponsor-form-status--success' : 'sponsor-form-status--error'}`}>
                  {formStatus}
                </p>
              )}

              <button type="submit" className="sponsor-form-btn">Submit</button>
            </form>
          </div>
        </div>
      </div>

      {/* ── ADDITIONAL PARTNERSHIPS SECTION ── */}
      <div className="additional-partnerships">
        {/* Section 2 Wrapper */}
        <div>
          {/* ── WHY SPONSOR US SECTION ── */}
          <div className="why-sponsor-section">
            <div className="why-sponsor-header">
              <span className="why-sponsor-eyebrow">YOUR GATEWAY TO THE OPEN-SOURCE COMMUNITY</span>
              <h2 className="why-sponsor-title">Why Sponsor Us?</h2>
              <p className="why-sponsor-desc">
                Sponsoring the Opportunity Open Source Conference provides a chance to connect with a diverse and
                multi-faceted audience of open source practitioners, all in one location. Numerous organizations are
                involved in various technology sectors featured at OOSC. This conference uniquely offers the opportunity to
                engage with multiple communities in a single event.
              </p>
            </div>

            <div className="why-sponsor-benefits-grid">
              <ul className="why-sponsor-benefits-list">
                <li>
                  <span className="benefit-bullet">•</span>
                  <p>Generate qualified sales leads and acquire new customers.</p>
                </li>
                <li>
                  <span className="benefit-bullet">•</span>
                  <p>Utilize precise and targeted marketing opportunities.</p>
                </li>
                <li>
                  <span className="benefit-bullet">•</span>
                  <p>Establish new partnerships and alliances.</p>
                </li>
                <li>
                  <span className="benefit-bullet">•</span>
                  <p>Gain valuable insights and ideas from developers, technologists, business leaders, and open source contributors.</p>
                </li>
              </ul>
              <ul className="why-sponsor-benefits-list">
                <li>
                  <span className="benefit-bullet">•</span>
                  <p>Enhance brand awareness and recognition globally.</p>
                </li>
                <li>
                  <span className="benefit-bullet">•</span>
                  <p>Showcase products, services, and technologies to a large audience.</p>
                </li>
                <li>
                  <span className="benefit-bullet">•</span>
                  <p>Leverage media exposure, PR announcements, and social media outreach.</p>
                </li>
                <li>
                  <span className="benefit-bullet">•</span>
                  <p>Demonstrate support for the essential contributions of the open source community.</p>
                </li>
              </ul>
            </div>

            <div className="audience-reach-card">
              <h3 className="audience-reach-title">Audience Reach</h3>
              <div className="audience-reach-stats">
                <div className="reach-stat-item">
                  <span className="reach-stat-value">500+</span>
                  <span className="reach-stat-label">Direct Attendees</span>
                </div>
                <div className="reach-stat-item">
                  <span className="reach-stat-value">150+</span>
                  <span className="reach-stat-label">Colleges Reached</span>
                </div>
                <div className="reach-stat-item">
                  <span className="reach-stat-value">1,000+</span>
                  <span className="reach-stat-label">Online Communities</span>
                </div>
                <div className="reach-stat-item">
                  <span className="reach-stat-value">Pan-India</span>
                  <span className="reach-stat-label">Media Coverage</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Past Sponsors Wrapper */}
        <div>
          <div className="about-sponsors-section why-sponsor-section" id="past-sponsors" style={{ borderTop: '1px solid var(--color-border-soft)', paddingTop: '4rem', marginTop: '5rem' }}>
            <div className="why-sponsor-header">
              <span className="why-sponsor-eyebrow">Past Year Sponsors</span>
              <h2 className="why-sponsor-title">Organizations That Trusted OOSC</h2>
              <p className="why-sponsor-desc">
                OOSC has a strong history of partnerships with leading global and Indian technology organizations. The following are some of the sponsors that have supported previous editions of the conference, helping us create unforgettable experiences for thousands of attendees.
              </p>
            </div>

            {/* Sponsor Name Tags */}
            <div className="sponsor-tags">
              {['Trumio', 'Open Printing', 'Overlayy', 'Qualcomm', 'Google Colaboratory', 'The Linux Foundation', 'Zephyr', 'Canonical', 'Snapcraft'].map((name) => (
                <span key={name} className="sponsor-tag">{name}</span>
              ))}
            </div>

            {/* Why They Sponsored Card */}
            <div className="sponsor-why-card">
              <h3>Why They Sponsored OOSC</h3>
              <ul>
                <li>
                  <span className="sponsor-bullet">•</span>
                  <p>Direct access to India's largest open-source developer community.</p>
                </li>
                <li>
                  <span className="sponsor-bullet">•</span>
                  <p>High-quality brand exposure across a technically sophisticated audience.</p>
                </li>
                <li>
                  <span className="sponsor-bullet">•</span>
                  <p>Opportunity to recruit top talent from premier engineering institutes.</p>
                </li>
                <li>
                  <span className="sponsor-bullet">•</span>
                  <p>Association with a globally recognized open-source event brand.</p>
                </li>
                <li>
                  <span className="sponsor-bullet">•</span>
                  <p>Media visibility across traditional and digital channels.</p>
                </li>
              </ul>
            </div>

            {/* Sponsor Logos Grid */}
            <div className="sponsor-logos-grid">
              <a href="https://www.trumio.ai" target="_blank" rel="noopener noreferrer" className="sponsor-logo-wrapper">
                <img src="/Trumio-Logo.png" alt="Trumio" loading="lazy" />
              </a>
              <a href="https://openprinting.github.io" target="_blank" rel="noopener noreferrer" className="sponsor-logo-wrapper">
                <img src="/Open-printing-Logo.png" alt="Open Printing" loading="lazy" />
              </a>
              <a href="https://www.qualcomm.com" target="_blank" rel="noopener noreferrer" className="sponsor-logo-wrapper">
                <img src="/Qualcomm-Logo.png" alt="Qualcomm" loading="lazy" />
              </a>
              <a href="https://snapcraft.io" target="_blank" rel="noopener noreferrer" className="sponsor-logo-wrapper">
                <img src="/Snapcraft-Logo.png" alt="Snapcraft" loading="lazy" />
              </a>
              <a href="https://canonical.com" target="_blank" rel="noopener noreferrer" className="sponsor-logo-wrapper">
                <img src="/Canonical_logo.png" alt="Canonical" loading="lazy" />
              </a>
              <a href="https://www.linuxfoundation.org" target="_blank" rel="noopener noreferrer" className="sponsor-logo-wrapper">
                <img src="/Linux_Foundation_logo.png" alt="The Linux Foundation" loading="lazy" />
              </a>
            </div>
          </div>
        </div>

        {/* Section 1 Wrapper */}
        <div>
          <div className="partnerships-header">
            <span className="partnerships-eyebrow">OTHER PARTNERSHIP OPPORTUNITIES</span>
            <h2 className="partnerships-title">More Ways to Partner</h2>
            <p className="partnerships-subtitle">Beyond our standard sponsorship tiers, OOSC 4.0 offers a range of specialized partnership opportunities designed to fit different goals and budgets.</p>
          </div>

          <div className="partnership-cards-grid">
            {/* Card 1 */}
            <div className="partnership-card">
              <h4 className="partnership-card__title">Hospi Partner (Accommodation)</h4>
              <ul className="partnership-card__list">
                <li>For partners facilitating guest lodging.</li>
                <li>Branding on welcome kits and room inserts placed for VIP guests and speakers.</li>
                <li>Recognition on the OOSC 4.0 website, under the 'Hospitality Partner' section.</li>
                <li>Mention during opening and closing ceremonies.</li>
                <li>Logo included in guest itineraries and accommodation confirmations.</li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="partnership-card">
              <h4 className="partnership-card__title">Networking Dinner Partner</h4>
              <ul className="partnership-card__list">
                <li>For partners catering or sponsoring the exclusive networking dinner.</li>
                <li>Co-branded dinner space with visual identity on menu cards, dining zones, and welcome signage.</li>
                <li>Acknowledgment during the dinner and inclusion in related invites and schedules.</li>
                <li>Logo featured under Networking Dinner Partner in event materials and website.</li>
                <li>Mention in post-dinner media coverage and social thank-you posts.</li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="partnership-card">
              <h4 className="partnership-card__title">Hackathon Partner</h4>
              <ul className="partnership-card__list">
                <li>For partners supporting the hackathon's conduct.</li>
                <li>Branding on the hackathon portal and all hackathon-related digital platforms.</li>
                <li>Recognition in online hackathon announcements, communications, and live sessions.</li>
                <li>Featured as 'Platform Partner' on the event website and hackathon-specific pages.</li>
              </ul>
            </div>

            {/* Card 4 */}
            <div className="partnership-card">
              <h4 className="partnership-card__title">Food & Beverage Partner</h4>
              <ul className="partnership-card__list">
                <li>For partners providing meals, snacks, or beverages.</li>
                <li>Co-branding at dining spaces, food counters, and beverage zones.</li>
                <li>Mention as 'Food & Beverage Partner' in hospitality announcements.</li>
                <li>Branding on tent cards, digital menu displays, or packaging (if applicable).</li>
                <li>Inclusion in post-event social media acknowledgments and recap content.</li>
              </ul>
            </div>
          </div>

          <div className="partnerships-header" style={{ marginTop: '4rem' }}>
            <span className="partnerships-eyebrow">OTHER PARTNERSHIP OPPORTUNITIES</span>
            <h2 className="partnerships-title">Coverage & Stall Partners</h2>
          </div>

          <div className="partnership-cards-grid two-col">
            {/* Card 5 */}
            <div className="partnership-card">
              <h4 className="partnership-card__title">Coverage Partner</h4>
              <ul className="partnership-card__list">
                <li>For media, content, and journalism partners covering the event.</li>
                <li>Branding on official photo albums, highlight reels, recap blogs, and post-event videos.</li>
                <li>Credits in all media shared via social platforms and newsletters.</li>
                <li>Priority access to speakers, workshops, and behind-the-scenes coverage opportunities.</li>
                <li>Featured mention on the event website and in press releases as 'Coverage Partner.'</li>
              </ul>
            </div>

            {/* Card 6 */}
            <div className="partnership-card">
              <h4 className="partnership-card__title">Stall Partner</h4>
              <ul className="partnership-card__list">
                <li>For brands sponsoring or occupying stalls.</li>
                <li>Branded booth/stall in a high-traffic zone at the event.</li>
                <li>Logo placement in the official venue map, event website, and stall directory.</li>
                <li>Rights to run product demos, distribute samples, or collect sign-ups at the booth.</li>
                <li>Listing under 'Stall Partner' on all printed and digital materials.</li>
              </ul>
            </div>
          </div>

          {/* Custom Package Card */}
          <div className="partnership-card partnership-card--custom">
            <h4 className="partnership-card__title">Custom Partnership Packages</h4>
            <p className="partnership-card__desc">Don't see a package that fits your needs? We're happy to work with you to create a custom partnership that aligns with your specific goals and budget. Reach out to our team to discuss tailored options.</p>
            <ul className="partnership-card__list">
              <li>Title sponsorship of a specific track or workshop.</li>
              <li>Exclusive branding rights for the hackathon prize pool.</li>
              <li>Co-hosting opportunities for pre-event or post-event networking.</li>
              <li>Student recruitment drives and campus ambassador programs.</li>
            </ul>
          </div>
        </div>


        {/* Section 3 Wrapper */}
        <div>
          {/* ── BRANDING & DIGITAL EXPOSURE SECTION ── */}
          <div className="exposure-section">
            <div className="exposure-header">
              <span className="exposure-eyebrow">KEY BENEFITS OF SPONSORING</span>
              <h2 className="exposure-title">Branding & Digital Exposure</h2>
            </div>

            <div className="exposure-grid">
              <article className="exposure-card">
                <h3>Branding & Recognition</h3>
                <ul className="exposure-list">
                  <li>Logo & name on official banners, hoardings, website, and certificates.</li>
                  <li>Recognition during Opening & Closing Ceremonies and the Networking Dinner.</li>
                </ul>
              </article>

              <article className="exposure-card">
                <h3>Digital Publicity & Media</h3>
                <ul className="exposure-list">
                  <li>Showcase across OOSC 4.0 official social media handles (LinkedIn, Instagram, YouTube).</li>
                  <li>Video promo played before key events and logo placement on virtual backdrops.</li>
                  <li>Nationwide visibility through traditional media and publicity partners.</li>
                </ul>
              </article>

              <article className="exposure-card">
                <h3>On-Ground Engagement</h3>
                <ul className="exposure-list">
                  <li>Stall space at the venue for live product demos and direct audience interaction.</li>
                  <li>Dedicated session/talk to engage directly with attendees and promote offerings.</li>
                  <li>Outreach campaigns reaching 150+ colleges, 1,000+ communities, and 500+ participants.</li>
                </ul>
              </article>
            </div>
          </div>
        </div>

        {/* Section 4 Wrapper */}
        <div>
          {/* CTA Banner */}
          <div className="partnership-cta">
            <h3 className="partnership-cta__title">Let's Build Something Together</h3>
            <p className="partnership-cta__desc">Every partnership at OOSC 4.0 is an opportunity to shape the future of open source in India.</p>
            <button type="button" className="partnership-cta__btn" onClick={() => {
              document.getElementById('sponsors/form')?.scrollIntoView({ behavior: 'smooth' });
              setTimeout(() => {
                document.getElementById('sponsor-name')?.focus();
              }, 600);
            }}>
              Become a Sponsor
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

