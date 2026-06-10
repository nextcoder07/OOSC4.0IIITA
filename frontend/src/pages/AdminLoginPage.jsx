import React from 'react'
import './AdminLoginPage.css'

export default function AdminLoginPage({
  siteConfig, loginEmail, setLoginEmail, loginPassword, setLoginPassword,
  handleLogin, adminMessage
}) {
  return (
    <section className="content-section admin-login-section" id="admin-login">
      <div className="section-heading text-center">
        <span>{siteConfig.adminEyebrow || 'Admin Gateway'}</span>
        <h2>{siteConfig.adminTitle || 'OOSC 4.0 Dashboard Access'}</h2>
        <p className="subtitle">{siteConfig.adminSubtitle || 'Whitelist authentication system for authorized organizers.'}</p>
      </div>
      
      <div className="login-panel-container">
          <form className="login-panel glass-card" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="admin-email-field">Whitelisted Email</label>
              <input
                id="admin-email-field"
                type="email"
                required
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                placeholder="admin@example.com"
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-pw-field">Password</label>
              <input
                id="admin-pw-field"
                type="password"
                required
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="••••••••••••"
                className="form-control"
              />
            </div>
            <div className="login-actions">
              <button type="submit" className="btn btn-primary">
                Sign In to Dashboard
              </button>
            </div>
            {adminMessage && <p className="admin-status-message error">{adminMessage}</p>}
            <div className="admin-notice">
              <strong>Access restricted:</strong> Only whitelisted personnel can access the admin dashboard.
            </div>
          </form>
      </div>
    </section>
  )
}
