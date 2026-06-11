import React, { useState } from 'react'
import { GripVertical } from 'lucide-react'
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
            <div key={category} className="sponsor-tier-group">
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
                      <span className="drag-hint" aria-hidden="true" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
      <div className="sponsorship-prospectus" style={{ margin: '4rem auto 0', maxWidth: '840px', padding: '2rem', background: 'var(--color-panel-surface)', borderRadius: '12px', border: '1px solid var(--color-border-soft)' }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-accent)' }}>Sponsorship Opportunities</h3>
          <p style={{ marginBottom: '2rem', color: 'var(--color-text-snow)', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto 2rem auto' }}>
            By sponsoring OOSC 4.0, your brand becomes an integral part of this massive milestone event. Your support directly funds the ecosystem—covering the travel and accommodation of global speakers, powering the hackathon infrastructure, and providing an unforgettable experience for attendees.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '2rem' }}>
          <div style={{ padding: '16px', background: 'var(--color-panel-overlay)', borderRadius: '8px', borderLeft: '4px solid var(--color-brand-gold)' }}>
            <h4 style={{ color: 'var(--color-text-snow)', margin: '0 0 8px 0' }}>Title</h4>
            <p style={{ color: 'var(--color-text-muted-strong)', margin: 0, fontWeight: 'bold' }}>INR 3,50,000+</p>
          </div>
          <div style={{ padding: '16px', background: 'var(--color-panel-overlay)', borderRadius: '8px', borderLeft: '4px solid var(--color-brand-silver)' }}>
            <h4 style={{ color: 'var(--color-text-snow)', margin: '0 0 8px 0' }}>Co-Title</h4>
            <p style={{ color: 'var(--color-text-muted-strong)', margin: 0, fontWeight: 'bold' }}>INR 2,75,000+</p>
          </div>
          <div style={{ padding: '16px', background: 'var(--color-panel-overlay)', borderRadius: '8px', borderLeft: '4px solid var(--color-brand-platinum)' }}>
            <h4 style={{ color: 'var(--color-text-snow)', margin: '0 0 8px 0' }}>Platinum</h4>
            <p style={{ color: 'var(--color-text-muted-strong)', margin: 0, fontWeight: 'bold' }}>INR 2,00,000+</p>
          </div>
          <div style={{ padding: '16px', background: 'var(--color-panel-overlay)', borderRadius: '8px', borderLeft: '4px solid var(--color-brand-gold)' }}>
            <h4 style={{ color: 'var(--color-text-snow)', margin: '0 0 8px 0' }}>Gold</h4>
            <p style={{ color: 'var(--color-text-muted-strong)', margin: 0, fontWeight: 'bold' }}>INR 1,25,000+</p>
          </div>
          <div style={{ padding: '16px', background: 'var(--color-panel-overlay)', borderRadius: '8px', borderLeft: '4px solid var(--color-brand-bronze)' }}>
            <h4 style={{ color: 'var(--color-text-snow)', margin: '0 0 8px 0' }}>Bronze</h4>
            <p style={{ color: 'var(--color-text-muted-strong)', margin: 0, fontWeight: 'bold' }}>INR 75,000+</p>
          </div>
          <div style={{ padding: '16px', background: 'var(--color-panel-overlay)', borderRadius: '8px', borderLeft: '4px solid var(--color-success)' }}>
            <h4 style={{ color: 'var(--color-text-snow)', margin: '0 0 8px 0' }}>Supporter</h4>
            <p style={{ color: 'var(--color-text-muted-strong)', margin: 0, fontWeight: 'bold' }}>Flexible Contribution</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <a href="/Sponsorship_Brochure.pdf" download className="btn btn-primary" style={{ padding: '16px 32px', display: 'inline-block' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Download Sponsorship Brochure
            </span>
          </a>
        </div>

        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--color-border-soft)', paddingTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Get in Touch</h3>
          <p style={{ color: 'var(--color-text-snow)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Booths and speaking slots are limited so contact us today to secure your tier. You can reach out directly to our coordinators or submit the form below.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '3rem' }}>
            <div style={{ background: 'var(--color-panel-overlay-soft)', padding: '16px', borderRadius: '8px' }}>
              <strong style={{ color: 'var(--color-text-snow)', fontSize: '1.1rem' }}>Sudhanshu</strong><br />
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted-strong)', display: 'block', marginBottom: '4px' }}>Overall Coordinator</span>
              <span style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', display: 'block' }}>+91 98919 07290</span>
              <a href="mailto:iit2024081@iiita.ac.in" style={{ fontSize: '0.95rem', color: 'var(--color-accent)', textDecoration: 'none' }}>iit2024081@iiita.ac.in</a>
            </div>
            <div style={{ background: 'var(--color-panel-overlay-soft)', padding: '16px', borderRadius: '8px' }}>
              <strong style={{ color: 'var(--color-text-snow)', fontSize: '1.1rem' }}>Rishu Kumar</strong><br />
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted-strong)', display: 'block', marginBottom: '4px' }}>Overall Coordinator</span>
              <span style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', display: 'block' }}>+91 62395 91434</span>
              <a href="mailto:iit2024183@iiita.ac.in" style={{ fontSize: '0.95rem', color: 'var(--color-accent)', textDecoration: 'none' }}>iit2024183@iiita.ac.in</a>
            </div>
            <div style={{ background: 'var(--color-panel-overlay-soft)', padding: '16px', borderRadius: '8px' }}>
              <strong style={{ color: 'var(--color-text-snow)', fontSize: '1.1rem' }}>Aditya Ajay</strong><br />
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted-strong)', display: 'block', marginBottom: '4px' }}>Overall Coordinator</span>
              <span style={{ fontSize: '0.95rem', color: 'var(--color-text-light)', display: 'block' }}>+91 92365 18179</span>
              <a href="mailto:iit2024174@iiita.ac.in" style={{ fontSize: '0.95rem', color: 'var(--color-accent)', textDecoration: 'none' }}>iit2024174@iiita.ac.in</a>
            </div>
          </div>
        </div>

        {/* ── SPONSOR APPLICATION FORM ── */}
        <div style={{ borderTop: '1px solid var(--color-border-soft)', paddingTop: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-text-snow)' }}>Submit an Inquiry</h3>
          <form onSubmit={handleSponsorSubmit} className="contact-form" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="form-group">
              <label htmlFor="sponsor-name">Full Name *</label>
              <input
                id="sponsor-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="form-control"
                placeholder="Your Name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="sponsor-email">Work Email *</label>
              <input
                id="sponsor-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="form-control"
                placeholder="you@company.com"
              />
            </div>
            <div className="form-group">
              <label htmlFor="sponsor-org">Organization / Company *</label>
              <input
                id="sponsor-org"
                type="text"
                value={form.organization}
                onChange={(e) => setForm({ ...form, organization: e.target.value })}
                className="form-control"
                placeholder="Company Name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="sponsor-message">Additional Details (Optional)</label>
              <textarea
                id="sponsor-message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="form-control"
                rows="4"
                placeholder="Tell us what sponsorship tiers you are interested in..."
              />
            </div>
            {formStatus && (
              <p className={`form-status ${formStatus.includes('sent') ? 'success' : 'error'}`} style={{ color: formStatus.includes('sent') ? 'var(--color-success)' : 'var(--color-error)', marginBottom: '1rem' }}>
                {formStatus}
              </p>
            )}
            <button type="submit" className="btn btn-primary" style={{ padding: '16px 56px', marginTop: '8px' }}>Send Message</button>
          </form>
        </div>
      </div>
    </section>
  )
}
