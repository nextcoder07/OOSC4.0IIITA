import ReorderableGrid from './ReorderableGrid.jsx'

function Sponsors({
  sortedSponsors,
  adminMode,
  openModal,
  editRecord,
  deleteRecord,
  setSponsors,
  sponsors,
  reorderRecords,
}) {
  return (
    <section className="content-section" id="sponsors">
      <div className="section-heading split">
        <div>
          <span>Partners</span>
          <h2>Conference Supporters</h2>
          <p>Academic institutions and corporate engineering partners supporting open systems research.</p>
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
              
              {adminMode ? (
                <ReorderableGrid
                  items={group}
                  admin={adminMode}
                  containerClass="sponsor-logo-grid"
                  itemClass="sponsor-card-outer"
                  onReorder={(newTierSponsors) => {
                    const updatedSponsors = sponsors.map((sp) => {
                      const match = newTierSponsors.find((item) => item.id === sp.id)
                      return match ? { ...sp, sortOrder: match.sortOrder } : sp
                    })
                    reorderRecords('sponsors', updatedSponsors, setSponsors)
                  }}
                  renderItem={(sponsor) => (
                    <>
                      <a href={sponsor.website} target="_blank" rel="noreferrer" className="sponsor-card glass-card">
                        <div className="logo-container">
                          <img src={sponsor.logoURL} alt={sponsor.name} loading="lazy" />
                        </div>
                        <span className="sponsor-name">{sponsor.name}</span>
                      </a>
                      <div className="sponsor-admin-controls">
                        <button
                          type="button"
                          className="btn btn-admin-mini"
                          onClick={() => editRecord('sponsors', sponsor)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-delete-sponsor"
                          onClick={() => deleteRecord('sponsors', sponsor.id, setSponsors)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                />
              ) : (
                <div className="sponsor-logo-grid">
                  {group.map((sponsor) => (
                    <div key={sponsor.id} className="sponsor-card-outer">
                      <a href={sponsor.website} target="_blank" rel="noreferrer" className="sponsor-card glass-card">
                        <div className="logo-container">
                          <img src={sponsor.logoURL} alt={sponsor.name} loading="lazy" />
                        </div>
                        <span className="sponsor-name">{sponsor.name}</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default Sponsors
