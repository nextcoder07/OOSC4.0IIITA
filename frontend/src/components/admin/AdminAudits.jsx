import { useState, useMemo } from 'react'

function AdminAudits({ auditLogs }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLogs = useMemo(() => {
    return (auditLogs || []).filter((log) => {
      const q = searchQuery.toLowerCase()
      return (
        log.adminEmail.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.resource || '').toLowerCase().includes(q)
      )
    })
  }, [auditLogs, searchQuery])

  return (
    <div className="audit-manager-panel glass-card">
      <div className="panel-header-row">
        <h3>Administrative Activity History</h3>
        <input
          type="text"
          placeholder="Filter logs by admin, action, or resource..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-control filter-logs-input"
          style={{ maxWidth: '400px' }}
        />
      </div>

      <div className="audit-table-wrapper">
        <table className="audit-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Administrator</th>
              <th>Action Details</th>
              <th>Affected Resource</th>
              <th>IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-events" style={{ textAlign: 'center' }}>
                  No administrative logs found.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>
                    <strong>{log.adminEmail}</strong>
                  </td>
                  <td>{log.action}</td>
                  <td>
                    <code>{log.resource}</code>
                  </td>
                  <td>{log.ipAddress}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminAudits
