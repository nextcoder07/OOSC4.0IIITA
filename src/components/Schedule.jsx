import ReorderableGrid from './ReorderableGrid.jsx'

function Schedule({
  filteredSchedule,
  activeDay,
  setActiveDay,
  adminMode,
  openModal,
  editRecord,
  deleteRecord,
  setSchedule,
  getEventTime,
  getEventDesc,
  schedule,
  reorderRecords,
}) {
  return (
    <section className="content-section" id="schedule">
      <div className="section-heading split">
        <div>
          <span>Timeline</span>
          <h2>Conference Schedule</h2>
          <p>Track opening talks, workshops, hackathon check-ins, and panel discussions.</p>
        </div>
        {adminMode && (
          <button type="button" className="btn btn-admin-add" onClick={() => openModal('events', 'create')}>
            + Add Timeline Slot
          </button>
        )}
      </div>

      {/* Days Tabs */}
      <div className="schedule-tabs">
        {[
          { date: 'Aug 28', label: 'Day 1 (Aug 28)' },
          { date: 'Aug 29', label: 'Day 2 (Aug 29)' },
          { date: 'Aug 30', label: 'Day 3 (Aug 30)' },
        ].map((dayTab) => (
          <button
            key={dayTab.date}
            type="button"
            className={`tab-btn ${activeDay === dayTab.date ? 'active' : ''}`}
            onClick={() => setActiveDay(dayTab.date)}
          >
            {dayTab.label}
          </button>
        ))}
      </div>

      <div className="timeline-container">
        {filteredSchedule.length === 0 ? (
          <div className="no-events glass-card">
            <p>No slots scheduled for this day yet.</p>
          </div>
        ) : (
          adminMode ? (
            <ReorderableGrid
              items={filteredSchedule}
              admin={adminMode}
              containerClass="timeline-list"
              itemClass="timeline-card glass-card"
              onReorder={(newItems) => {
                const updatedSchedule = schedule.map((ev) => {
                  const match = newItems.find((item) => item.id === ev.id)
                  return match ? { ...ev, sortOrder: match.sortOrder } : ev
                })
                reorderRecords('events', updatedSchedule, setSchedule)
              }}
              renderItem={(item) => (
                <>
                  <div className="timeline-badge">{item.type || 'Session'}</div>
                  <span className="timeline-time">{getEventTime(item)}</span>
                  <h3>{item.title}</h3>
                  <p>{getEventDesc(item)}</p>
                  
                  <div className="admin-card-controls admin-card-actions">
                    <button
                      type="button"
                      className="btn btn-admin-mini"
                      onClick={() => editRecord('events', item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => deleteRecord('events', item.id, setSchedule)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            />
          ) : (
            <div className="timeline-list">
              {filteredSchedule.map((item) => (
                <article key={item.id} className="timeline-card glass-card">
                  <div className="timeline-badge">{item.type || 'Session'}</div>
                  <span className="timeline-time">{getEventTime(item)}</span>
                  <h3>{item.title}</h3>
                  <p>{getEventDesc(item)}</p>
                </article>
              ))}
            </div>
          )
        )}
      </div>
    </section>
  )
}

export default Schedule
