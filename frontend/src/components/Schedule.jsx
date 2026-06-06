import React from 'react';

export default function Schedule({
  filteredSchedule,
  activeDay,
  setActiveDay,
  adminMode,
  draggedResource,
  draggedIndex,
  dragOverIndex,
  handleDragStart,
  handleDragOver,
  handleDragEnd,
  handleDrop,
  openModal,
  editRecord,
  deleteRecord,
  setSchedule,
  siteConfig,
  getEventTime,
  getEventDesc
}) {
  return (
    <section className="content-section" id="schedule">
            <div className="section-heading split">
              <div>
                <span>{siteConfig.scheduleEyebrow || 'Timeline'}</span>
                <h2>{siteConfig.scheduleTitle || 'Conference Schedule'}</h2>
                <p>{siteConfig.scheduleSubtitle || 'Track opening talks, workshops, hackathon check-ins, and panel discussions.'}</p>
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
                <div className="timeline-list">
                  {filteredSchedule.map((item, index) => (
                    <article
                      key={item.id}
                      draggable={adminMode}
                      className={`timeline-card glass-card ${adminMode ? 'admin-draggable' : ''} ${draggedResource === 'events' && draggedIndex === index ? 'dragging' : ''} ${draggedResource === 'events' && dragOverIndex === index ? 'drag-over' : ''}`.trim()}
                      onDragStart={(e) => handleDragStart(e, 'events', index)}
                      onDragOver={(e) => handleDragOver(e, 'events', index)}
                      onDragEnd={handleDragEnd}
                      onDrop={(e) => handleDrop(e, 'events', index)}
                    >
                      <div className="timeline-badge">{item.type || 'Session'}</div>
                      <span className="timeline-time">{getEventTime(item)}</span>
                      <h3>{item.title}</h3>
                      <p>{getEventDesc(item)}</p>
                      
                      {adminMode && (
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
                      )}
                      {adminMode && (
                        <span className="drag-hint" aria-hidden="true">
                          ✥ Drag to Reorder
                        </span>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
  );
}
