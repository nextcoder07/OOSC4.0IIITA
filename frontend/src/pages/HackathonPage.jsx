import React from 'react'
import './HackathonPage.css'

export default function HackathonPage({ siteConfig, navigateTo }) {
  return (
    <div className="hackathon-body" id="hackathon">

      {/* ── HERO BANNER ── */}
      <div className="hackathon-hero">
        <div className="hackathon-hero-inner">
          <div className="hackathon-badge">
            <span className="badge-dot"></span>
            {siteConfig.hackathonBadge || 'OOSC 4.0 · Hackathon 2025'}
          </div>
          <h1>{siteConfig.hackathonTitle || 'Build the Future of Open Systems'}</h1>
          <p className="theme-label">Event Theme</p>
          <p className="theme-name">"{siteConfig.hackathonTheme || 'AI × Open Source: Powering Intelligent Infrastructure'}"</p>
          <div className="hackathon-stat-strip">
            <div className="hstat"><span className="hstat-value">{siteConfig.hackathonPrizePool || '₹1,00,000+'}</span><span className="hstat-label">Prize Pool</span></div>
            <div className="hstat"><span className="hstat-value">{siteConfig.hackathonDuration || '36 Hrs'}</span><span className="hstat-label">Duration</span></div>
            <div className="hstat"><span className="hstat-value">{siteConfig.hackathonTeamSize || '2–4'}</span><span className="hstat-label">Team Size</span></div>
            <div className="hstat"><span className="hstat-value">{siteConfig.hackathonDates || 'Aug 28–30'}</span><span className="hstat-label">Event Dates</span></div>
            <div className="hstat"><span className="hstat-value">{siteConfig.hackathonVenue || 'IIITA'}</span><span className="hstat-label">Venue</span></div>
          </div>
        </div>
      </div>

      {/* ── PROBLEM STATEMENT + ELIGIBILITY ── */}
      <div className="hk-grid-2">
        <div className="hk-card">
          <div className="hk-card-title">
            <div className="hk-icon">🎯</div>
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
            {(siteConfig.hackathonTracks ? siteConfig.hackathonTracks.split('\n').filter(t => t.trim()).map(t => { const parts = t.split('||'); return { track: parts[0] || '', desc: parts[1] || '' } }) : [
              { track: 'Track A — Intelligent DevOps', desc: 'Build an AI-powered CI/CD pipeline optimizer or automated incident-response bot.' },
              { track: 'Track B — Smart Data Systems', desc: 'Create a self-tuning database engine or an ML-driven query planner for open-source databases.' },
              { track: 'Track C — Open AI Infra', desc: 'Develop an open-source inference runtime, model-serving framework, or federated-learning orchestrator.' },
            ]).map((t, i) => (
              <div key={i} className="rule-item">
                <span className="rule-num">{String.fromCharCode(65 + i)}</span>
                <p><strong>{t.track}:</strong> {t.desc}</p>
              </div>
            ))}
          </div>
          <p className="problem-statement-text mt-md">
            All solutions must be open-source, reproducible, and include a live demo or working prototype.
          </p>
        </div>

        <div className="hk-card">
          <div className="hk-card-title">
            <div className="hk-icon">👥</div>
            <h3>Who Can Participate</h3>
          </div>
          <p className="panel-subheading">Eligibility</p>
          <div className="eligibility-list mb-md">
            {(siteConfig.hackathonEligibility ? siteConfig.hackathonEligibility.split('\n').filter(i => i.trim()) : [
              'Undergraduate & postgraduate students from any recognised university in India.',
              'Research scholars and PhD students are welcome.',
              'Participants from IIIT Allahabad receive priority registration slots.',
              'International students enrolled in Indian universities are eligible.',
              'Alumni (graduated ≤ 2 years ago) may join as wild-card entries.',
              'Faculty members may mentor but cannot compete for prizes.',
            ]).map((item, i) => (
              <div key={i} className="eligibility-item">
                <span className="elig-check">✓</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
          <p className="panel-subheading">Team Composition</p>
          <div className="pill-row">
            {(siteConfig.hackathonTeamComposition ? siteConfig.hackathonTeamComposition.split('\n').filter(t => t.trim()).map(t => { const parts = t.split('||'); return { icon: parts[0] || '👥', label: parts[1] || '' } }) : [
              { icon: '👤', label: 'Min 2 members' },
              { icon: '👥', label: 'Max 4 members' },
              { icon: '🌐', label: 'Cross-institution teams OK' },
            ]).map((t, i) => (
              <div key={i} className="special-prize-pill"><span>{t.icon}</span> {t.label}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRIZES ── */}
      <div className="hk-card">
        <div className="hk-card-title">
          <div className="hk-icon">🏆</div>
          <h3>Prizes &amp; Rewards</h3>
        </div>
        <div className="prizes-grid">
          {(siteConfig.hackathonPrizes ? siteConfig.hackathonPrizes.split('\n').filter(p => p.trim()).map(p => { 
            const parts = p.split('||'); 
            return { medal: parts[0] || '🏆', position: parts[1] || '', amount: parts[2] || '', desc: parts[3] || '', class: parts[4] || 'gold' }; 
          }) : [
            { medal: '🥇', position: '1st Place', amount: '₹50,000', desc: 'Cash + trophies + fast-track internship interviews with Title Sponsors + OOSC Featured Project badge', class: 'gold' },
            { medal: '🥈', position: '2nd Place', amount: '₹30,000', desc: 'Cash + trophies + mentorship sessions with senior open-source engineers from partner companies', class: 'silver' },
            { medal: '🥉', position: '3rd Place', amount: '₹20,000', desc: 'Cash + trophies + exclusive swag kits and 6-month access to premium dev tooling subscriptions', class: 'bronze' },
          ]).map((prize, i) => (
            <div key={i} className={`prize-card ${prize.class}`}>
              <div className="prize-medal">{prize.medal}</div>
              <p className="prize-position">{prize.position}</p>
              <p className="prize-amount">{prize.amount}</p>
              <p className="prize-desc">{prize.desc}</p>
            </div>
          ))}
        </div>
        <p className="panel-subheading mt-section">Special Category Awards</p>
        <div className="special-prizes">
          {(siteConfig.hackathonSpecialPrizes ? siteConfig.hackathonSpecialPrizes.split('\n').filter(p => p.trim()).map(p => {
            const parts = p.split('||'); return { icon: parts[0] || '⭐', label: parts[1] || '' };
          }) : [
            { icon: '💡', label: 'Best Innovation — ₹10,000' },
            { icon: '🌱', label: 'Best Open-Source Impact — ₹10,000' },
            { icon: '🎨', label: 'Best UI/UX Design — ₹5,000' },
            { icon: '⚡', label: 'Best Rookie Team — ₹5,000' },
            { icon: '🤖', label: 'Best AI Integration — ₹5,000' },
          ]).map((p, i) => (
            <div key={i} className="special-prize-pill"><span>{p.icon}</span> {p.label}</div>
          ))}
        </div>
      </div>

      {/* ── RULES + DATES ── */}
      <div className="hk-grid-2">
        <div className="hk-card">
          <div className="hk-card-title">
            <div className="hk-icon">📋</div>
            <h3>Rules &amp; Guidelines</h3>
          </div>
          <div className="rules-list">
            {(siteConfig.hackathonRules ? siteConfig.hackathonRules.split('\n').filter(r => r.trim()) : [
              'All code must be written during the hackathon window (Aug 28, 9 AM — Aug 30, 9 PM). Public scaffolding templates are permitted.',
              'Projects must be open-sourced under an OSI-approved license (MIT, Apache-2.0, GPL-3.0, etc.) on a public GitHub repository.',
              'Teams must submit a working prototype, a 3-minute demo video, and a project README before the submission deadline.',
              'Plagiarism or use of undisclosed AI-generated code is grounds for immediate disqualification.',
              'Each participant may only be a member of one team. Switching teams after registration closes is not permitted.',
              "Judges' decisions on all prize allocations are final. Disputes must be raised within 2 hours of results announcement.",
              'Participants must adhere to the OOSC 4.0 Code of Conduct. Harassment will result in removal.',
              'Use of cloud APIs (OpenAI, Hugging Face, etc.) is permitted but must be disclosed in the project README.',
            ]).map((rule, i) => (
              <div key={i} className="rule-item">
                <span className="rule-num">{i + 1}</span>
                <p>{rule}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="hk-card">
          <div className="hk-card-title">
            <div className="hk-icon">📅</div>
            <h3>Important Dates</h3>
          </div>
          <div className="dates-timeline">
            {(siteConfig.hackathonTimeline ? siteConfig.hackathonTimeline.split('\n').filter(d => d.trim()).map(d => {
              const parts = d.split('||'); return { label: parts[0] || '', value: parts[1] || '', desc: parts[2] || '', status: parts[3] || '' };
            }) : [
              { label: 'Registration Opens',        value: 'July 15, 2025',              desc: 'Team registration portal goes live at 12:00 PM IST.', status: 'past' },
              { label: 'Registration Deadline',     value: 'August 10, 2025',            desc: 'Last date to register. No late entries accepted.',     status: 'active' },
              { label: 'Problem Statement Release', value: 'August 20, 2025',            desc: 'All tracks and detailed briefs shared with registered teams.', status: '' },
              { label: 'Hackathon Kick-off',        value: 'August 28 — 9:00 AM',        desc: 'Opening ceremony, check-in, and hacking begins.',      status: '' },
              { label: 'Submission Deadline',       value: 'August 30 — 9:00 PM',        desc: 'GitHub link + demo video submitted via DevPost.',       status: '' },
              { label: 'Judging & Presentations',   value: 'August 30 — 10:00 PM',       desc: 'Top 10 teams present live to the jury (5 min each).',   status: '' },
              { label: 'Results & Prize Ceremony',  value: 'August 30 — 11:30 PM',       desc: 'Winners announced at the closing gala.',                status: '' },
            ]).map((d, i) => (
              <div key={i} className="date-item">
                <div className="date-dot-col">
                  <div className={`date-dot ${d.status}`}></div>
                </div>
                <div className="date-info">
                  <p className="date-label">{d.label}</p>
                  <p className="date-value">{d.value}</p>
                  <p className="date-desc">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW TO REGISTER / SUBMIT ── */}
      <div className="hk-card">
        <div className="hk-card-title">
          <div className="hk-icon">🚀</div>
          <h3>How to Register &amp; Submit</h3>
        </div>
        <div className="steps-list">
          {(siteConfig.hackathonSteps ? siteConfig.hackathonSteps.split('\n').filter(s => s.trim()).map(s => {
            const parts = s.split('||'); return { title: parts[0] || '', desc: parts[1] || '' };
          }) : [
            { title: 'Form Your Team',           desc: 'Assemble 2–4 members. Designate one Team Lead who will manage registration and submissions.' },
            { title: 'Register on the Portal',   desc: 'Click "Register Now" and complete the team form. All members must provide a valid institutional email.' },
            { title: 'Confirm on DevPost',       desc: "You'll receive a DevPost project invite after approval. Join using the same email — this is your submission platform." },
            { title: 'Attend Kick-off (Aug 28)', desc: 'Report to CC-3, IIITA by 8:30 AM. Carry valid student ID. Remote participation is available for outstation teams.' },
            { title: 'Build & Commit',           desc: 'Work in your public GitHub repository. Ensure it is public and licensed before the deadline.' },
            { title: 'Record Your Demo Video',   desc: 'Create a ≤ 3-minute screen-recorded demo. Upload to YouTube (unlisted) or Google Drive and save the link.' },
            { title: 'Submit on DevPost',        desc: 'Before Aug 30, 9:00 PM IST — submit your GitHub repo, demo video URL, and project description on DevPost.' },
            { title: 'Present to the Jury',      desc: 'If shortlisted in the top 10, your Team Lead will be contacted for a 5-minute live presentation slot.' },
          ]).map((step, i) => (
            <div key={i} className="step-item">
              <div className="step-num">{i + 1}</div>
              <div className="step-content">
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA STRIP ── */}
      <div className="hackathon-cta-strip">
        <div>
          <h3>{siteConfig.hackathonCtaReady || 'Ready to Build?'}</h3>
          <p>{siteConfig.hackathonCtaDesc || 'Registration is open until August 10, 2025. Spots are limited — secure your team today.'}</p>
        </div>
        <div className="actions-row">
          <button type="button" className="btn btn-primary" onClick={() => navigateTo('register')}>
            Register Your Team
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigateTo('contact')}>
            Ask a Question
          </button>
        </div>
      </div>

    </div>
  )
}
