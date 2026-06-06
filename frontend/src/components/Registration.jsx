import { useState } from 'react'

export default function Registration({ onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    college: '',
    year: '1st Year',
    phone: '',
    interestType: 'Attendee',
    notes: '',
  })
  const [status, setStatus] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('Sending registration details...')

    // Combine College & Year into the database 'affiliation' field
    const affiliationCombined = `${form.college} (${form.year})`

    // Combine Phone, Interest Type, and Notes into the database 'message' field
    const messageCombined = `Phone: ${form.phone}\nInterest Type: ${form.interestType}\nNotes: ${form.notes || 'None'}`

    try {
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          affiliation: affiliationCombined,
          message: messageCombined,
        }),
      })

      if (!response.ok) {
        throw new Error('Server error')
      }

      setStatus('Registration interest captured successfully! We will contact you soon.')
      setForm({
        name: '',
        email: '',
        college: '',
        year: '1st Year',
        phone: '',
        interestType: 'Attendee',
        notes: '',
      })
      onSubmit && onSubmit()
    } catch {
      setStatus('Submission failed. Please check your network and try again.')
    }
  }

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
              <span className="icon">✓</span>
              <div>
                <h4>Attendee Access</h4>
                <p>Gain access to all keynotes, labs, and interactive panels.</p>
              </div>
            </div>
            <div className="contact-detail-card glass-card">
              <span className="icon">✓</span>
              <div>
                <h4>Speaker Proposals</h4>
                <p>Present your projects and systems research to a national audience.</p>
              </div>
            </div>
            <div className="contact-detail-card glass-card">
              <span className="icon">✓</span>
              <div>
                <h4>Sponsors &amp; Ambassadors</h4>
                <p>Host workshop modules or promote open science within your community.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Right Side */}
        <div className="contact-form-panel glass-card">
          <h3>Interest Form</h3>
          <p>Provide your details to request access slots or partner keys.</p>
          
          <form className="contact-form-elements" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Enter your name"
                className="form-control"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="reg-email">Email Address</label>
              <input
                id="reg-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="name@university.edu"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-college">Institution / Organization</label>
              <input
                id="reg-college"
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
                required
                placeholder="e.g. IIIT Allahabad"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-year">Year of Study</label>
              <select
                id="reg-year"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="form-control"
              >
                <option value="1st Year">1st Year Undergraduate</option>
                <option value="2nd Year">2nd Year Undergraduate</option>
                <option value="3rd Year">3rd Year Undergraduate</option>
                <option value="4th Year">4th Year Undergraduate</option>
                <option value="Post Graduate">Post Graduate / PhD</option>
                <option value="Professional">Industry Professional</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="reg-phone">Phone Number</label>
              <input
                id="reg-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                placeholder="+91 XXXXX XXXXX"
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-interest">Interest Type</label>
              <select
                id="reg-interest"
                value={form.interestType}
                onChange={(e) => setForm({ ...form, interestType: e.target.value })}
                className="form-control"
              >
                <option value="Attendee">Attendee</option>
                <option value="Speaker">Speaker</option>
                <option value="Sponsor">Sponsor</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Campus Ambassador">Campus Ambassador</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="reg-notes">Notes / Special Requests (optional)</label>
              <textarea
                id="reg-notes"
                rows="3"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any workshop topics you're interested in, or talks you wish to pitch..."
                className="form-control"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block">
              Submit Registration Interest
            </button>
            
            {status && <p className="form-status-message">{status}</p>}
          </form>
        </div>

      </div>
    </section>
  )
}
