import * as LucideIcons from 'lucide-react'
import { Check, ExternalLink, Ticket, Zap, Shield, Pencil, Trash2 } from 'lucide-react'
import './Registration.css'

export default function Registration({ siteConfig = {}, registrationCards = [], setRegistrationCards, infoCards = [], setInfoCards, adminMode, editRecord, deleteRecord }) {
  const sortedCards = [...registrationCards].sort((a, b) => a.sortOrder - b.sortOrder)
  const sortedInfoCards = [...infoCards].sort((a, b) => a.sortOrder - b.sortOrder)

  const getIcon = (iconName) => {
    const IconComponent = LucideIcons[iconName] || Ticket;
    return <IconComponent size={32} />;
  }
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
          {sortedCards.length > 0 ? (
            sortedCards.map((card) => (
              <div key={card.id} className={`pass-card glass-card ${card.type === 'featured' ? 'featured' : ''}`} style={{ position: 'relative' }}>
                {adminMode && (
                  <div className="admin-card-controls admin-card-actions" style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                    <button type="button" className="btn btn-admin-mini" onClick={() => editRecord('registration-cards', card)}>Edit</button>
                    <button type="button" className="btn-delete" onClick={() => deleteRecord('registration-cards', card.id, setRegistrationCards)}>Delete</button>
                  </div>
                )}
                <div className="pass-icon">{getIcon(card.icon)}</div>
                <h3>{card.title}</h3>
                <div className="pass-price">{card.price}</div>
                <p className="pass-desc">{card.description}</p>
                <ul className="pass-features">
                  {(card.features || '').split('\n').map((feature, i) => {
                    if (!feature.trim()) return null;
                    return <li key={i}><Check size={16} /> {feature.trim()}</li>
                  })}
                </ul>
              </div>
            ))
          ) : (
            <div className="registration-soon glass-card" style={{ padding: '60px 40px', textAlign: 'center', margin: 'auto', gridColumn: '1 / -1' }}>
              <h3 style={{ color: 'var(--color-accent)', marginBottom: '16px' }}>Information to be coming soon</h3>
              <p style={{ color: 'var(--color-text-warm)' }}>Passes and registration details will be announced shortly. Stay tuned!</p>
            </div>
          )}
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
              {sortedInfoCards.length > 0 ? (
                sortedInfoCards.map((info) => (
                  <div key={info.id} className="contact-detail-card glass-card" style={{ position: 'relative' }}>
                    {adminMode && (
                      <div className="admin-card-controls admin-card-actions" style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
                        <button type="button" className="btn btn-admin-mini" onClick={() => editRecord('info-cards', info)}>Edit</button>
                        <button type="button" className="btn-delete" onClick={() => deleteRecord('info-cards', info.id, setInfoCards)}>Delete</button>
                      </div>
                    )}
                    <div>
                      <h4>{info.title}</h4>
                      <div dangerouslySetInnerHTML={{ __html: info.content }} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="contact-detail-card glass-card">
                  <div>
                    <h4>No Information Available</h4>
                    <p>Details will be updated soon.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Google Form Right Side */}
          <div className="contact-form-panel glass-card registration-form-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            {siteConfig.registrationFormUrl ? (
              <>
                <div className="registration-form-header">
                  <span className="registration-form-label">Official Registration</span>
                  <a 
                    href={siteConfig.registrationFormUrl}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-admin-mini"
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>Open in New Tab <ExternalLink size={16} color="var(--color-brand-blue)" /></span>
                  </a>
                </div>
                <iframe
                  src={siteConfig.registrationFormUrl}
                  width="100%"
                  height="800"
                  className="registration-form-iframe"
                  title="OOSC 4.0 Registration Form"
                >
                  Loading Google Form...
                </iframe>
              </>
            ) : (
              <div className="registration-soon" style={{ padding: '60px 40px', textAlign: 'center', margin: 'auto' }}>
                <h3 style={{ color: 'var(--color-accent)', marginBottom: '16px' }}>Registration Opening Soon</h3>
                <p style={{ color: 'var(--color-text-warm)' }}>We are currently finalizing the details. The registration form will be available here shortly.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
