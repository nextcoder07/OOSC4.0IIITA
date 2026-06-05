import ImageUploader from './ImageUploader.jsx'

function AdminModal({
  modalMode,
  modalResource,
  resourceLabels,
  closeModal,
  modalFieldMap,
  modalData,
  setModalField,
  setModalImage,
  modalError,
  saveModalRecord,
  csrfToken,
}) {
  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
      <div className="admin-modal-panel glass-card">
        <div className="admin-modal-header">
          <h3>
            {modalMode === 'create'
              ? `Add New ${resourceLabels[modalResource] || ''}`
              : `Edit ${resourceLabels[modalResource] || ''}`}
          </h3>
          <button type="button" className="btn-close-modal" onClick={closeModal} aria-label="Close dialog">✕</button>
        </div>
        <div className="admin-modal-body">
          {modalFieldMap[modalResource]?.map((field) => (
            <div key={field.key} className="form-group modal-form-group">
              <label htmlFor={`modal-${field.key}`}>{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  id={`modal-${field.key}`}
                  value={modalData[field.key] ?? ''}
                  onChange={(event) => setModalField(field.key, event.target.value)}
                  className="form-control"
                  rows="4"
                />
              ) : (
                <input
                  id={`modal-${field.key}`}
                  type={field.type}
                  value={modalData[field.key] ?? ''}
                  onChange={(event) => setModalField(field.key, event.target.value)}
                  className="form-control"
                />
              )}
            </div>
          ))}
          <div className="modal-upload-row">
            <div>
              <p className="field-tip">Use upload or paste image/URL fields for live preview.</p>
              <ImageUploader onUpload={setModalImage} label="Upload image or logo" csrfToken={csrfToken} />
            </div>
            {((modalResource === 'sponsors' ? modalData.logoURL : modalData.photoURL) || '').length > 0 && (
              <div className="modal-preview-box">
                <span>Preview</span>
                <img
                  src={modalResource === 'sponsors' ? modalData.logoURL : modalData.photoURL}
                  alt="Preview"
                  loading="lazy"
                />
              </div>
            )}
          </div>
          {modalError && <p className="admin-status-message error modal-error">{modalError}</p>}
        </div>
        <div className="admin-modal-actions">
          <button type="button" className="btn btn-secondary" onClick={closeModal}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={saveModalRecord}>
            {modalMode === 'create' ? 'Create' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminModal
