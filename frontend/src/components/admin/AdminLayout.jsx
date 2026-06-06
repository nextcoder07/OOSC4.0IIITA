import { useState } from 'react'

function AdminLayout({
  children,
  currentTab,
  onNavigate,
  adminUsername,
  onLogout,
  unreadCount,
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'home', label: 'Home Content', icon: '🏠' },
    { key: 'speakers', label: 'Speakers', icon: '🎙️' },
    { key: 'sponsors', label: 'Sponsors', icon: '🤝' },
    { key: 'schedule', label: 'Schedule', icon: '📅' },
    { key: 'hackathon', label: 'Hackathon', icon: '⚡' },
    { key: 'team', label: 'Team', icon: '👥' },
    { key: 'contact-settings', label: 'Contact Settings', icon: '📍' },
    { key: 'registrations', label: 'Registrations', icon: '🎟️' },
  ]

  return (
    <div className="cms-layout">
      {/* Sidebar Panel */}
      <aside className={`cms-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/photos/oosclogo.jpeg" alt="OOSC Logo" className="brand-logo admin-sidebar-logo" />
          <span className="brand-badge">CMS Console</span>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`sidebar-nav-btn ${currentTab === item.key ? 'active' : ''}`}
              onClick={() => {
                onNavigate(item.key)
                setMobileSidebarOpen(false)
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="nav-badge-count">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="btn-sidebar-logout" onClick={onLogout}>
            <span className="nav-icon">🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main CMS area wrapper */}
      <div className="cms-main-wrapper">
        <header className="cms-topbar glass-card">
          <div className="topbar-left">
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Toggle sidebar menu"
            >
              ☰
            </button>
            <h2 className="topbar-title">
              {menuItems.find((m) => m.key === currentTab)?.label || 'Console'}
            </h2>
          </div>

          <div className="topbar-right">
            <div className="topbar-search">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Search resources..." className="search-input" />
            </div>

            <div className="admin-profile-badge">
              <div className="avatar">A</div>
              <div className="profile-details">
                <span className="profile-name">{adminUsername || 'Administrator'}</span>
                <span className="profile-role">Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        <main className="cms-content-area">{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout
