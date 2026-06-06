import { useState, useMemo } from 'react'
import ImageUploader from '../ImageUploader.jsx'

function AdminMediaLibrary({
  mediaAssets,
  onUploadAsset,
  onDeleteAsset,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedAsset, setSelectedAsset] = useState(null)
  
  const categories = ['All', 'Speakers', 'Sponsors', 'Team', 'Hackathon', 'General']

  // Handle file uploaded from child uploader
  const handleFileUploaded = (url, extra) => {
    // When backend uploads, it returns { url, asset }
    // We already upload to server via ImageUploader, but wait!
    // In order to track categorizations, we can pass category to query.
    // However, onUploadAsset is a parent function that reloads media files!
    if (onUploadAsset) {
      onUploadAsset()
    }
  }

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return (mediaAssets || []).filter((asset) => {
      const matchSearch = (asset.filename || '').toLowerCase().includes(searchQuery.toLowerCase())
      if (selectedCategory === 'All') return matchSearch
      return matchSearch && asset.category === selectedCategory
    })
  }, [mediaAssets, searchQuery, selectedCategory])

  const handleCopyUrl = (url) => {
    const absoluteUrl = `${window.location.origin}${url}`
    navigator.clipboard.writeText(absoluteUrl)
    alert(`Copied link to clipboard:\n${absoluteUrl}`)
  }

  return (
    <div className="media-library-manager">
      <div className="media-library-grid">
        {/* Left Side: Upload tool and library grid */}
        <section className="library-view-section glass-card">
          <div className="library-header">
            <div className="search-category-row">
              <input
                type="text"
                placeholder="Search file assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
              />
              
              <div className="category-tabs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`category-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="upload-dropzone-box">
              <h5>Add New Media Asset</h5>
              <p className="field-tip">
                Upload image for category: <strong>{selectedCategory === 'All' ? 'General' : selectedCategory}</strong>
              </p>
              
              <ImageUploader 
                onUpload={handleFileUploaded} 
                category={selectedCategory === 'All' ? 'General' : selectedCategory}
              />
            </div>
          </div>

          {/* Grid display */}
          <div className="media-assets-grid">
            {filteredAssets.length === 0 ? (
              <p className="no-events">No media assets found. Drag and drop to upload files.</p>
            ) : (
              filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className={`media-card-item ${selectedAsset?.id === asset.id ? 'selected' : ''}`}
                  onClick={() => setSelectedAsset(asset)}
                >
                  <div className="media-thumbnail">
                    <img src={asset.url} alt={asset.filename} loading="lazy" />
                  </div>
                  <div className="media-info-bar">
                    <span className="media-name">{asset.filename}</span>
                    <span className="media-category-badge">{asset.category}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Side: Detail preview panel */}
        <section className="asset-details-panel glass-card">
          {!selectedAsset ? (
            <div className="editor-placeholder">
              <span className="placeholder-icon">🖼️</span>
              <h4>No Asset Selected</h4>
              <p>Select any image from the library grid to view details, copy URLs, or delete.</p>
            </div>
          ) : (
            <div className="asset-details-content">
              <h3>Asset Details</h3>
              <div className="asset-large-preview">
                <img src={selectedAsset.url} alt={selectedAsset.filename} />
              </div>

              <div className="asset-metadata-list">
                <div className="metadata-row">
                  <span className="meta-label">File Name</span>
                  <span className="meta-value">{selectedAsset.filename}</span>
                </div>
                <div className="metadata-row">
                  <span className="meta-label">Category</span>
                  <span className="meta-value">{selectedAsset.category}</span>
                </div>
                <div className="metadata-row">
                  <span className="meta-label">Relative URL</span>
                  <span className="meta-value">
                    <code>{selectedAsset.url}</code>
                  </span>
                </div>
                <div className="metadata-row">
                  <span className="meta-label">Created At</span>
                  <span className="meta-value">
                    {new Date(selectedAsset.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="asset-actions-row">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleCopyUrl(selectedAsset.url)}
                  style={{ flex: 1 }}
                >
                  Copy Asset Link
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-outline"
                  onClick={() => {
                    if (window.confirm('Delete this file asset permanently?')) {
                      onDeleteAsset(selectedAsset.id)
                      setSelectedAsset(null)
                    }
                  }}
                  style={{ width: '40px' }}
                  title="Delete image file"
                >
                  🗑️
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminMediaLibrary
