import React from 'react'
import './SponsorsPage.css'

export default function SponsorsPage({
  siteConfig, adminMode, sortedSponsors,
  draggedResource, draggedIndex, draggedCategory, dragOverIndex,
  handleDragStart, handleDragOver, handleDragEnd, handleDrop,
  openModal, editRecord, deleteRecord, setSponsors
}) {
  return (
    <section className="content-section" id="sponsors">
      <div className="section-heading split">
        <div>
          <span>{siteConfig.sponsorsEyebrow || 'Partners'}</span>
          <h2>{siteConfig.sponsorsTitle || 'Conference Supporters'}</h2>
          <p>{siteConfig.sponsorsSubtitle || 'Academic institutions and corporate engineering partners supporting open systems research.'}</p>
        </div>
        {adminMode && (
          <button type="button" className="btn btn-admin-add" onClick={() => openModal('sponsors', 'create')}>
            + Add Sponsor
          </button>
        )}
      </div>

      <div className="sponsors-wrapper">
        {sortedSponsors.map(({ category, sponsors: group }) => {
          if (group.length === 0 && !adminMode) return null
          return (
            <div key={category} className="sponsor-tier-group">
              <div className="sponsor-tier-header">
                <h3>{category}</h3>
                <span className="divider-line"></span>
              </div>
              <div className="sponsor-logo-grid">
                {group.map((sponsor, index) => (
                  <div
                    key={sponsor.id}
                    draggable={adminMode}
                    className={`sponsor-card-outer ${adminMode ? 'admin-draggable' : ''} ${draggedResource === 'sponsors' && draggedCategory === category && draggedIndex === index ? 'dragging' : ''} ${draggedResource === 'sponsors' && draggedCategory === category && dragOverIndex === index ? 'drag-over' : ''}`.trim()}
                    onDragStart={(e) => handleDragStart(e, 'sponsors', index, category)}
                    onDragOver={(e) => handleDragOver(e, 'sponsors', index, category)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, 'sponsors', index, category)}
                  >
                    <a href={sponsor.website} target="_blank" rel="noreferrer" className="sponsor-card" draggable={false}>
                      <div className="logo-container">
                        <img src={sponsor.logoURL} alt={sponsor.name} loading="lazy" draggable={false} />
                      </div>
                      <span className="sponsor-name">{sponsor.name}</span>
                    </a>
                    {adminMode && (
                      <div className="sponsor-admin-controls">
                        <button type="button" className="btn btn-admin-mini" onClick={() => editRecord('sponsors', sponsor)}>Edit</button>
                        <button type="button" className="btn-delete-sponsor" onClick={() => deleteRecord('sponsors', sponsor.id, setSponsors)}>Delete</button>
                      </div>
                    )}
                    {adminMode && (
                      <span className="drag-hint" aria-hidden="true" style={{ marginTop: '8px', display: 'flex' }}>✥ Drag to Reorder</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
