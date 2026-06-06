import Speakers from '../Speakers.jsx'
import Sponsors from '../Sponsors.jsx'
import Team from '../Team.jsx'
import Schedule from '../Schedule.jsx'
import Home from '../Home.jsx'
import Hackathon from '../Hackathon.jsx'

function AdminPreviewEditShell({
  section, // 'home', 'speakers', 'sponsors', 'schedule', 'team', 'hackathon'
  mode, // 'preview' or 'edit'
  onBack,
  onPublish,
  
  // Data props
  hero,
  about,
  speakers,
  sortedSponsors,
  categorizedTeam,
  filteredSchedule,
  activeDay,
  setActiveDay,
  
  // Edit handlers
  openModal,
  editRecord,
  deleteRecord,
  setSpeakers,
  setSponsors,
  setTeam,
  setSchedule,
  getEventTime,
  getEventDesc,
}) {
  const isEdit = mode === 'edit'

  const handlePublishAll = () => {
    if (onPublish) {
      onPublish(section)
    }
  }

  return (
    <div className="preview-edit-shell">
      {/* Admin Top Overlay Toolbar */}
      <div className="preview-edit-toolbar glass-card">
        <div className="toolbar-left">
          <span className="mode-badge">{isEdit ? '⚡ Context Editor' : '👁️ Public Preview'}</span>
          <span className="section-label">Viewing section: <strong>{section}</strong></span>
        </div>
        
        <div className="toolbar-right">
          <button type="button" className="btn btn-outline btn-sm" onClick={onBack}>
            ← Exit to Dashboard
          </button>
          {isEdit ? (
            <span className="toolbar-tip">Hover card items to access Edit/Delete actions in context.</span>
          ) : (
            <button type="button" className="btn btn-primary btn-sm" onClick={handlePublishAll}>
              Publish Section
            </button>
          )}
        </div>
      </div>

      {/* Render Component Container */}
      <div className="preview-component-viewport">
        {section === 'home' && (
          <Home
            hero={hero}
            about={about}
            navigateTo={() => {}}
          />
        )}

        {section === 'speakers' && (
          <Speakers
            speakers={speakers}
            adminMode={isEdit}
            openModal={openModal}
            editRecord={editRecord}
            deleteRecord={deleteRecord}
            setSpeakers={setSpeakers}
          />
        )}

        {section === 'sponsors' && (
          <Sponsors
            sortedSponsors={sortedSponsors}
            adminMode={isEdit}
            openModal={openModal}
            editRecord={editRecord}
            deleteRecord={deleteRecord}
            setSponsors={setSponsors}
          />
        )}

        {section === 'team' && (
          <Team
            categorizedTeam={categorizedTeam}
            adminMode={isEdit}
            openModal={openModal}
            editRecord={editRecord}
            deleteRecord={deleteRecord}
            setTeam={setTeam}
          />
        )}

        {section === 'schedule' && (
          <Schedule
            filteredSchedule={filteredSchedule}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            adminMode={isEdit}
            openModal={openModal}
            editRecord={editRecord}
            deleteRecord={deleteRecord}
            setSchedule={setSchedule}
            getEventTime={getEventTime}
            getEventDesc={getEventDesc}
          />
        )}

        {section === 'hackathon' && <Hackathon />}
      </div>
    </div>
  )
}

export default AdminPreviewEditShell
