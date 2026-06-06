import { useState, useMemo } from 'react'
import ImageUploader from '../ImageUploader.jsx'

function AdminResourceManager({
  resource,
  items,
  onSave,
  onDelete,
  onReorder,
  onPreview,
}) {
  const [selectedItem, setSelectedItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOption, setFilterOption] = useState('all')
  const [uploadUrl, setUploadUrl] = useState('')

  // Label helpers
  const labels = {
    speakers: { singular: 'Speaker', plural: 'Speakers' },
    sponsors: { singular: 'Sponsor', plural: 'Sponsors' },
    team: { singular: 'Team Member', plural: 'Team Members' },
    events: { singular: 'Schedule Slot', plural: 'Schedule Slots' },
  }[resource]

  // Form Initializer
  const getEmptyItem = () => {
    const defaults = {
      speakers: { name: '', title: '', bio: '', photoURL: '', organization: '', linkedin: '', github: '', twitter: '', website: '', email: '', published: false, sortOrder: items.length + 1 },
      sponsors: { name: '', category: 'Title Sponsor', website: '', logoURL: '', description: '', published: false, sortOrder: items.length + 1 },
      team: { name: '', role: '', contact: '', photoURL: '', department: 'Student Coordinators', linkedin: '', github: '', email: '', published: false, sortOrder: items.length + 1 },
      events: { title: '', description: '', date: 'Aug 28', time: '', type: 'Talk', speaker: '', venue: '', startTime: '', endTime: '', track: 'Main Track', published: false, sortOrder: items.length + 1 },
    }
    return defaults[resource]
  }

  const [formState, setFormState] = useState(getEmptyItem())

  // Handle Item Select
  const handleSelectItem = (item) => {
    setSelectedItem(item)
    setFormState(item)
    setUploadUrl(item.photoURL || item.logoURL || '')
  }

  // Handle Add New click
  const handleAddNew = () => {
    setSelectedItem({ id: 'new' })
    const empty = getEmptyItem()
    setFormState(empty)
    setUploadUrl('')
  }

  // Handle form change
  const handleChange = (field, val) => {
    setFormState((prev) => ({ ...prev, [field]: val }))
  }

  // Handle Image Upload Callback
  const handleImageUploaded = (url) => {
    setUploadUrl(url)
    const imgField = resource === 'sponsors' ? 'logoURL' : 'photoURL'
    handleChange(imgField, url)
  }

  // Filter & Search Items
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const query = searchQuery.toLowerCase()
        const nameMatch = (item.name || item.title || '').toLowerCase().includes(query)
        
        if (filterOption === 'all') return nameMatch
        if (filterOption === 'published') return nameMatch && item.published
        if (filterOption === 'draft') return nameMatch && !item.published
        
        // Sponsor categories
        if (resource === 'sponsors') {
          return nameMatch && item.category === filterOption
        }
        return nameMatch
      })
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }, [items, searchQuery, filterOption, resource])

  // Save changes
  const handleSaveForm = (e, forcePublish = false) => {
    e.preventDefault()
    const payload = { ...formState }
    if (forcePublish) {
      payload.published = true
    }
    payload.sortOrder = Number(payload.sortOrder || 0)
    onSave(resource, payload)
    
    // Clear selection
    setSelectedItem(null)
  }

  // Duplicate item
  const handleDuplicate = (item) => {
    const duplicate = {
      ...item,
      id: undefined,
      name: item.name ? `${item.name} (Copy)` : undefined,
      title: item.title && resource === 'events' ? `${item.title} (Copy)` : item.title,
      sortOrder: items.length + 1,
      published: false,
    }
    onSave(resource, duplicate)
  }

  // Drag-and-Drop state reordering logic
  const [draggedIdx, setDraggedIdx] = useState(null)

  const handleDragStart = (idx) => {
    setDraggedIdx(idx)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (targetIdx) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return
    const reordered = [...filteredItems]
    const [moved] = reordered.splice(draggedIdx, 1)
    reordered.splice(targetIdx, 0, moved)
    
    // Update sortOrder values dynamically
    const updated = reordered.map((item, idx) => ({
      ...item,
      sortOrder: idx + 1,
    }))

    onReorder(resource, updated)
    setDraggedIdx(null)
  }

  return (
    <div className="resource-manager-grid">
      {/* Left panel: item list */}
      <section className="resource-list-panel glass-card">
        <div className="list-panel-header">
          <div className="search-bar-row">
            <input
              type="text"
              placeholder={`Search ${labels.plural.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
            <button type="button" className="btn btn-primary btn-sm" onClick={handleAddNew}>
              + Add New
            </button>
          </div>
          
          <div className="filter-row">
            <select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
              className="form-control filter-select"
            >
              <option value="all">All Items</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
              {resource === 'sponsors' && (
                <>
                  <option value="Title Sponsor">Title Sponsor</option>
                  <option value="Platinum Sponsor">Platinum Sponsor</option>
                  <option value="Gold Sponsor">Gold Sponsor</option>
                  <option value="Silver Sponsor">Silver Sponsor</option>
                  <option value="Community Partner">Community Partner</option>
                  <option value="Media Partner">Media Partner</option>
                </>
              )}
            </select>
            
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => onPreview(resource)}
            >
              👁️ Preview Mode
            </button>
          </div>
        </div>

        <div className="list-items-container">
          {filteredItems.length === 0 ? (
            <p className="no-events">No {labels.plural.toLowerCase()} found matching criteria.</p>
          ) : (
            filteredItems.map((item, index) => {
              const thumb = item.photoURL || item.logoURL || ''
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  className={`manager-item-row ${selectedItem?.id === item.id ? 'active' : ''}`}
                >
                  <div className="drag-handle" title="Drag to reorder">☰</div>

                  {/* Thumbnail preview */}
                  <div className="item-thumb" onClick={() => handleSelectItem(item)}>
                    {thumb ? (
                      <img src={thumb} alt={item.name || item.title || ''} />
                    ) : (
                      <div className="item-thumb-placeholder">
                        {resource === 'sponsors' ? '🤝' : resource === 'speakers' ? '🎙️' : '👤'}
                      </div>
                    )}
                  </div>

                  <div className="item-main-details" onClick={() => handleSelectItem(item)}>
                    <h5>{item.name || item.title || `Unnamed ${labels.singular}`}</h5>
                    <span className="item-subtext">
                      {resource === 'speakers' && (item.title || 'No Designation')}
                      {resource === 'sponsors' && item.category}
                      {resource === 'team' && (item.role || item.department)}
                      {resource === 'events' && `${item.date} • ${item.time || item.startTime || ''}`}
                    </span>
                  </div>

                  <div className="item-badges-actions">
                    <span className={`status-badge ${item.published ? 'published' : 'draft'}`}>
                      {item.published ? 'Published' : 'Draft'}
                    </span>

                    <button
                      type="button"
                      className="btn-item-action"
                      onClick={() => handleDuplicate(item)}
                      title="Duplicate"
                    >
                      👯
                    </button>
                    <button
                      type="button"
                      className="btn-item-action delete"
                      onClick={() => {
                        if (window.confirm('Delete this record permanently?')) {
                          onDelete(resource, item.id)
                          if (selectedItem?.id === item.id) setSelectedItem(null)
                        }
                      }}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* Right panel: editor form */}
      <section className="resource-editor-panel glass-card">
        {!selectedItem ? (
          <div className="editor-placeholder">
            <span className="placeholder-icon">✍️</span>
            <h4>No {labels.singular} Selected</h4>
            <p>Select an item from the left pane or click "+ Add New" to start editing.</p>
          </div>
        ) : (
          <form onSubmit={handleSaveForm} className="editor-form-grid">
            <div className="editor-header">
              <h3>
                {selectedItem.id === 'new' ? `Create ${labels.singular}` : `Edit ${labels.singular}`}
              </h3>
              <div className="status-indicator">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formState.published || false}
                    onChange={(e) => handleChange('published', e.target.checked)}
                  />
                  <span>Publish immediately</span>
                </label>
              </div>
            </div>

            {/* Fields layout wrapper */}
            <div className="form-fields-scroll">
              {resource === 'speakers' && (
                <>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={formState.name || ''}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Designation / Title *</label>
                    <input
                      type="text"
                      value={formState.title || ''}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="form-control"
                      placeholder="e.g. Lead Engineer, Professor"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Organization</label>
                    <input
                      type="text"
                      value={formState.organization || ''}
                      onChange={(e) => handleChange('organization', e.target.value)}
                      className="form-control"
                      placeholder="e.g. OpenAI, IIITA"
                    />
                  </div>
                  <div className="form-group">
                    <label>Biography *</label>
                    <textarea
                      value={formState.bio || ''}
                      onChange={(e) => handleChange('bio', e.target.value)}
                      className="form-control"
                      rows="4"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={formState.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>LinkedIn Link</label>
                      <input
                        type="url"
                        value={formState.linkedin || ''}
                        onChange={(e) => handleChange('linkedin', e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>GitHub Profile</label>
                      <input
                        type="url"
                        value={formState.github || ''}
                        onChange={(e) => handleChange('github', e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>Twitter/X Handle</label>
                      <input
                        type="url"
                        value={formState.twitter || ''}
                        onChange={(e) => handleChange('twitter', e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Personal Website</label>
                      <input
                        type="url"
                        value={formState.website || ''}
                        onChange={(e) => handleChange('website', e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>
                </>
              )}

              {resource === 'sponsors' && (
                <>
                  <div className="form-group">
                    <label>Sponsor Name *</label>
                    <input
                      type="text"
                      value={formState.name || ''}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Sponsor Tier *</label>
                    <select
                      value={formState.category || 'Title Sponsor'}
                      onChange={(e) => handleChange('category', e.target.value)}
                      className="form-control"
                    >
                      <option value="Title Sponsor">Title Sponsor</option>
                      <option value="Platinum Sponsor">Platinum Sponsor</option>
                      <option value="Gold Sponsor">Gold Sponsor</option>
                      <option value="Silver Sponsor">Silver Sponsor</option>
                      <option value="Community Partner">Community Partner</option>
                      <option value="Media Partner">Media Partner</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Website URL</label>
                    <input
                      type="url"
                      value={formState.website || ''}
                      onChange={(e) => handleChange('website', e.target.value)}
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label>Sponsor Description</label>
                    <textarea
                      value={formState.description || ''}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="form-control"
                      rows="3"
                    />
                  </div>
                </>
              )}

              {resource === 'team' && (
                <>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={formState.name || ''}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Role / Responsibility *</label>
                    <input
                      type="text"
                      value={formState.role || ''}
                      onChange={(e) => handleChange('role', e.target.value)}
                      className="form-control"
                      placeholder="e.g. Conference Chair, Hospitality Coordinator"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Department / Group *</label>
                    <select
                      value={formState.department || 'Student Coordinators'}
                      onChange={(e) => handleChange('department', e.target.value)}
                      className="form-control"
                    >
                      <option value="Core Team">Core Team</option>
                      <option value="Faculty Coordinators">Faculty Coordinators</option>
                      <option value="Student Coordinators">Student Coordinators</option>
                      <option value="Technical Team">Technical Team</option>
                      <option value="Design Team">Design Team</option>
                      <option value="Hospitality & Logistics Team">Hospitality & Logistics Team</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Contact Phone / Email *</label>
                    <input
                      type="text"
                      value={formState.contact || ''}
                      onChange={(e) => handleChange('contact', e.target.value)}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>LinkedIn Link</label>
                      <input
                        type="url"
                        value={formState.linkedin || ''}
                        onChange={(e) => handleChange('linkedin', e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>GitHub Profile</label>
                      <input
                        type="url"
                        value={formState.github || ''}
                        onChange={(e) => handleChange('github', e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>
                </>
              )}

              {resource === 'events' && (
                <>
                  <div className="form-group">
                    <label>Session Title *</label>
                    <input
                      type="text"
                      value={formState.title || ''}
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Speaker(s) / Panelists</label>
                    <input
                      type="text"
                      value={formState.speaker || ''}
                      onChange={(e) => handleChange('speaker', e.target.value)}
                      className="form-control"
                      placeholder="e.g. Dr. Ananya Mishra"
                    />
                  </div>
                  <div className="form-group">
                    <label>Session Description *</label>
                    <textarea
                      value={formState.description || ''}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="form-control"
                      rows="3"
                      required
                    />
                  </div>
                  <div className="form-row-3">
                    <div className="form-group">
                      <label>Date *</label>
                      <select
                        value={formState.date || 'Aug 28'}
                        onChange={(e) => handleChange('date', e.target.value)}
                        className="form-control"
                        required
                      >
                        <option value="Aug 28">Aug 28</option>
                        <option value="Aug 29">Aug 29</option>
                        <option value="Aug 30">Aug 30</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Time Label (Legacy) *</label>
                      <input
                        type="text"
                        value={formState.time || ''}
                        onChange={(e) => handleChange('time', e.target.value)}
                        className="form-control"
                        placeholder="e.g. 10:00 AM"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Venue Location</label>
                      <input
                        type="text"
                        value={formState.venue || ''}
                        onChange={(e) => handleChange('venue', e.target.value)}
                        className="form-control"
                        placeholder="e.g. Main Auditorium"
                      />
                    </div>
                  </div>
                  <div className="form-row-3">
                    <div className="form-group">
                      <label>Start Time (ISO/HH:MM)</label>
                      <input
                        type="time"
                        value={formState.startTime || ''}
                        onChange={(e) => handleChange('startTime', e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>End Time (ISO/HH:MM)</label>
                      <input
                        type="time"
                        value={formState.endTime || ''}
                        onChange={(e) => handleChange('endTime', e.target.value)}
                        className="form-control"
                      />
                    </div>
                    <div className="form-group">
                      <label>Event Type</label>
                      <input
                        type="text"
                        value={formState.type || 'Talk'}
                        onChange={(e) => handleChange('type', e.target.value)}
                        className="form-control"
                        placeholder="e.g. Workshop, Talk, Panel"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Conference Track</label>
                    <input
                      type="text"
                      value={formState.track || 'Main Track'}
                      onChange={(e) => handleChange('track', e.target.value)}
                      className="form-control"
                      placeholder="e.g. Track A: AI systems"
                    />
                  </div>
                </>
              )}

              {/* Universal photo upload for speakers, sponsors, team members */}
              {resource !== 'events' && (
                <div className="form-group uploader-group">
                  <label>
                    {resource === 'sponsors' ? 'Logo / Brand Graphic' : 'Profile Photo'}
                  </label>

                  {/* Live preview of current image */}
                  {uploadUrl ? (
                    <div className="image-current-preview">
                      <img src={uploadUrl} alt="Current image" />
                      <div className="image-preview-meta">
                        <span className="preview-label">Current image</span>
                        <button
                          type="button"
                          className="btn-remove-image"
                          onClick={() => handleImageUploaded('')}
                          title="Remove image"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="image-empty-state">
                      <span>{resource === 'sponsors' ? '🤝' : '👤'}</span>
                      <p>No image set yet</p>
                    </div>
                  )}

                  {/* Upload from device */}
                  <div className="upload-section">
                    <p className="upload-section-label">Upload from device</p>
                    <ImageUploader
                      onUpload={handleImageUploaded}
                      label={uploadUrl ? '🔄 Replace image' : '📁 Choose image file'}
                    />
                  </div>

                  {/* Or paste a URL */}
                  <div className="upload-section">
                    <p className="upload-section-label">Or paste an image URL</p>
                    <input
                      type="text"
                      value={uploadUrl}
                      onChange={(e) => handleImageUploaded(e.target.value)}
                      className="form-control"
                      placeholder="https://example.com/photo.png or /uploads/filename.png"
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Sort order / Priority</label>
                <input
                  type="number"
                  value={formState.sortOrder || 0}
                  onChange={(e) => handleChange('sortOrder', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            {/* Action Bar */}
            <div className="editor-actions-bar">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setFormState(getEmptyItem())
                  setSelectedItem(null)
                }}
              >
                Cancel
              </button>
              
              <button
                type="button"
                className="btn btn-secondary"
                onClick={(e) => handleSaveForm(e, false)}
              >
                Save Draft
              </button>

              <button
                type="submit"
                className="btn btn-primary"
                onClick={(e) => handleSaveForm(e, true)}
              >
                Publish
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}

export default AdminResourceManager
