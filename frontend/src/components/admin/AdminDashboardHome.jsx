import { useMemo } from 'react'

function AdminDashboardHome({
  stats,
  recentLogs,
  onNavigate,
  onOpenModal,
}) {
  const quickActions = [
    { label: 'Edit Home Content', desc: 'Manage hero sections, headings, CTAs', tab: 'home', icon: '🏠' },
    { label: 'Add Speaker', desc: 'Create new expert speaker bio', action: () => onOpenModal('speakers', 'create'), icon: '🎙️' },
    { label: 'Add Sponsor', desc: 'Onboard a new sponsor tier card', action: () => onOpenModal('sponsors', 'create'), icon: '🤝' },
    { label: 'Add Team Member', desc: 'Add new staff or student helper', action: () => onOpenModal('team', 'create'), icon: '👥' },
    { label: 'Edit Schedule Slot', desc: 'Manage time slots and tracks', action: () => onOpenModal('events', 'create'), icon: '📅' },
    { label: 'Manage Hackathon', desc: 'Update rules, timeline, prizes', tab: 'hackathon', icon: '⚡' },
    { label: 'Open Media Library', desc: 'View, copy links, or delete media', tab: 'media', icon: '🖼️' },
    { label: 'View Public Site', desc: 'Open the homepage in a new tab', action: () => window.open('/', '_blank'), icon: '🌐' },
  ]

  const formattedLogs = useMemo(() => {
    return (recentLogs || []).slice(0, 5).map((log) => {
      const date = new Date(log.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
      return { ...log, timeStr: date }
    })
  }, [recentLogs])

  return (
    <div className="dashboard-home">
      {/* Stats Cards Widget */}
      <section className="stats-row">
        <div className="stat-widget glass-card">
          <div className="stat-icon pink">🎙️</div>
          <div>
            <h4>Total Speakers</h4>
            <h3>{stats.speakers ?? 0}</h3>
          </div>
        </div>
        <div className="stat-widget glass-card">
          <div className="stat-icon purple">🤝</div>
          <div>
            <h4>Total Sponsors</h4>
            <h3>{stats.sponsors ?? 0}</h3>
          </div>
        </div>
        <div className="stat-widget glass-card">
          <div className="stat-icon blue">👥</div>
          <div>
            <h4>Team Members</h4>
            <h3>{stats.team ?? 0}</h3>
          </div>
        </div>
        <div className="stat-widget glass-card">
          <div className="stat-icon green">🎟️</div>
          <div>
            <h4>Registrations</h4>
            <h3>{stats.leads ?? 0}</h3>
          </div>
        </div>
        <div className="stat-widget glass-card">
          <div className="stat-icon orange">✉️</div>
          <div>
            <h4>Unread Messages</h4>
            <h3>{stats.unreadMessages ?? 0}</h3>
          </div>
        </div>
      </section>

      <div className="dashboard-grid">
        {/* Quick actions panels */}
        <section className="quick-actions-section glass-card">
          <h3>Quick Actions Workspace</h3>
          <p className="section-desc">Common administrative tasks and page builders:</p>
          <div className="quick-actions-list">
            {quickActions.map((qa, i) => (
              <button
                key={i}
                type="button"
                className="quick-action-card"
                onClick={qa.tab ? () => onNavigate(qa.tab) : qa.action}
              >
                <span className="qa-icon">{qa.icon}</span>
                <div className="qa-text">
                  <h5>{qa.label}</h5>
                  <p>{qa.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Recent Updates audit stream */}
        <section className="recent-updates-section glass-card">
          <h3>System Audit Logs</h3>
          <p className="section-desc">Latest activities performed by administrators:</p>
          
          <div className="audit-timeline">
            {formattedLogs.length === 0 ? (
              <p className="no-events">No recent administrative activities logged.</p>
            ) : (
              formattedLogs.map((log) => (
                <div key={log.id} className="audit-log-item">
                  <div className="log-dot"></div>
                  <div className="log-content">
                    <p className="log-action">
                      <strong>{log.adminEmail}</strong>: {log.action}
                    </p>
                    <span className="log-meta">
                      Resource: <code>{log.resource}</code> • IP: {log.ipAddress} • {log.timeStr}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {formattedLogs.length > 0 && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => onNavigate('audits')}
              style={{ marginTop: '16px' }}
            >
              View All Logs
            </button>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminDashboardHome
