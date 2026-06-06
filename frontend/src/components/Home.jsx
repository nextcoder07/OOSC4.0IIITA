function Home({ hero, about, navigateTo }) {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-glow-blob"></div>
        <div className="hero-content-outer">
          <div className="hero-copy">
            <span className="eyebrow-accent">Opportunity Open Source Conference</span>
            <h1>{hero.title}</h1>
            <p className="hero-subtitle">{hero.subtitle}</p>
            <p className="hero-date-badge">📅 28-30 August, 2026</p>
            <p className="hero-description">{hero.bannerText}</p>
            
            <div className="hero-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigateTo('register')}
              >
                {hero.cta}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigateTo('speakers')}
              >
                Explore Key Speakers
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Transitional Info Cards */}
      <section className="hero-transitional-details" id="home-details">
        <div className="transitional-grid">
          <div className="transitional-info-card glass-card">
            <span className="meta-icon">📅</span>
            <div>
              <h4>Conference Dates</h4>
              <p>{hero.dates}</p>
            </div>
          </div>
          <div className="transitional-info-card glass-card">
            <span className="meta-icon">📍</span>
            <div>
              <h4>Venue Hub</h4>
              <p>{hero.venue}</p>
            </div>
          </div>
          <div className="transitional-info-card glass-card">
            <h4>Why Join OOSC 4.0?</h4>
            <p>Connect with leading maintainers, explore high-throughput systems, and participate in collaborative hackathons with academic guidance.</p>
          </div>
          <div className="transitional-info-card glass-card highlight-border">
            <h4>Open Source &amp; Academia</h4>
            <p>Access developer workshops, server labs, and code sprints designed specifically to bridge academia with modern platforms.</p>
          </div>
        </div>
      </section>

      {/* About and Highlights Premium Section */}
      <section className="content-section about-section" id="about">
        <div className="about-grid">
          <div className="about-text-content">
            <div className="section-heading">
              <span>OOSC Ecosystem</span>
              <h2>{about.heading}</h2>
              <p className="about-desc">{about.description}</p>
            </div>
            
            <div className="highlights-stack">
              {about.highlights.map((point, i) => (
                <div key={i} className="highlight-pill glass-card">
                  <span className="highlight-bullet">✓</span>
                  <p>{point}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics cards */}
          <div className="stats-dashboard">
            <div className="stat-card-gradient">
              <h3>500+</h3>
              <p>Developers &amp; Researchers</p>
            </div>
            <div className="stat-card-gradient">
              <h3>20+</h3>
              <p>Academic &amp; Core Speakers</p>
            </div>
            <div className="stat-card-gradient">
              <h3>10+</h3>
              <p>Enterprise Sponsors</p>
            </div>
            <div className="stat-card-gradient">
              <h3>3 Days</h3>
              <p>Sprints &amp; Tech Panels</p>
            </div>
            <div className="stat-card-gradient span-columns">
              <h3>National Level</h3>
              <p>Student and Lab Engagement</p>
            </div>
          </div>
        </div>
      </section>

      {/* Event Overview Section */}
      <section className="content-section" id="event-overview">
        <div className="section-heading text-center">
          <span>Core Activities</span>
          <h2>Conference Focus Areas</h2>
          <p className="subtitle">From research panels to coding sprints, explore the structural core of OOSC 4.0.</p>
        </div>
        <div className="event-overview-grid">
          <div className="overview-card glass-card">
            <span className="overview-icon">🎤</span>
            <h3>Research Talks</h3>
            <p>In-depth technical sessions on server design, kernel optimizations, and state-of-the-art databases.</p>
          </div>
          <div className="overview-card glass-card">
            <span className="overview-icon">⚙️</span>
            <h3>Workshops</h3>
            <p>Interactive labs guiding developers through deployment orchestrations, API architectures, and systems diagnostics.</p>
          </div>
          <div className="overview-card glass-card">
            <span className="overview-icon">⚡</span>
            <h3>Hackathons</h3>
            <p>A multi-hour competitive sprint solving high-priority systems issues with direct coordinator support.</p>
          </div>
          <div className="overview-card glass-card">
            <span className="overview-icon">🤝</span>
            <h3>Networking Hub</h3>
            <p>Build links between leading research faculties, open source contributors, and corporate engineering advocates.</p>
          </div>
          <div className="overview-card glass-card">
            <span className="overview-icon">🌐</span>
            <h3>Code Sprints</h3>
            <p>Directly push contributions to whitelisted repositories and explore open system governance protocols.</p>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
