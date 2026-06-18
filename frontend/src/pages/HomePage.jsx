import React from 'react'
import { Helmet } from 'react-helmet-async'
import { Calendar, MapPin, Check, Mic, Settings, Zap, Handshake, Globe } from 'lucide-react'
import './HomePage.css'

import { useState, useEffect } from 'react'

function FlipDigit({ digit }) {
  const [current, setCurrent] = useState(digit);
  const [previous, setPrevious] = useState(digit);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    if (digit !== current) {
      setPrevious(current);
      setCurrent(digit);
      setIsFlipping(true);
    }
  }, [digit, current]);

  const handleAnimationEnd = () => {
    setIsFlipping(false);
    setPrevious(current);
  };

  return (
    <div className={`flip-digit-container ${isFlipping ? 'flipping' : ''}`}>
      {/* Static Top */}
      <div className="flip-card-static top-static">
        <span className="flip-digit-inner">{current}</span>
      </div>
      {/* Static Bottom */}
      <div className="flip-card-static bottom-static">
        <span className="flip-digit-inner">{previous}</span>
      </div>

      {/* Flipping Card Top */}
      <div className={`flip-card-animated top-flip ${isFlipping ? 'animate-top' : ''}`}>
        <span className="flip-digit-inner">{previous}</span>
      </div>

      {/* Flipping Card Bottom */}
      <div 
        className={`flip-card-animated bottom-flip ${isFlipping ? 'animate-bottom' : ''}`}
        onAnimationEnd={handleAnimationEnd}
      >
        <span className="flip-digit-inner">{current}</span>
      </div>
      
      {/* Divider line in the middle */}
      <div className="flip-divider"></div>
    </div>
  );
}

function CountdownTimer() {
  const targetDate = "2026-08-28T09:00:00+05:30"; // August 28, 2026 at 9:00 AM IST

  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { isOver: true };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (timeLeft.isOver) {
    return <div className="countdown-finished">🎉 The Conference has Started!</div>;
  }

  const units = [
    { value: timeLeft.days, label: 'Days' },
    { value: timeLeft.hours, label: 'Hours' },
    { value: timeLeft.minutes, label: 'Mins' },
    { value: timeLeft.seconds, label: 'Secs' },
  ];

  return (
    <div className="hero-countdown">
      <div className="countdown-header">Conference Starts In</div>
      <div className="countdown-grid">
        {units.map((unit, i) => (
          <React.Fragment key={unit.label}>
            {i > 0 && <div className="countdown-divider">:</div>}
            <div className="countdown-item">
              <span className="countdown-value">
                {String(unit.value).padStart(2, '0').split('').map((digit, idx) => (
                  <FlipDigit key={idx} digit={digit} />
                ))}
              </span>
              <span className="countdown-label">{unit.label}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
export default function HomePage({ hero, about, siteConfig, navigateTo }) {
  return (
    <>
      <Helmet>
        <title>OOSC 4.0 — Open Source Systems Conference | IIIT Allahabad</title>
        <meta name="description" content="OOSC 4.0 is a premier Open Source Systems Conference at IIIT Allahabad, Aug 28–30, 2026. Join workshops, expert talks, hackathons, and networking with the open-source community." />
        <link rel="canonical" href="https://oosc.iiita.ac.in/" />
        <meta property="og:title" content="OOSC 4.0 — Open Source Systems Conference | IIIT Allahabad" />
        <meta property="og:description" content="OOSC 4.0 is a premier Open Source Systems Conference at IIIT Allahabad, Aug 28–30, 2026. Join workshops, expert talks, hackathons, and networking with the open-source community." />
        <meta property="og:url" content="https://oosc.iiita.ac.in/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="OOSC 4.0 — Open Source Systems Conference | IIIT Allahabad" />
        <meta name="twitter:description" content="OOSC 4.0 is a premier Open Source Systems Conference at IIIT Allahabad, Aug 28–30, 2026. Join workshops, expert talks, hackathons, and networking." />
      </Helmet>
      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-glow-blob"></div>
        <div className="hero-content-outer">
          <div className="hero-copy">
            <div className="eyebrow-wrapper">
              {siteConfig.heroEyebrow ? (
                <span className="eyebrow-accent">{siteConfig.heroEyebrow}</span>
              ) : (
                <>
                  <span className="eyebrow-text">OPPORTUNITY </span>
                  <span className="eyebrow-accent">OPEN SOURCE</span>
                  <span className="eyebrow-text"> CONFERENCE</span>
                </>
              )}
            </div>
            <h1>{siteConfig.heroTitle || hero.title}</h1>
            <p className="hero-subtitle">{siteConfig.heroSubtitle || hero.subtitle}</p>
            <p className="hero-description">{hero.bannerText}</p>
            <CountdownTimer />
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
            <span className="meta-icon"><Calendar size={24} color="var(--color-brand-yellow)" /></span>
            <div>
              <h4>Conference Dates</h4>
              <p>{hero.dates}</p>
            </div>
          </div>
          <div className="transitional-info-card glass-card">
            <span className="meta-icon"><MapPin size={24} color="var(--color-brand-blue)" /></span>
            <div>
              <h4>Venue Hub</h4>
              <p>{hero.venue}</p>
            </div>
          </div>
          <div className="transitional-info-card glass-card">
            <h4>Why Join OOSC 4.0?</h4>
            <p>Connect with <strong>leading maintainers</strong>, explore <span className="text-highlight">high-throughput systems</span>, and participate in <strong>collaborative hackathons</strong> with academic guidance.</p>
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
              <span>{siteConfig.aboutEyebrow || 'OOSC Ecosystem'}</span>
              <h2>{siteConfig.aboutTitle || about.heading}</h2>
              <p className="about-desc">{siteConfig.aboutSubtitle || about.description}</p>
            </div>

            <div className="highlights-stack">
              {about.highlights.map((point, i) => (
                <div key={i} className="highlight-pill glass-card">
                  <span className="highlight-bullet"><Check size={16} color="var(--color-success)" /></span>
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
              <h3>50+</h3>
              <p>  Speakers &amp; Panelists</p>
            </div>
            <div className="stat-card-gradient">
              <h3>10+</h3>
              <p>Open Source Communities</p>
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
          <p className="subtitle">From research panels to <strong>coding sprints</strong>, explore the structural core of OOSC 4.0.</p>
        </div>
        <div className="event-overview-grid">
          <div className="overview-card glass-card">
            <span className="overview-icon"><Mic size={32} color="var(--color-brand-purple)" /></span>
            <h3>Research Talks</h3>
            <p>In-depth technical sessions on <strong>server design</strong>, kernel optimizations, and <strong>state-of-the-art databases</strong>.</p>
          </div>
          <div className="overview-card glass-card">
            <span className="overview-icon"><Settings size={32} color="var(--color-brand-slate)" /></span>
            <h3>Workshops</h3>
            <p>Interactive labs guiding developers through <strong>deployment orchestrations</strong>, <strong>API architectures</strong>, and systems diagnostics.</p>
          </div>
          <div className="overview-card glass-card">
            <span className="overview-icon"><Zap size={32} color="var(--color-brand-yellow)" /></span>
            <h3>Hackathons</h3>
            <p>A multi-hour <strong>competitive sprint</strong> solving high-priority systems issues with <span className="text-highlight">direct coordinator support</span>.</p>
          </div>
          <div className="overview-card glass-card">
            <span className="overview-icon"><Handshake size={32} color="var(--color-success)" /></span>
            <h3>Networking Hub</h3>
            <p>Build links between <strong>leading research faculties</strong>, <strong>open source contributors</strong>, and corporate engineering advocates.</p>
          </div>
          <div className="overview-card glass-card">
            <span className="overview-icon"><Globe size={32} color="var(--color-brand-blue)" /></span>
            <h3>Code Sprints</h3>
            <p>Directly push contributions to <strong>whitelisted repositories</strong> and explore <span className="text-highlight">open system governance protocols</span>.</p>
          </div>
        </div>
      </section>
    </>
  )
}
