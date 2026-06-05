import ImageUploader from './ImageUploader.jsx'

function AdminTools({
  adminUsername,
  logout,
  uploadUrl,
  setUploadUrl,
  openModal,
  csrfToken,
}) {
  return (
    <section className="content-section admin-tools-bar glass-card" id="admin-tools">
      <div className="admin-tools-header">
        <div>
          <h3>Admin Dashboard Quick Tools</h3>
          <p>Logged in as: <strong>{adminUsername}</strong></p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={logout}>
          Sign Out
        </button>
      </div>
      
      <div className="admin-tools-grid">
        <div className="uploader-tool">
          <h4>Media Asset Upload</h4>
          <p>Drag and drop assets here. Copy the generated URL into metadata fields.</p>
          <ImageUploader onUpload={setUploadUrl} csrfToken={csrfToken} />
          {uploadUrl && (
            <div className="generated-url-box">
              <span>Asset URL:</span>
              <code>{uploadUrl}</code>
              <button 
                type="button" 
                className="btn-copy" 
                onClick={() => {
                  navigator.clipboard.writeText(uploadUrl)
                  alert('Copied link!')
                }}
              >
                Copy
              </button>
            </div>
          )}
        </div>

        <div className="quick-management-actions">
          <h4>Quick Page Modifiers</h4>
          <p>Directly add metadata cards to the active database categories:</p>
          <div className="actions-flex">
            <button type="button" className="btn btn-admin-quick" onClick={() => openModal('speakers', 'create')}>+ Add Speaker</button>
            <button type="button" className="btn btn-admin-quick" onClick={() => openModal('sponsors', 'create')}>+ Add Sponsor</button>
            <button type="button" className="btn btn-admin-quick" onClick={() => openModal('events', 'create')}>+ Add Schedule Slot</button>
            <button type="button" className="btn btn-admin-quick" onClick={() => openModal('team', 'create')}>+ Add Team Member</button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminTools
