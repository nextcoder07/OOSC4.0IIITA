import React from 'react'
import { Helmet } from 'react-helmet-async'
import { GripVertical } from 'lucide-react'
import './TeamPage.css'

export default function TeamPage({
  siteConfig, adminMode, categorizedTeam,
  draggedResource, draggedIndex, draggedCategory, dragOverIndex,
  handleDragStart, handleDragOver, handleDragEnd, handleDrop,
  openModal, editRecord, deleteRecord, setTeam
}) {
  return (
    <section className="content-section" id="team">
      <Helmet>
        <title>Team — OOSC 4.0 | IIIT Allahabad</title>
        <meta name="description" content="Meet the organizing team behind OOSC 4.0 at IIIT Allahabad — faculty coordinators, student committees, and volunteers making the conference happen." />
        <link rel="canonical" href="https://oosc.iiita.ac.in/team" />
        <meta property="og:title" content="Team — OOSC 4.0 | IIIT Allahabad" />
        <meta property="og:description" content="Meet the organizing team behind OOSC 4.0 at IIIT Allahabad — faculty coordinators, student committees, and volunteers." />
        <meta property="og:url" content="https://oosc.iiita.ac.in/team" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="Team — OOSC 4.0 | IIIT Allahabad" />
        <meta name="twitter:description" content="Meet the organizing team behind OOSC 4.0 at IIIT Allahabad." />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "ItemList",
              "itemListElement": ${JSON.stringify(Object.values(categorizedTeam).flat().map((member, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "Person",
                  "name": member.name,
                  "jobTitle": member.role || undefined,
                  "image": member.photoURL || undefined,
                  "sameAs": [member.linkedin, member.instagram].filter(Boolean).length > 0 ? [member.linkedin, member.instagram].filter(Boolean) : undefined
                }
              })))}
            }
          `}
        </script>
      </Helmet>
      <div className="section-heading split">
        <div>
          <span>{siteConfig.teamEyebrow || 'Steering Committee'}</span>
          <h1>{siteConfig.teamTitle || 'The Organizing Team'}</h1>
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
              <div className="team-grid">
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
                      {member.role ? <p className="card-subtitle">{member.role}</p> : null}
                      {member.contact ? <p className="contact-info-text">{member.contact}</p> : null}
                      {(member.linkedin || member.instagram) && (
                        <div className="social-links">
                          {member.linkedin && (
                            <a href={member.linkedin} target="_blank" rel="noreferrer" className="social-icon" aria-label="LinkedIn">
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                            </a>
                          )}
                          {member.instagram && (
                            <a href={member.instagram} target="_blank" rel="noreferrer" className="social-icon" aria-label="Instagram">
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                    {adminMode && (
                      <div className="admin-card-controls">
                        <button type="button" className="btn btn-admin-mini" onClick={() => editRecord('team', member)}>Edit</button>
                        <button type="button" className="btn-delete" onClick={() => deleteRecord('team', member.id, setTeam)}>Delete</button>
                      </div>
                    )}
                    {adminMode && (
                      <span className="drag-hint" aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><GripVertical size={16} /> Drag to Reorder</span>
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
