import React, { useState } from 'react'
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
                      className="sponsor-card" 
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
                      <span className="drag-hint" aria-hidden="true" style={{ marginTop: '8px', display: 'flex' }}>✥ Drag to Reorder</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── SPONSOR APPLICATION FORM ── */}
      <div className="sponsor-application-section" style={{ marginTop: '4rem', padding: '2rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Become a Sponsor</h3>
        <p style={{ marginBottom: '2rem', color: 'var(--color-text-dim)' }}>Interested in partnering with us? Fill out the form below and our team will get back to you with our sponsorship prospectus.</p>
        
        <form onSubmit={handleSponsorSubmit} className="contact-form">
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
            <p className={`form-status ${formStatus.includes('sent') ? 'success' : 'error'}`} style={{ color: formStatus.includes('sent') ? '#4ade80' : '#f87171', marginBottom: '1rem' }}>
              {formStatus}
            </p>
          )}
          <button type="submit" className="btn btn-primary">Submit Application</button>
        </form>
      </div>
    </section>
  )
}
