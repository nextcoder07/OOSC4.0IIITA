import { useState, useEffect } from 'react'
import ImageUploader from '../ImageUploader.jsx'

function AdminPageManager({
  pageKey, // 'home' or 'hackathon'
  settings,
  onSaveSettings,
}) {
  // Parsing helpers
  const getInitialHomeContent = () => {
    try {
      if (settings.home_content) {
        return JSON.parse(settings.home_content)
      }
    } catch (e) {
      console.error('Error parsing home_content setting', e)
    }
    // Default fallback
    return {
      hero: {
        title: 'OOSC 4.0',
        subtitle: 'Open Source Systems Conference at IIITA',
        dates: 'Aug 28–30, 2026',
        venue: 'International Institute of Information Technology, Allahabad',
        cta: 'Register Interest',
        bannerText: 'Building the next generation of open source systems, AI, and community-driven research.',
        backgroundURL: '',
      },
      about: {
        heading: 'About OOSC 4.0',
        description: 'OOSC 4.0 is the annual Open Source Systems Conference at IIITA, bringing together researchers, developers, students, and industry leaders to explore distributed systems, cloud-native platforms, open source tooling, and collaborative innovation.',
        highlights: [
          '3 days of talks, workshops, and hackathon challenges',
          'Speakers from academia, startups, and enterprise engineering',
          'Networking, mentorship, and project showcases'
        ]
      },
      stats: [
        { label: 'Developers & Researchers', count: '500+' },
        { label: 'Academic & Core Speakers', count: '20+' },
        { label: 'Enterprise Sponsors', count: '10+' },
        { label: 'Sprints & Tech Panels', count: '3 Days' },
        { label: 'Student and Lab Engagement', count: 'National Level' }
      ],
      features: [
        { icon: '🎤', title: 'Research Talks', desc: 'In-depth technical sessions on server design, kernel optimizations, and state-of-the-art databases.' },
        { icon: '⚙️', title: 'Workshops', desc: 'Interactive labs guiding developers through deployment orchestrations, API architectures, and systems diagnostics.' },
        { icon: '⚡', title: 'Hackathons', desc: 'A multi-hour competitive sprint solving high-priority systems issues with direct coordinator support.' },
        { icon: '🤝', title: 'Networking Hub', desc: 'Build links between leading research faculties, open source contributors, and corporate engineering advocates.' },
        { icon: '🌐', title: 'Code Sprints', desc: 'Directly push contributions to whitelisted repositories and explore open system governance protocols.' }
      ]
    }
  }

  const getInitialHackathonContent = () => {
    try {
      if (settings.hackathon_content) {
        return JSON.parse(settings.hackathon_content)
      }
    } catch (e) {
      console.error('Error parsing hackathon_content setting', e)
    }
    // Default fallback
    return {
      hero: {
        title: 'OOSC 4.0 Hackathon',
        subtitle: 'Flagship open source coding track',
        description: 'Join the flagship hackathon track for students, researchers, and open source builders.',
        bannerURL: '',
        registrationLink: '',
      },
      cards: [
        { title: 'What to Expect', desc: 'Teams will solve real systems, AI, and open source challenges in a fast-paced sprint supported by mentors.' },
        { title: 'Who Should Participate', bullet1: 'Students passionate about software, hardware, and open collaboration', bullet2: 'Researchers and contributors exploring practical implementation', bullet3: 'Teams aiming to present strong solutions to judges and sponsors' },
        { title: 'Prizes & Support', desc: 'Top teams earn awards, mentorship sessions, and fast-track invitations to showcase at the closing ceremony.' }
      ],
      rules: [
        'Teams must consist of 2 to 4 members.',
        'All work must be completed during the hackathon period. Pre-existing codebases are not allowed.',
        'Submitted code must use open source licensing.'
      ],
      tracks: [
        { name: 'Distributed Systems', desc: 'Build fault-tolerant protocols or high-throughput storage systems.' },
        { name: 'Open Web & Tooling', desc: 'Create developer utilities, compiler optimizations, or developer platforms.' }
      ]
    }
  }

  const [homeState, setHomeState] = useState(getInitialHomeContent())
  const [hackathonState, setHackathonState] = useState(getInitialHackathonContent())
  
  // Sync state if settings update
  useEffect(() => {
    setHomeState(getInitialHomeContent())
    setHackathonState(getInitialHackathonContent())
  }, [settings])

  // Handle Home updates
  const handleHomeFieldChange = (section, field, val) => {
    setHomeState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: val,
      },
    }))
  }

  const handleHomeArrayChange = (section, idx, val, property = null) => {
    setHomeState((prev) => {
      const arr = [...prev[section]]
      if (property) {
        arr[idx] = { ...arr[idx], [property]: val }
      } else {
        arr[idx] = val
      }
      return { ...prev, [section]: arr }
    })
  }

  // Handle Hackathon updates
  const handleHackathonFieldChange = (section, field, val) => {
    setHackathonState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: val,
      },
    }))
  }

  const handleSave = () => {
    if (pageKey === 'home') {
      onSaveSettings({ home_content: JSON.stringify(homeState) })
    } else {
      onSaveSettings({ hackathon_content: JSON.stringify(hackathonState) })
    }
    alert('Settings saved successfully!')
  }

  return (
    <div className="page-manager-container glass-card">
      <div className="page-manager-header">
        <h3>{pageKey === 'home' ? 'Home Page Editor' : 'Hackathon Page Editor'}</h3>
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          Save Page Changes
        </button>
      </div>

      <div className="page-manager-sections">
        {pageKey === 'home' ? (
          <div className="form-fields-scroll">
            {/* Hero Section Accordion */}
            <div className="editor-group-box">
              <h4>Hero Section Settings</h4>
              <div className="form-group">
                <label>Hero Title *</label>
                <input
                  type="text"
                  value={homeState.hero.title}
                  onChange={(e) => handleHomeFieldChange('hero', 'title', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Hero Subtitle *</label>
                <input
                  type="text"
                  value={homeState.hero.subtitle}
                  onChange={(e) => handleHomeFieldChange('hero', 'subtitle', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Banner Text *</label>
                <textarea
                  value={homeState.hero.bannerText}
                  onChange={(e) => handleHomeFieldChange('hero', 'bannerText', e.target.value)}
                  className="form-control"
                  rows="3"
                />
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Dates Display Label</label>
                  <input
                    type="text"
                    value={homeState.hero.dates}
                    onChange={(e) => handleHomeFieldChange('hero', 'dates', e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>CTA Button Label</label>
                  <input
                    type="text"
                    value={homeState.hero.cta}
                    onChange={(e) => handleHomeFieldChange('hero', 'cta', e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Venue Description</label>
                <input
                  type="text"
                  value={homeState.hero.venue}
                  onChange={(e) => handleHomeFieldChange('hero', 'venue', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>

            {/* About Section Accordion */}
            <div className="editor-group-box">
              <h4>About Section Settings</h4>
              <div className="form-group">
                <label>About Heading *</label>
                <input
                  type="text"
                  value={homeState.about.heading}
                  onChange={(e) => handleHomeFieldChange('about', 'heading', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>About Description *</label>
                <textarea
                  value={homeState.about.description}
                  onChange={(e) => handleHomeFieldChange('about', 'description', e.target.value)}
                  className="form-control"
                  rows="4"
                />
              </div>
              
              <div className="highlights-editor-list">
                <label>Highlights List (Checkpoints)</label>
                {homeState.about.highlights.map((hl, idx) => (
                  <div key={idx} className="highlight-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={hl}
                      onChange={(e) => handleHomeArrayChange('about', idx, e.target.value)}
                      className="form-control"
                    />
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        const filtered = homeState.about.highlights.filter((_, i) => i !== idx)
                        setHomeState(prev => ({
                          ...prev,
                          about: { ...prev.about, highlights: filtered }
                        }))
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setHomeState(prev => ({
                      ...prev,
                      about: { ...prev.about, highlights: [...prev.about.highlights, 'New Highlight Point'] }
                    }))
                  }}
                >
                  + Add Point
                </button>
              </div>
            </div>

            {/* Stats Cards Section */}
            <div className="editor-group-box">
              <h4>Home Stat Metrics Grid</h4>
              <div className="stats-metric-editor-grid">
                {homeState.stats.map((st, idx) => (
                  <div key={idx} className="stat-editor-item">
                    <input
                      type="text"
                      value={st.count}
                      placeholder="Count (e.g. 500+)"
                      onChange={(e) => handleHomeArrayChange('stats', idx, e.target.value, 'count')}
                      className="form-control"
                      style={{ fontWeight: 'bold' }}
                    />
                    <input
                      type="text"
                      value={st.label}
                      placeholder="Label (e.g. Students)"
                      onChange={(e) => handleHomeArrayChange('stats', idx, e.target.value, 'label')}
                      className="form-control"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="form-fields-scroll">
            {/* Hackathon Hero Section */}
            <div className="editor-group-box">
              <h4>Hackathon Info</h4>
              <div className="form-group">
                <label>Hackathon Header Title</label>
                <input
                  type="text"
                  value={hackathonState.hero.title}
                  onChange={(e) => handleHackathonFieldChange('hero', 'title', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Subtitle / Track Info</label>
                <input
                  type="text"
                  value={hackathonState.hero.subtitle}
                  onChange={(e) => handleHackathonFieldChange('hero', 'subtitle', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label>Description Paragraph</label>
                <textarea
                  value={hackathonState.hero.description}
                  onChange={(e) => handleHackathonFieldChange('hero', 'description', e.target.value)}
                  className="form-control"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>External Registration URL (Optional)</label>
                <input
                  type="url"
                  value={hackathonState.hero.registrationLink}
                  onChange={(e) => handleHackathonFieldChange('hero', 'registrationLink', e.target.value)}
                  className="form-control"
                  placeholder="https://formlink.com"
                />
              </div>
            </div>

            {/* Hackathon Rules Editor */}
            <div className="editor-group-box">
              <h4>Hackathon Rules</h4>
              {hackathonState.rules.map((rule, idx) => (
                <div key={idx} className="highlight-row" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    value={rule}
                    onChange={(e) => {
                      const arr = [...hackathonState.rules]
                      arr[idx] = e.target.value
                      setHackathonState((prev) => ({ ...prev, rules: arr }))
                    }}
                    className="form-control"
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      const filtered = hackathonState.rules.filter((_, i) => i !== idx)
                      setHackathonState((prev) => ({ ...prev, rules: filtered }))
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setHackathonState((prev) => ({
                    ...prev,
                    rules: [...prev.rules, 'New rules criteria point'],
                  }))
                }}
              >
                + Add Rule
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPageManager
