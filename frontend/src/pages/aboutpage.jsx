import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Check, Globe, Mail, MapPin, Calendar, Cpu, Users, Code, Award, BookOpen, Compass, ArrowRight } from 'lucide-react'
import './aboutpage.css'

export default function AboutPage({ siteConfig = {}, about = {} }) {
  // Fallbacks using siteConfig or about data where appropriate
  const heading = siteConfig.aboutTitle || about.heading || 'About OOSC 4.0'

  return (
    <div className="about-page-container">
      <Helmet>
        <title>About — OOSC 4.0 | IIIT Allahabad</title>
        <meta name="description" content="Learn about OOSC 4.0 — the Open Source Systems Conference at IIIT Allahabad, Aug 28–30, 2026. Discover our history, host city Prayagraj, past keynote speakers, and what to expect." />
        <link rel="canonical" href="https://oosc.iiita.ac.in/about" />
        <meta property="og:title" content="About — OOSC 4.0 | IIIT Allahabad" />
        <meta property="og:description" content="Learn about OOSC 4.0 — the Open Source Systems Conference at IIIT Allahabad. Discover our history, host city, past speakers, and what to expect." />
        <meta property="og:url" content="https://oosc.iiita.ac.in/about" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="About — OOSC 4.0 | IIIT Allahabad" />
        <meta name="twitter:description" content="Learn about OOSC 4.0 — the Open Source Systems Conference at IIIT Allahabad. Discover our history, host city, and past speakers." />
      </Helmet>
      {/* Logos and contact row */}
      <div className="about-hero-header-row">
        <div className="about-hero-logos">
          <img src="/OOSC_logo.png" alt="OOSC Logo" className="about-logo-oosc" />
          <span className="logo-divider">|</span>
          <img src="/IIIT_logo_transparent.gif" alt="IIITA Logo" className="about-logo-iiita" />
        </div>
        <div className="about-hero-contacts">
          <div className="about-contact-item">
            <Globe size={16} />
            <a href="https://oosc.iiita.ac.in" target="_blank" rel="noopener noreferrer">oosc.iiita.ac.in</a>
          </div>
          <div className="about-contact-item">
            <Mail size={16} />
            <a href="mailto:oosc@iiita.ac.in">oosc@iiita.ac.in</a>
          </div>
        </div>
      </div>
      {/* ─── SECTION 2: WHAT TO EXPECT AT OOSC 4.0 ──────────────────────────────── */}
      <section className="about-expect-section" id="expectations">
        <div className="about-eyebrow">About the Event</div>
        <h2 className="about-section-title">What to Expect at OOSC 4.0</h2>

        <div className="about-expect-intro">
          <p>
            The event features a variety of activities including talks, panels, Q&A sessions,
            interactive workshops, demos, and hackathons. It offers a unique opportunity for both
            programmers and non-programmers to contribute to and learn from the open-source community.
          </p>
          <p>
            Attendees will have the chance to delve into topics like system components, cloud computing,
            IoT, OS distribution integration, and more. Last year, the event was a huge success. This year,
            we aim to raise the bar even higher at IIIT Allahabad, from August 28 to August 30.
          </p>
        </div>

        {/* Expect Grid (6 Cards) */}
        <div className="about-expect-grid">
          <article className="about-expect-card">
            <h3>Keynote Talks</h3>
            <p>Distinguished speakers from the global open-source ecosystem presenting groundbreaking ideas and innovations.</p>
          </article>
          <article className="about-expect-card">
            <h3>Panel Discussions</h3>
            <p>In-depth conversations between industry leaders, developers, and community organizers on key open-source topics.</p>
          </article>
          <article className="about-expect-card">
            <h3>Workshops</h3>
            <p>Hands-on sessions covering tools, frameworks, and best practices for open-source contribution and development.</p>
          </article>
          <article className="about-expect-card">
            <h3>Hackathon</h3>
            <p>A competitive event where participants build solutions to real-world open-source challenges under time constraints.</p>
          </article>
          <article className="about-expect-card">
            <h3>Demos & Showcases</h3>
            <p>Live demonstrations of open-source projects, tools, and technologies by contributors and organizations.</p>
          </article>
          <article className="about-expect-card">
            <h3>Networking Sessions</h3>
            <p>Structured and informal networking opportunities including a dedicated networking dinner for attendees.</p>
          </article>
        </div>
      </section>

      {/* ─── SECTION 3: WHO ATTENDS OOSC ? ──────────────────────────────────────── */}
      <section className="about-audience-section" id="audience">
        {/* Page Line Decoration */}
        {/* <div className="about-page-header-line">
          <span className="page-number">04</span>
          <span className="header-line-divider"></span>
          <span className="header-line-label">Who Attends</span>
        </div> */}

        <div className="about-eyebrow" style={{ marginTop: '1.5rem' }}>Audience</div>
        <h2 className="about-section-title">Who Attends OOSC ?</h2>

        <p className="about-section-desc">
          OOSC 4.0 draws a diverse, multi-disciplinary audience from across India and beyond.
          Whether you're a developer, operations engineer, community leader, or academic researcher,
          OOSC is the place to connect, collaborate, and grow.
        </p>

        {/* Grid of 4 cards */}
        <div className="about-audience-grid">
          <article className="about-audience-card">
            <h3>Developers</h3>
            <p>Systems, Embedded, Applications, Kernel & Operating Systems developers from across the country contributing to open-source projects.</p>
          </article>
          <article className="about-audience-card">
            <h3>Operations</h3>
            <p>Architects, SRE, Site Reliability Engineers, DevOps practitioners, and SysAdmins managing and scaling open-source infrastructure.</p>
          </article>
          <article className="about-audience-card">
            <h3>Community and Leadership</h3>
            <p>Technical Managers, Community Managers, Executive Leaders, Legal & Compliance, Operations Management, and OSPO Teams.</p>
          </article>
          <article className="about-audience-card">
            <h3>Academics / Media / Other</h3>
            <p>Professors, Students, Media professionals, Analysts, Product managers, Business Development, and Marketing experts.</p>
          </article>
        </div>

        {/* Why Attend Subsection */}
        <div className="about-why-attend-container">
          <h3 className="about-sub-title">Why Attend</h3>
          <ul className="about-why-attend-list">
            <li>
              <span className="check-bullet">•</span>
              <p>Network with India's most active open-source community in one place.</p>
            </li>
            <li>
              <span className="check-bullet">•</span>
              <p>Learn from 100+ industry pioneers through talks, panels, and workshops.</p>
            </li>
            <li>
              <span className="check-bullet">•</span>
              <p>Contribute to and discover real-world open-source projects.</p>
            </li>
            <li>
              <span className="check-bullet">•</span>
              <p>Compete in hackathons and win recognition for your innovations.</p>
            </li>
            <li>
              <span className="check-bullet">•</span>
              <p>Access exclusive mentorship from Linux Foundation and Canonical experts.</p>
            </li>
          </ul>
        </div>
      </section>

      {/* ─── SECTION 1: HERO (HOST CITY & VENUE) ─────────────────────────────────── */}
      <section className="about-hero" id="host-city-venue">
        <div className="about-hero-content">
          {/* Eyebrow and Title */}
          <div className="about-eyebrow">Host City & Venue</div>
          <h2 className="about-hero-title">IIIT Allahabad, India</h2>

          {/* Description Grid */}
          <div className="about-hero-description-grid">
            <article className="about-description-col">
              <h3>India</h3>
              <p>
                A diverse and vibrant nation, blending rich cultural heritage with rapid technological growth.
                As a leading democracy and innovation hub, it bridges tradition and modernity across all aspects of life.
              </p>
            </article>
            <article className="about-description-col">
              <h3>Allahabad (Prayagraj)</h3>
              <p>
                Located in Uttar Pradesh, Allahabad is a key industrial and educational hub of North India,
                known for its historic significance and a unique blend of tradition and modernity.
              </p>
            </article>
            <article className="about-description-col">
              <h3>IIIT Allahabad</h3>
              <p>
                One of India's premier institutes for engineering, science, and innovation.
                Known for its academic excellence, cutting-edge research, and vibrant campus life,
                IIIT Allahabad fosters creativity, critical thinking, and leadership.
              </p>
            </article>
          </div>

          {/* Three side-by-side vertical images */}
          <div className="about-hero-image-grid">
            <div className="about-hero-img-wrapper">
              <img src="/about-country.png" alt="India" className="about-hero-img" loading="eager" />
            </div>
            <div className="about-hero-img-wrapper">
              <img src="/about-city.png" alt="Allahabad" className="about-hero-img" loading="eager" />
            </div>
            <div className="about-hero-img-wrapper">
              <img src="/about-college.png" alt="IIIT Allahabad" className="about-hero-img" loading="eager" />
            </div>
          </div>

          {/* Bottom dates & venue banner */}
          <div className="about-hero-banner-card">
            <div className="about-hero-banner-item">
              <span className="banner-item-label">Conference Dates</span>
              <span className="banner-item-value">August 28 - 30, 2026</span>
            </div>
            <div className="about-hero-banner-item">
              <span className="banner-item-label">Venue</span>
              <span className="banner-item-value">IIIT Allahabad, Prayagraj, UP, India</span>
            </div>
          </div>



        </div>
      </section>




      {/*
       ─── SECTION 5: PROVEN TRACK RECORD ──────────────────────────────────────── }
      <section className="about-track-record-section" id="track-record">
        {/* Page Line Decoration }
        {/*<div className="about-page-header-line">
          <span className="page-number">07</span>
          <span className="header-line-divider"></span>
          <span className="header-line-label">Our Legacy</span>
        </div>}

        <div className="about-eyebrow" style={{ marginTop: '1.5rem' }}>Our Legacy</div>
        <h2 className="about-section-title">Proven Track Record</h2>

        <p className="about-section-desc">
          IIIT Allahabad has consistently delivered impactful, large-scale student-led technical events
          that attract participants from across India. Entrusted with hosting OOSC 4.0 for the first time,
          IIITA is committed to an edition that sets new benchmarks.
        </p>

        {/* Two-column bullet lists }
        <div className="about-track-columns">
          <div className="about-track-col">
            <ul className="about-track-list">
              <li>
                <span className="bullet-dot">•</span>
                <p>Multiple successful editions of Aproksha, HITN, OpenCode, Code Red, CICADA, CTF, III, and OOC</p>
              </li>
              <li>
                <span className="bullet-dot">•</span>
                <p>130+ colleges engaged through flagship events</p>
              </li>
              <li>
                <span className="bullet-dot">•</span>
                <p>Pan-India reach across leading technical institutes</p>
              </li>
              <li>
                <span className="bullet-dot">•</span>
                <p>2,000+ open-source contributors through OpenCode program</p>
              </li>
            </ul>
          </div>
          <div className="about-track-col">
            <ul className="about-track-list">
              <li>
                <span className="bullet-dot">•</span>
                <p>10,000+ registrations across Aproksha</p>
              </li>
              <li>
                <span className="bullet-dot">•</span>
                <p>80+ institutions represented through HITN</p>
              </li>
              <li>
                <span className="bullet-dot">•</span>
                <p>Proven track record of delivering impactful student-led technical events</p>
              </li>
              <li>
                <span className="bullet-dot">•</span>
                <p>1,800+ cybersecurity competitors through the CTF competition</p>
              </li>
            </ul>
          </div>
        </div>

        {/* 4 side-by-side stats highlight cards }
        <div className="about-stats-grid">
          <article className="about-stat-card">
            <div className="stat-value">10,000+</div>
            <div className="stat-label">Registrations — Aproksha</div>
          </article>
          <article className="about-stat-card">
            <div className="stat-value">130+</div>
            <div className="stat-label">Colleges Engaged</div>
          </article>
          <article className="about-stat-card">
            <div className="stat-value">1,800+</div>
            <div className="stat-label">CTF Participants</div>
          </article>
          <article className="about-stat-card">
            <div className="stat-value">2,000+</div>
            <div className="stat-label">OpenCode Contributors</div>
          </article>
        </div>

        {/* Wide bottom banner card }
        <div className="about-track-banner-card">
          <p>
            Entrusted with hosting OOSC 4.0 for the first time, IIIT Allahabad is committed to delivering an
            edition that not only upholds the legacy established at IIT Mandi and IIT Kanpur but also sets
            new benchmarks for the future of OOSC. By partnering with OOSC 4.0, sponsors gain access to a
            highly engaged community of developers, designers, innovators, cybersecurity enthusiasts,
            and future technology leaders.
          </p>
        </div>
      </section>
    */}
      {/* ─── SECTION 6: KEYNOTE SPEAKERS & LEADERS ────────────────────────────────── */}
      <section className="about-speakers-section" id="keynote-speakers">
        <div className="about-eyebrow" style={{ marginTop: '1.5rem' }}>Past Highlights</div>
        <h2 className="about-section-title">Keynote Speakers & Leaders</h2>

        <p className="about-section-desc">
          OOSC has been privileged to host distinguished voices from the open-source ecosystem. The previous
          editions featured <strong>100+ keynote speakers and panelists</strong> who are pioneers in their
          domains—ranging from foundational software development to open governance, security, and
          cloud-native infrastructure.
        </p>

        {/* Speaker Cards Grid (2 cols × 3 rows) */}
        <div className="about-speakers-grid">
          <article className="about-speaker-card">
            <h4>Till Kamppeter</h4>
            <p>Leader Open Printing, Linux Foundation Fellow.</p>
          </article>
          <article className="about-speaker-card">
            <h4>Aveek Basu</h4>
            <p>Org Admin – The Linux Foundation GSoC projects, Zephyr Ambassador.</p>
          </article>
          <article className="about-speaker-card">
            <h4>Pierre Clisson</h4>
            <p>Creator of Timeflux.</p>
          </article>
          <article className="about-speaker-card">
            <h4>Oliver Völckers</h4>
            <p>Founder, BEST Berliner Sensortechnik GmbH.</p>
          </article>
          <article className="about-speaker-card">
            <h4>Manuel Haro</h4>
            <p>Professor at the Autonomous University of Zacatecas. Leader of the Open Source Innovation Labs Network.</p>
          </article>
          <article className="about-speaker-card">
            <h4>Jonas Remmert</h4>
            <p>Embedded Systems Engineer at PHYTEC Messtechnik GmbH.</p>
          </article>
        </div>

        {/* Speaker Photo Gallery */}
        <div className="about-speakers-photo-gallery">
          <div className="about-speakers-photo-wrapper">
            <img src="/Till-kampetter.png" alt="Till Kamppeter" className="about-speakers-photo" loading="lazy" />
          </div>
          <div className="about-speakers-photo-wrapper">
            <img src="/Pierre-clisson.png" alt="Pierre Clisson" className="about-speakers-photo" loading="lazy" />
          </div>
          <div className="about-speakers-photo-wrapper">
            <img src="/Aveek-Basu.png" alt="Aveek Basu" className="about-speakers-photo" loading="lazy" />
          </div>
        </div>
      </section>



    </div>
  )
}
