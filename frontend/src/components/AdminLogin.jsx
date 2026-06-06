function AdminLogin({
  loginUsername,
  setLoginUsername,
  loginPassword,
  setLoginPassword,
  handleLogin,
  adminMessage,
}) {
  return (
    <section className="content-section admin-login-section" id="admin-login">
      <div className="section-heading text-center">
        <span>Admin Gateway</span>
        <h2>OOSC 4.0 Dashboard Access</h2>
        <p className="subtitle">This area is accessible only by direct admin URL and valid credentials.</p>
      </div>

      <div className="login-panel-container">
        <form className="login-panel glass-card" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="admin-username-field">Username</label>
            <input
              id="admin-username-field"
              type="text"
              required
              value={loginUsername}
              onChange={(event) => setLoginUsername(event.target.value)}
              placeholder="Admin username"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="admin-password-field">Password</label>
            <input
              id="admin-password-field"
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
              Sign In
            </button>
          </div>
          {adminMessage && <p className="admin-status-message error">{adminMessage}</p>}
        </form>
      </div>
    </section>
  )
}

export default AdminLogin
