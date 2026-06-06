import React from 'react'
import './TeamPage.css'

export default function TeamPage({
  siteConfig, adminMode, categorizedTeam,
  draggedResource, draggedIndex, draggedCategory, dragOverIndex,
  handleDragStart, handleDragOver, handleDragEnd, handleDrop,
  openModal, editRecord, deleteRecord, setTeam
}) {
  return (
    <section className="content-section" id="team">
      <div className="section-heading split">
        <div>
          <span>{siteConfig.teamEyebrow || 'Steering Committee'}</span>
          <h2>{siteConfig.teamTitle || 'The Organizing Team'}</h2>
          <p>{siteConfig.teamSubtitle || 'Meet the faculty directors and student committees hosting OOSC 4.0 at IIIT Allahabad.'}</p>
        </div>
        {adminMode && (
          <button type="button" className="btn btn-admin-add" onClick={() => openModal('team', 'create')}>
            + Add Team Member
          </button>
        )}
      </div>

      <div className="team-categories-container">
        {Object.entries(categorizedTeam).map(([categoryName, members]) => {
          if (members.length === 0 && !adminMode) return null
          return (
            <div key={categoryName} className="team-category-section">
              <h3 className="team-category-title">{categoryName}</h3>
              <div className="card-grid team-grid">
                {members.map((member, index) => (
                  <article
                    key={member.id}
                    draggable={adminMode}
                    className={`card team-card glass-card ${adminMode ? 'admin-draggable' : ''} ${draggedResource === 'team' && draggedCategory === categoryName && draggedIndex === index ? 'dragging' : ''} ${draggedResource === 'team' && draggedCategory === categoryName && dragOverIndex === index ? 'drag-over' : ''}`.trim()}
                    onDragStart={(e) => handleDragStart(e, 'team', index, categoryName)}
                    onDragOver={(e) => handleDragOver(e, 'team', index, categoryName)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, 'team', index, categoryName)}
                  >
                    <div className="image-wrapper team-avatar">
                      <img src={member.photoURL} alt={member.name} loading="lazy" />
                    </div>
                    <div className="card-content">
                      <h3>{member.name}</h3>
                      <p className="card-subtitle">{member.role}</p>
                      <p className="contact-info-text">{member.contact}</p>
                      <div className="social-links">
                        <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="LinkedIn">
                          <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </a>
                      </div>
                    </div>
                    {adminMode && (
                      <div className="admin-card-controls">
                        <button type="button" className="btn btn-admin-mini" onClick={() => editRecord('team', member)}>Edit</button>
                        <button type="button" className="btn-delete" onClick={() => deleteRecord('team', member.id, setTeam)}>Delete</button>
                      </div>
                    )}
                    {adminMode && (
                      <span className="drag-hint" aria-hidden="true">✥ Drag to Reorder</span>
                    )}
                  </article>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
