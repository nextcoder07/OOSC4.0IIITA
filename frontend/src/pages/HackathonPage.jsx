import React from 'react'
import { Helmet } from 'react-helmet-async'
import * as LucideIcons from 'lucide-react'
import { Target, Users, Check, User, Globe, Trophy, Medal, Star, Lightbulb, Leaf, Palette, Zap, Bot, ClipboardList, Calendar, Rocket } from 'lucide-react'
import './HackathonPage.css'

const renderLucideIcon = (iconStr, fallbackIcon, size = 16) => {
  if (!iconStr) return fallbackIcon;
  const name = iconStr.trim();
  const Icon = LucideIcons[name];
  if (Icon) {
    return <Icon size={size} />;
  }
  return <span style={{ fontSize: `${size}px` }}>{iconStr}</span>;
}

export default function HackathonPage({ 
  siteConfig, navigateTo, adminMode, 
  hkTracks, setHkTracks, 
  hkEligibility, setHkEligibility, 
  hkTeamComp, setHkTeamComp, 
  hkPrizes, setHkPrizes, 
  hkSpecialPrizes, setHkSpecialPrizes, 
  hkRules, setHkRules, 
  hkTimeline, setHkTimeline, 
  hkSteps, setHkSteps, 
  openModal, editRecord, deleteRecord 
}) {
  const sortedTracks = [...(hkTracks || [])].sort((a, b) => a.sortOrder - b.sortOrder)
  const sortedEligibility = [...(hkEligibility || [])].sort((a, b) => a.sortOrder - b.sortOrder)
  const sortedTeamComp = [...(hkTeamComp || [])].sort((a, b) => a.sortOrder - b.sortOrder)
  const sortedPrizes = [...(hkPrizes || [])].sort((a, b) => a.sortOrder - b.sortOrder)
  const sortedSpecialPrizes = [...(hkSpecialPrizes || [])].sort((a, b) => a.sortOrder - b.sortOrder)
  const sortedRules = [...(hkRules || [])].sort((a, b) => a.sortOrder - b.sortOrder)
  const sortedTimeline = [...(hkTimeline || [])].sort((a, b) => a.sortOrder - b.sortOrder)
  const sortedSteps = [...(hkSteps || [])].sort((a, b) => a.sortOrder - b.sortOrder)
  return (
    <div className="hackathon-body" id="hackathon">
      <Helmet>
        <title>Hackathon — OOSC 4.0 | IIIT Allahabad</title>
        <meta name="description" content="Participate in the OOSC 4.0 Hackathon at IIIT Allahabad, Aug 28–30, 2026. Build the future of open-source systems, compete for ₹1,00,000+ in prizes, and showcase your projects." />
        <link rel="canonical" href="https://oosc.iiita.ac.in/hackathon" />
        <meta property="og:title" content="Hackathon — OOSC 4.0 | IIIT Allahabad" />
        <meta property="og:description" content="Participate in the OOSC 4.0 Hackathon. Build the future of open-source systems, compete for ₹1,00,000+ in prizes, and showcase your projects." />
        <meta property="og:url" content="https://oosc.iiita.ac.in/hackathon" />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content="Hackathon — OOSC 4.0 | IIIT Allahabad" />
        <meta name="twitter:description" content="Join the OOSC 4.0 Hackathon. Compete for ₹1,00,000+ in prizes at IIIT Allahabad." />
      </Helmet>

      {/* ── HERO BANNER ── */}
      {(siteConfig.hackathonHidden !== 'true' || adminMode) && (
        <div className="hackathon-hero">
        <div className="hackathon-hero-inner">
          <div className="hackathon-badge">
            <span className="badge-dot"></span>
            {siteConfig.hackathonBadge || 'OOSC 4.0 · Hackathon 2026'}
          </div>
          <h1>{siteConfig.hackathonTitle || 'Build the Future of Open Systems'}</h1>
          <p className="theme-label">Event Theme</p>
          <p className="theme-name">"{siteConfig.hackathonTheme || 'AI × Open Source: Powering Intelligent Infrastructure'}"</p>
          {siteConfig.hackathonHidden !== 'true' && (
            <div className="hackathon-stat-strip">
              <div className="hstat"><span className="hstat-value">{siteConfig.hackathonPrizePool || '₹1,00,000+'}</span><span className="hstat-label">Prize Pool</span></div>
              <div className="hstat"><span className="hstat-value">{siteConfig.hackathonDuration || '36 Hrs'}</span><span className="hstat-label">Duration</span></div>
              <div className="hstat"><span className="hstat-value">{siteConfig.hackathonTeamSize || '2–4'}</span><span className="hstat-label">Team Size</span></div>
              <div className="hstat"><span className="hstat-value">{siteConfig.hackathonDates || 'Aug 28–30'}</span><span className="hstat-label">Event Dates</span></div>
              <div className="hstat"><span className="hstat-value">{siteConfig.hackathonVenue || 'IIITA'}</span><span className="hstat-label">Venue</span></div>
            </div>
          )}
        </div>
      </div>
      )}

      {siteConfig.hackathonHidden === 'true' && adminMode && (
        <div className="admin-status-message error" style={{margin: '0 auto 2rem', maxWidth: '1000px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-error)'}}>
          🚨 <strong>Admin Notice:</strong> The Hackathon page content is currently HIDDEN from the public. Only admins can see the sections below.
        </div>
      )}

      {siteConfig.hackathonHidden === 'true' && !adminMode ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="hk-icon" style={{ marginBottom: '1rem' }}><Rocket size={48} color="var(--color-brand-blue)" /></div>
          <h2 style={{ fontSize: '2rem', color: 'var(--color-text)' }}>Hackathon Details Coming Soon</h2>
          <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)', maxWidth: '600px' }}>
            We are currently finalizing the details, problem statements, and rules for the upcoming OOSC 4.0 Hackathon. 
            Stay tuned!
          </p>
        </div>
      ) : (
        <>
          {/* ── PROBLEM STATEMENT + ELIGIBILITY ── */}
          <div className="hk-grid-2">
        <div className="hk-card">
          <div className="hk-card-title">
            <div className="hk-icon"><Target size={32} color="var(--color-accent)" /></div>
            <h3>Problem Statement</h3>
          </div>
          {siteConfig.hackathonProblemStatement ? (
            siteConfig.hackathonProblemStatement.split('\n').filter(p => p.trim()).map((para, i) => (
              <React.Fragment key={i}>
                <p className="problem-statement-text">{para}</p>
                <br />
              </React.Fragment>
            ))
          ) : (
            <>
              <p className="problem-statement-text">
                Modern infrastructure increasingly relies on intelligent, adaptive systems. Yet most open-source tooling remains static, rule-based, and poorly suited for dynamic workloads.
              </p>
              <br />
              <p className="problem-statement-text">Your challenge: design and prototype an AI-augmented open-source tool or platform across one of these tracks:</p>
              <br />
            </>
          )}
          <div className="rules-list mt-sm">
            {adminMode && <button type="button" className="btn btn-admin-mini" onClick={() => openModal('hackathon-tracks', 'create')}>+ Add Track</button>}
            {sortedTracks.length > 0 ? sortedTracks.map((t, i) => (
              <div key={t.id} className="rule-item" style={{ position: 'relative' }}>
                <span className="rule-num">{String.fromCharCode(65 + i)}</span>
                <p><strong>{t.title}:</strong> {t.description}</p>
                {adminMode && (
                  <div style={{ position: 'absolute', top: '0', right: '0', display: 'flex', gap: '8px' }}>
                    <button type="button" className="btn-icon" onClick={() => editRecord('hackathon-tracks', t)}>Edit</button>
                    <button type="button" className="btn-icon btn-delete" onClick={() => deleteRecord('hackathon-tracks', t.id, setHkTracks)}>Del</button>
                  </div>
                )}
              </div>
            )) : <p>No tracks added yet.</p>}
          </div>
          <p className="problem-statement-text mt-md">
            All solutions must be open-source, reproducible, and include a live demo or working prototype.
          </p>
        </div>

        <div className="hk-card">
          <div className="hk-card-title">
            <div className="hk-icon"><Users size={32} color="var(--color-brand-blue)" /></div>
            <h3>Who Can Participate</h3>
          </div>
          <p className="panel-subheading">Eligibility 
            {adminMode && <button style={{marginLeft:'10px'}} type="button" className="btn btn-admin-mini" onClick={() => openModal('hackathon-eligibility', 'create')}>+ Add</button>}
          </p>
          <div className="eligibility-list mb-md">
            {sortedEligibility.length > 0 ? sortedEligibility.map((item) => (
              <div key={item.id} className="eligibility-item" style={{ position: 'relative', paddingRight: '60px' }}>
                <span className="elig-check"><Check size={16} color="var(--color-success)" /></span>
                <p>{item.content}</p>
                {adminMode && (
                  <div style={{ position: 'absolute', top: '0', right: '0', display: 'flex', gap: '8px' }}>
                    <button type="button" className="btn-icon" onClick={() => editRecord('hackathon-eligibility', item)}>Edit</button>
                    <button type="button" className="btn-icon btn-delete" onClick={() => deleteRecord('hackathon-eligibility', item.id, setHkEligibility)}>Del</button>
                  </div>
                )}
              </div>
            )) : <p>No eligibility criteria added.</p>}
          </div>
          <p className="panel-subheading">Team Composition
            {adminMode && <button style={{marginLeft:'10px'}} type="button" className="btn btn-admin-mini" onClick={() => openModal('hackathon-team-comp', 'create')}>+ Add</button>}
          </p>
          <div className="pill-row">
            {sortedTeamComp.length > 0 ? sortedTeamComp.map((t) => (
              <div key={t.id} className="special-prize-pill" style={{position:'relative'}}>
                <span>{renderLucideIcon(t.icon, <Users size={16} />, 16)}</span> {t.label}
                {adminMode && <span style={{marginLeft:'8px', cursor:'pointer', color:'var(--color-accent)'}} onClick={()=>editRecord('hackathon-team-comp', t)}>✎</span>}
                {adminMode && <span style={{marginLeft:'8px', cursor:'pointer', color:'red'}} onClick={()=>deleteRecord('hackathon-team-comp', t.id, setHkTeamComp)}>×</span>}
              </div>
            )) : <p>No team rules added.</p>}
          </div>
        </div>
      </div>

      {/* ── PRIZES ── */}
      <div className="hk-card">
        <div className="hk-card-title">
          <div className="hk-icon"><Trophy size={32} color="var(--color-brand-yellow)" /></div>
          <h3>Prizes &amp; Rewards</h3>
          {adminMode && <button style={{marginLeft:'auto'}} type="button" className="btn btn-admin-mini" onClick={() => openModal('hackathon-prizes', 'create')}>+ Add Prize</button>}
        </div>
        <div className="prizes-grid">
          {sortedPrizes.length > 0 ? sortedPrizes.map((prize) => (
            <div key={prize.id} className={`prize-card ${prize.colorClass || 'gold'}`} style={{position:'relative'}}>
              {adminMode && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn-icon" onClick={() => editRecord('hackathon-prizes', prize)}>Edit</button>
                  <button type="button" className="btn-icon btn-delete" onClick={() => deleteRecord('hackathon-prizes', prize.id, setHkPrizes)}>Del</button>
                </div>
              )}
              <div className="prize-medal"><Medal size={32} /></div>
              <p className="prize-position">{prize.position}</p>
              <p className="prize-amount">{prize.amount}</p>
              <p className="prize-desc">{prize.description}</p>
            </div>
          )) : <p>No prizes added yet.</p>}
        </div>
        <p className="panel-subheading mt-section">Special Category Awards
          {adminMode && <button style={{marginLeft:'10px'}} type="button" className="btn btn-admin-mini" onClick={() => openModal('hackathon-special-prizes', 'create')}>+ Add</button>}
        </p>
        <div className="special-prizes">
          {sortedSpecialPrizes.length > 0 ? sortedSpecialPrizes.map((p) => (
            <div key={p.id} className="special-prize-pill" style={{position:'relative'}}>
              <span>{renderLucideIcon(p.icon, <Star size={16} />, 16)}</span> {p.label}
              {adminMode && <span style={{marginLeft:'8px', cursor:'pointer', color:'var(--color-accent)'}} onClick={()=>editRecord('hackathon-special-prizes', p)}>✎</span>}
              {adminMode && <span style={{marginLeft:'8px', cursor:'pointer', color:'red'}} onClick={()=>deleteRecord('hackathon-special-prizes', p.id, setHkSpecialPrizes)}>×</span>}
            </div>
          )) : <p>No special prizes added.</p>}
        </div>
      </div>

      {/* ── RULES + DATES ── */}
      <div className="hk-grid-2">
        <div className="hk-card">
          <div className="hk-card-title">
            <div className="hk-icon"><ClipboardList size={32} color="var(--color-brand-slate)" /></div>
            <h3>Rules &amp; Guidelines</h3>
            {adminMode && <button style={{marginLeft:'auto'}} type="button" className="btn btn-admin-mini" onClick={() => openModal('hackathon-rules', 'create')}>+ Add Rule</button>}
          </div>
          <div className="rules-list">
            {sortedRules.length > 0 ? sortedRules.map((rule, i) => (
              <div key={rule.id} className="rule-item" style={{position:'relative', paddingRight: '60px'}}>
                <span className="rule-num">{i + 1}</span>
                <p>{rule.content}</p>
                {adminMode && (
                  <div style={{ position: 'absolute', top: '0', right: '0', display: 'flex', gap: '8px' }}>
                    <button type="button" className="btn-icon" onClick={() => editRecord('hackathon-rules', rule)}>Edit</button>
                    <button type="button" className="btn-icon btn-delete" onClick={() => deleteRecord('hackathon-rules', rule.id, setHkRules)}>Del</button>
                  </div>
                )}
              </div>
            )) : <p>No rules added yet.</p>}
          </div>
        </div>

        <div className="hk-card">
          <div className="hk-card-title">
            <div className="hk-icon"><Calendar size={32} color="var(--color-brand-orange)" /></div>
            <h3>Important Dates</h3>
            {adminMode && <button style={{marginLeft:'auto'}} type="button" className="btn btn-admin-mini" onClick={() => openModal('hackathon-timeline', 'create')}>+ Add Date</button>}
          </div>
          <div className="dates-timeline">
            {sortedTimeline.length > 0 ? sortedTimeline.map((d) => (
              <div key={d.id} className="date-item" style={{position:'relative'}}>
                {adminMode && (
                  <div style={{ position: 'absolute', top: '0', right: '0', display: 'flex', gap: '8px' }}>
                    <button type="button" className="btn-icon" onClick={() => editRecord('hackathon-timeline', d)}>Edit</button>
                    <button type="button" className="btn-icon btn-delete" onClick={() => deleteRecord('hackathon-timeline', d.id, setHkTimeline)}>Del</button>
                  </div>
                )}
                <div className="date-dot-col">
                  <div className={`date-dot ${d.status}`}></div>
                </div>
                <div className="date-info">
                  <p className="date-label">{d.label}</p>
                  <p className="date-value">{d.value}</p>
                  <p className="date-desc">{d.description}</p>
                </div>
              </div>
            )) : <p>No timeline dates added yet.</p>}
          </div>
        </div>
      </div>

      {/* ── HOW TO REGISTER / SUBMIT ── */}
      <div className="hk-card">
        <div className="hk-card-title">
          <div className="hk-icon"><Rocket size={32} color="var(--color-brand-violet)" /></div>
          <h3>How to Register &amp; Submit</h3>
          {adminMode && <button style={{marginLeft:'auto'}} type="button" className="btn btn-admin-mini" onClick={() => openModal('hackathon-steps', 'create')}>+ Add Step</button>}
        </div>
        <div className="steps-list">
          {sortedSteps.length > 0 ? sortedSteps.map((step, i) => (
            <div key={step.id} className="step-item" style={{position:'relative', paddingRight: '60px'}}>
              <div className="step-num">{i + 1}</div>
              <div className="step-content">
                <h4>{step.title}</h4>
                <p>{step.description}</p>
              </div>
              {adminMode && (
                <div style={{ position: 'absolute', top: '0', right: '0', display: 'flex', gap: '8px' }}>
                  <button type="button" className="btn-icon" onClick={() => editRecord('hackathon-steps', step)}>Edit</button>
                  <button type="button" className="btn-icon btn-delete" onClick={() => deleteRecord('hackathon-steps', step.id, setHkSteps)}>Del</button>
                </div>
              )}
            </div>
          )) : <p>No registration steps added yet.</p>}
        </div>
      </div>

      {/* ── CTA STRIP ── */}
      {siteConfig.registrationFormUrl && (
        <div className="hackathon-cta-strip">
          <div>
            <h3>{siteConfig.hackathonCtaReady || 'Ready to Build?'}</h3>
            <p>{siteConfig.hackathonCtaDesc || 'Registration is open until August 10, 2026. Spots are limited — secure your team today.'}</p>
          </div>
          <div className="actions-row">
            <button type="button" className="btn btn-primary" onClick={() => window.open(siteConfig.registrationFormUrl, '_blank')}>
              Register Your Team
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigateTo('contact')}>
              Ask a Question
            </button>
          </div>
        </div>
      )}
      </>
      )}

    </div>
  )
}
