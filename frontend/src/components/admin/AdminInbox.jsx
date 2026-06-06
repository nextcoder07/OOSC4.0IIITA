import { useState } from 'react'

function AdminInbox({
  messages,
  registrations,
  onMarkRead,
  onDeleteMessage,
  onDeleteRegistration,
}) {
  const [activeSubTab, setActiveSubTab] = useState('messages') // 'messages' or 'registrations'

  return (
    <div className="inbox-manager-panel glass-card">
      <div className="inbox-tabs-row">
        <button
          type="button"
          className={`inbox-tab-btn ${activeSubTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('messages')}
        >
          📩 Contact Inbox ({messages.filter((m) => !m.read).length} unread)
        </button>
        
        <button
          type="button"
          className={`inbox-tab-btn ${activeSubTab === 'registrations' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('registrations')}
        >
          🎟️ Interest Registrations ({registrations.length})
        </button>
      </div>

      <div className="inbox-content-area">
        {activeSubTab === 'messages' ? (
          <div className="messages-list-wrapper">
            {messages.length === 0 ? (
              <p className="no-events">No contact form messages received yet.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`message-card-row ${msg.read ? 'read' : 'unread'}`}>
                  <div className="message-header-details">
                    <div>
                      <h5>{msg.name}</h5>
                      <span className="email-meta">{msg.email}</span>
                    </div>
                    <span className="date-meta">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="message-text-body">{msg.message}</p>
                  
                  <div className="message-actions-row">
                    {!msg.read && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => onMarkRead(msg.id)}
                      >
                        Mark as Read ✓
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-danger btn-outline btn-sm"
                      onClick={() => {
                        if (window.confirm('Delete this message permanently?')) {
                          onDeleteMessage(msg.id)
                        }
                      }}
                    >
                      Delete Message
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="registrations-table-wrapper">
            {registrations.length === 0 ? (
              <p className="no-events">No interest registrations captured yet.</p>
            ) : (
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Affiliation / Role</th>
                    <th>Message / Interest</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((lead) => (
                    <tr key={lead.id}>
                      <td>{new Date(lead.createdAt).toLocaleString()}</td>
                      <td>
                        <strong>{lead.name}</strong>
                      </td>
                      <td>{lead.email}</td>
                      <td>{lead.affiliation || 'N/A'}</td>
                      <td>{lead.message || 'N/A'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-danger btn-outline btn-sm"
                          onClick={() => {
                            if (window.confirm('Delete this registration record?')) {
                              onDeleteRegistration(lead.id)
                            }
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminInbox
