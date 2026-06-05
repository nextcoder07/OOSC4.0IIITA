import { useCallback, useEffect, useMemo, useState } from 'react'
import Footer from './components/Footer.jsx'
import ImageUploader from './components/ImageUploader.jsx'
import Registration from './components/Registration.jsx'
import {
  aboutData,
  heroData,
  scheduleData,
  speakersData,
  sponsorsData,
  teamData,
} from './data.js'
import './App.css'

function App() {
  const [adminMode, setAdminMode] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  
  // Auth Inputs
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [verificationEmail, setVerificationEmail] = useState('')
  const [verificationPassword, setVerificationPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [verificationToken, setVerificationToken] = useState('')
  
  const [adminMessage, setAdminMessage] = useState('')
  const [uploadUrl, setUploadUrl] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalResource, setModalResource] = useState('')
  const [modalMode, setModalMode] = useState('create')
  const [modalData, setModalData] = useState({})
  const [modalError, setModalError] = useState('')

  const [hero] = useState(heroData)
  const [about] = useState(aboutData)
  const [speakers, setSpeakers] = useState(speakersData)
  const [sponsors, setSponsors] = useState(sponsorsData)
  const [schedule, setSchedule] = useState(scheduleData)
  const [team, setTeam] = useState(teamData)
  const [currentPage, setCurrentPage] = useState('home')
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [formStatus, setFormStatus] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Admin view toggle: 'login' | 'request_verification' | 'set_password'
  const [adminView, setAdminView] = useState('login')
  
  // Schedule page active day tab
  const [activeDay, setActiveDay] = useState('Aug 28')

  const pageRoutes = useMemo(() => [
    { key: 'home', label: 'Home' },
    { key: 'hackathon', label: 'Hackathon' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'speakers', label: 'Speakers' },
    { key: 'sponsors', label: 'Sponsors' },
    { key: 'team', label: 'Team' },
    { key: 'register', label: 'Register' },
    { key: 'contact', label: 'Contact' },
  ], [])

  const getPageFromHash = useCallback(() => {
    const hash = window.location.hash.replace('#', '')
    return hash === 'admin' || pageRoutes.some((route) => route.key === hash) ? hash : 'home'
  }, [pageRoutes])

  const navigateTo = (pageKey) => {
    if (pageKey === 'admin' || pageRoutes.some((route) => route.key === pageKey)) {
      window.location.hash = pageKey
      setCurrentPage(pageKey)
      setMobileMenuOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Fetch CSRF token on mount
  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const response = await fetch('/api/csrf-token')
        const data = await response.json()
        if (data && data.csrfToken) {
          setCsrfToken(data.csrfToken)
        }
      } catch (error) {
        console.warn('Could not load CSRF token. State modifications might fail.', error.message)
      }
    }
    fetchCsrf()
  }, [])

  // Detect verification/reset token in URL
  useEffect(() => {
    const checkUrlToken = () => {
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get('token')
      const path = window.location.pathname
      
      if (token && (path.includes('/admin/verify') || path.includes('/admin/reset'))) {
        setVerificationToken(token)
        setAdminView('set_password')
        setCurrentPage('admin')
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash)
      }
    }
    checkUrlToken()
  }, [currentPage])

  // Handle back/forward buttons and hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getPageFromHash())
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [getPageFromHash])

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await fetch('/admin/me', { credentials: 'include' })
        if (!response.ok) return
        const data = await response.json()
        setAdminMode(true)
        setAdminEmail(data.email)
      } catch {
        setAdminMode(false)
        setAdminEmail('')
      }
    }

    restoreSession()
  }, [])

  // Handle email verification token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    
    if (token && !adminMode) {
      const verifyEmail = async () => {
        try {
          setAdminMessage('Verifying your email...')
          const response = await fetch(`/admin/verify?token=${token}`, {
            credentials: 'include',
          })
          const data = await response.json()
          
          if (!response.ok) {
            setAdminMessage(`Verification failed: ${data.error}`)
            setAdminView('login')
            return
          }
          
          setAdminMessage(data.message || 'Email verified! You can now login with your email and password.')
          setAdminView('login')
          // Clear token from URL
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (error) {
          setAdminMessage('Verification error: ' + error.message)
          setAdminView('login')
        }
      }
      verifyEmail()
    }
  }, [])

  // Sponsor Tiers specified: Title, Platinum, Gold, Silver, Community Partner, Media Partner
  const sponsorCategories = useMemo(
    () => [
      'Title Sponsor',
      'Platinum Sponsor',
      'Gold Sponsor',
      'Silver Sponsor',
      'Community Partner',
      'Media Partner',
    ],
    [],
  )

  const sortedSponsors = useMemo(() => {
    return sponsorCategories.map((category) => ({
      category,
      sponsors: sponsors
        .filter((item) => item.category === category)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }))
  }, [sponsors, sponsorCategories])

  // Group team members dynamically by roles
  const categorizedTeam = useMemo(() => {
    const groups = {
      'Core Team': [],
      'Faculty Coordinators': [],
      'Student Coordinators': [],
      'Technical Team': [],
      'Design Team': [],
      'Hospitality & Logistics Team': [],
    }

    team.forEach((member) => {
      const role = member.role ? member.role.toLowerCase() : ''
      const name = member.name ? member.name.toLowerCase() : ''
      
      if (
        role.includes('faculty') || 
        role.includes('professor') || 
        name.startsWith('dr.') || 
        name.startsWith('prof.')
      ) {
        groups['Faculty Coordinators'].push(member)
      } else if (
        role.includes('tech') || 
        role.includes('developer') || 
        role.includes('web') || 
        role.includes('system')
      ) {
        groups['Technical Team'].push(member)
      } else if (
        role.includes('design') || 
        role.includes('creative') || 
        role.includes('art') || 
        role.includes('ui')
      ) {
        groups['Design Team'].push(member)
      } else if (
        role.includes('hospitality') || 
        role.includes('logistics') || 
        role.includes('venue') || 
        role.includes('catering') ||
        role.includes('sponsor')
      ) {
        groups['Hospitality & Logistics Team'].push(member)
      } else if (
        role.includes('chair') || 
        role.includes('lead') || 
        role.includes('head') || 
        role.includes('core')
      ) {
        groups['Core Team'].push(member)
      } else {
        groups['Student Coordinators'].push(member)
      }
    })

    return groups
  }, [team])

  const apiFetch = useCallback(async (path, options = {}) => {
    const headers = { ...(options.headers || {}) }
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }

    const response = await fetch(path, {
      ...options,
      credentials: 'include',
      headers,
    })

    const data = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(data?.error || response.statusText || 'Request failed')
    }
    return data
  }, [csrfToken])

  const updateResourceState = (resource, updater) => {
    if (resource === 'events') {
      setSchedule((prev) => updater(prev))
      return
    }
    const setter = {
      speakers: setSpeakers,
      sponsors: setSponsors,
      team: setTeam,
    }[resource]
    if (setter) setter((prev) => updater(prev))
  }

  const modalFieldMap = {
    speakers: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'title', label: 'Title / Affiliation', type: 'text' },
      { key: 'bio', label: 'Biography', type: 'textarea' },
      { key: 'photoURL', label: 'Photo URL / Upload Link', type: 'text' },
      { key: 'sortOrder', label: 'Sort Order', type: 'number' },
    ],
    sponsors: [
      { key: 'name', label: 'Sponsor Name', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'website', label: 'Website URL', type: 'text' },
      { key: 'logoURL', label: 'Logo URL / Upload Link', type: 'text' },
      { key: 'sortOrder', label: 'Sort Order', type: 'number' },
    ],
    events: [
      { key: 'title', label: 'Session Title', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'date', label: 'Date', type: 'text' },
      { key: 'time', label: 'Time', type: 'text' },
      { key: 'type', label: 'Type', type: 'text' },
      { key: 'sortOrder', label: 'Sort Order', type: 'number' },
    ],
    team: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'role', label: 'Role', type: 'text' },
      { key: 'contact', label: 'Contact Email / Phone', type: 'text' },
      { key: 'photoURL', label: 'Photo URL / Upload Link', type: 'text' },
      { key: 'sortOrder', label: 'Sort Order', type: 'number' },
    ],
  }

  const resourceLabels = {
    speakers: 'Speaker',
    sponsors: 'Sponsor',
    events: 'Schedule Slot',
    team: 'Team Member',
  }

  const getDefaultModalData = (resource) => {
    const defaults = {
      speakers: { name: '', title: '', bio: '', photoURL: uploadUrl || '', sortOrder: speakers.length + 1, published: true },
      sponsors: { name: '', category: '', website: '', logoURL: uploadUrl || '', sortOrder: sponsors.length + 1, published: true },
      events: { title: '', description: '', date: 'Aug 28', time: '10:00 AM', type: 'Talk', sortOrder: schedule.length + 1, published: true },
      team: { name: '', role: '', contact: '', photoURL: uploadUrl || '', sortOrder: team.length + 1, published: true },
    }
    return defaults[resource] || {}
  }

  const openModal = (resource, mode = 'create', item = {}) => {
    setModalResource(resource)
    setModalMode(mode)
    setModalData(mode === 'create' ? getDefaultModalData(resource) : item)
    setModalError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalResource('')
    setModalMode('create')
    setModalData({})
    setModalError('')
  }

  const setModalField = (field, value) => {
    setModalData((prev) => ({ ...prev, [field]: value }))
  }

  const setModalImage = (url) => {
    const imageField = modalResource === 'sponsors' ? 'logoURL' : 'photoURL'
    setModalField(imageField, url)
  }

  const saveModalRecord = async () => {
    if (!adminMode) {
      setAdminMessage('Log in as admin to save changes.')
      return
    }

    try {
      const payload = { ...modalData }
      if (payload.sortOrder !== undefined) {
        payload.sortOrder = Number(payload.sortOrder || 0)
      }

      const endpoint = modalMode === 'create' ? `/api/${modalResource}` : `/api/${modalResource}/${payload.id}`
      const method = modalMode === 'create' ? 'POST' : 'PUT'
      const record = await apiFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (modalMode === 'create') {
        updateResourceState(modalResource, (current) => [...current, record])
      } else {
        updateResourceState(modalResource, (current) => current.map((item) => (item.id === record.id ? record : item)))
      }

      closeModal()
      setAdminMessage(`Saved ${modalResource.slice(0, -1)} successfully.`)
    } catch (error) {
      setModalError(error.message || 'Unable to save record.')
    }
  }

  const editRecord = (resource, item) => {
    openModal(resource, 'edit', item)
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [speakerRes, sponsorRes, eventRes, teamRes] =
          await Promise.all([
            apiFetch('/api/speakers'),
            apiFetch('/api/sponsors'),
            apiFetch('/api/events'),
            apiFetch('/api/team'),
          ])

        setSpeakers(speakerRes)
        setSponsors(sponsorRes)
        setSchedule(eventRes)
        setTeam(teamRes)
      } catch (error) {
        console.warn('Backend fetch failed, using local sample data.', error.message)
      }
    }
    loadData()
  }, [adminMode, apiFetch])

  const deleteRecord = async (resource, id, setter) => {

    if (!adminMode) {
      setAdminMessage('Log in as admin to delete items.')
      return
    }

    try {
      await apiFetch(`/api/${resource}/${id}`, { method: 'DELETE' })
      setter((current) => current.filter((item) => item.id !== id))
    } catch (error) {
      setAdminMessage(error.message)
    }
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setFormStatus('Please complete all fields before submitting.')
      return
    }

    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setFormStatus('Message sent! We will respond shortly.')
      setForm({ name: '', email: '', message: '' })
    } catch (error) {
      setFormStatus(error.message)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      setAdminMessage('Please complete all input fields.')
      return
    }
    try {
      setAdminMessage('Signing in...')
      const data = await apiFetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      setAdminEmail(data.email || loginEmail)
      setAdminMessage('Admin logged in successfully.')
      setAdminMode(true)
      setLoginEmail('')
      setLoginPassword('')
      navigateTo('home')
    } catch (error) {
      setAdminMessage(error.message || 'Login failed.')
    }
  }

  const handleRequestVerification = async (e) => {
    e.preventDefault()
    if (!verificationEmail.trim()) {
      setAdminMessage('Please provide a whitelisted IIITA email.')
      return
    }
    if (!verificationPassword.trim()) {
      setAdminMessage('Please create a password.')
      return
    }
    // Min 8 chars, uppercase, lowercase, number, special char
    const hasMinLength = verificationPassword.length >= 8
    const hasUpper = /[A-Z]/.test(verificationPassword)
    const hasLower = /[a-z]/.test(verificationPassword)
    const hasNumber = /[0-9]/.test(verificationPassword)
    const hasSpecial = /[^A-Za-z0-9]/.test(verificationPassword)
    
    if (!hasMinLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      setAdminMessage('Password must have: 8+ chars, uppercase, lowercase, number, special char (!@#$%^&*)')
      return
    }

    try {
      setAdminMessage('Setting up your account...')
      const data = await apiFetch('/admin/request-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: verificationEmail,
          password: verificationPassword 
        }),
      })
      setAdminMessage(data.message || 'Verification email sent! Check your inbox and click the confirmation link.')
      setVerificationEmail('')
      setVerificationPassword('')
    } catch (error) {
      setAdminMessage(error.message || 'Setup failed. Please try again.')
    }
  }

  const validatePasswordLocal = (password) => {
    return password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
  }

  const handleSetPassword = async (e) => {
    e.preventDefault()
    if (!newPassword) {
      setAdminMessage('Please provide a password.')
      return
    }
    if (!validatePasswordLocal(newPassword)) {
      setAdminMessage('Password does not satisfy the security guidelines below.')
      return
    }

    try {
      setAdminMessage('Saving credentials...')
      let data
      try {
        data = await apiFetch('/admin/verify-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: verificationToken, password: newPassword }),
        })
      } catch {
        // Fallback to reset route if token was password reset request
        data = await apiFetch('/admin/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: verificationToken, password: newPassword }),
        })
      }

      setAdminEmail(data.email)
      setAdminMode(true)
      setAdminMessage('Password successfully saved. Admin access granted!')
      setNewPassword('')
      setVerificationToken('')
      setAdminView('login')
      navigateTo('home')
    } catch (error) {
      setAdminMessage(error.message || 'Setting password failed.')
    }
  }

  const logout = async () => {
    try {
      await apiFetch('/admin/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.warn('Logout failed', error)
    }
    setAdminEmail('')
    setAdminMode(false)
    setAdminMessage('Logged out.')
  }

  const getEventTime = (item) => item.dateTime || `${item.date} · ${item.time}`
  const getEventDesc = (item) => item.details || item.description

  const filteredSchedule = useMemo(() => {
    return schedule.filter((item) => {
      const dayStr = item.date || item.dateTime || ''
      return dayStr.includes(activeDay)
    }).sort((a, b) => a.sortOrder - b.sortOrder)
  }, [schedule, activeDay])

  const renderPage = () => {
    if (currentPage === 'admin') {
      return (
        <section className="content-section admin-login-section" id="admin-login">
          <div className="section-heading text-center">
            <span>Admin Gateway</span>
            <h2>OOSC 4.0 Dashboard Access</h2>
            <p className="subtitle">Whitelist authentication system for authorized university organizers.</p>
          </div>
          
          <div className="login-panel-container">
            {adminView === 'login' && (
              <form className="login-panel glass-card" onSubmit={handleLogin}>
                <div className="form-group">
                  <label htmlFor="admin-email-field">Whitelisted Email</label>
                  <input
                    id="admin-email-field"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    placeholder="name@iiita.ac.in"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="admin-pw-field">Password</label>
                  <input
                    id="admin-pw-field"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    placeholder="••••••••••••"
                    className="form-control"
                  />
                </div>
                <div className="login-actions">
                  <button type="submit" className="btn btn-primary">
                    Sign In to Dashboard
                  </button>
                  <button
                    type="button"
                    className="btn-text-link"
                    onClick={() => {
                      setAdminView('request_verification')
                      setAdminMessage('')
                    }}
                  >
                    First time? Request Verification Email
                  </button>
                </div>
                {adminMessage && <p className="admin-status-message error">{adminMessage}</p>}
                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0,229,255,0.05)', borderRadius: '8px', borderLeft: '3px solid var(--color-cyan)', fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                  <strong style={{ color: 'var(--color-cyan)' }}>First time setup:</strong> Click "Request Verification Email" above to start. You'll set a password, then login here.
                </div>
              </form>
            )}

            {adminView === 'request_verification' && (
              <form className="login-panel glass-card" onSubmit={handleRequestVerification}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem' }}>Admin Account Setup</h3>
                <div className="form-group">
                  <label htmlFor="verify-email-field">Whitelisted Email</label>
                  <p className="field-tip">Enter your IIITA email from the whitelist.</p>
                  <input
                    id="verify-email-field"
                    type="email"
                    required
                    value={verificationEmail}
                    onChange={(event) => setVerificationEmail(event.target.value)}
                    placeholder="authorized-email@iiita.ac.in"
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="verify-password-field">Create Password</label>
                  <p className="field-tip">Choose a strong password to secure your account.</p>
                  <input
                    id="verify-password-field"
                    type="password"
                    required
                    value={verificationPassword}
                    onChange={(event) => setVerificationPassword(event.target.value)}
                    placeholder="Create a strong password"
                    className="form-control"
                  />
                </div>
                
                <div className="password-rules-box">
                  <h5>Password Requirements</h5>
                  <ul>
                    <li className={verificationPassword.length >= 8 ? 'met' : ''}>✓ Minimum 8 characters</li>
                    <li className={/[A-Z]/.test(verificationPassword) ? 'met' : ''}>✓ At least one UPPERCASE letter</li>
                    <li className={/[a-z]/.test(verificationPassword) ? 'met' : ''}>✓ At least one lowercase letter</li>
                    <li className={/[0-9]/.test(verificationPassword) ? 'met' : ''}>✓ At least one number (0-9)</li>
                    <li className={/[^A-Za-z0-9]/.test(verificationPassword) ? 'met' : ''}>✓ At least one special character (!@#$%^&*)</li>
                  </ul>
                </div>

                <div className="login-actions">
                  <button type="submit" className="btn btn-primary">
                    Send Verification Email
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setAdminView('login')
                      setAdminMessage('')
                    }}
                  >
                    Back to Sign In
                  </button>
                </div>
                {adminMessage && <p className="admin-status-message info">{adminMessage}</p>}
              </form>
            )}

            {adminView === 'set_password' && (
              <form className="login-panel glass-card" onSubmit={handleSetPassword}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem' }}>Set Your Admin Password</h3>
                <p className="field-tip" style={{ marginBottom: '20px' }}>Create a strong password for your admin account. After this, you'll be logged in and can access the dashboard.</p>
                <div className="form-group">
                  <label htmlFor="new-pw-field">Create Admin Password</label>
                  <input
                    id="new-pw-field"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Choose a strong password"
                    className="form-control"
                  />
                </div>
                
                <div className="password-rules-box">
                  <h5>Password Requirements</h5>
                  <ul>
                    <li className={newPassword.length >= 12 ? 'met' : ''}>✓ Minimum 12 characters</li>
                    <li className={/[A-Z]/.test(newPassword) ? 'met' : ''}>✓ At least one UPPERCASE letter</li>
                    <li className={/[a-z]/.test(newPassword) ? 'met' : ''}>✓ At least one lowercase letter</li>
                    <li className={/[0-9]/.test(newPassword) ? 'met' : ''}>✓ At least one number (0-9)</li>
                    <li className={/[^A-Za-z0-9]/.test(newPassword) ? 'met' : ''}>✓ At least one special character (!@#$%^&*)</li>
                  </ul>
                </div>

                <div className="login-actions">
                  <button type="submit" className="btn btn-primary">
                    Confirm &amp; Activate Account
                  </button>
                </div>
                {adminMessage && <p className="admin-status-message info">{adminMessage}</p>}
              </form>
            )}
          </div>
        </section>
      )
    }

    switch (currentPage) {
      case 'schedule':
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
                <div className="timeline-list">
                  {filteredSchedule.map((item) => (
                    <article key={item.id} className="timeline-card glass-card">
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
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )

      case 'speakers':
        return (
          <section className="content-section speakers-section" id="speakers">
            <div className="section-heading split">
              <div>
                <span>Experts</span>
                <h2>Thought Leadership</h2>
                <p>Featured technology leaders, academics, and research engineers guiding our tracks.</p>
              </div>
              {adminMode && (
                <button type="button" className="btn btn-admin-add" onClick={() => openModal('speakers', 'create')}>
                  + Add Speaker
                </button>
              )}
            </div>

            <div className="card-grid speaker-grid">
              {speakers.map((speaker) => (
                <article key={speaker.id} className="card speaker-card glass-card">
                  <div className="image-wrapper">
                    <img src={speaker.photoURL} alt={speaker.name} loading="lazy" />
                  </div>
                  <div className="card-content">
                    <h3>{speaker.name}</h3>
                    <p className="card-subtitle">{speaker.title}</p>
                    <p className="card-description">{speaker.bio}</p>
                    <div className="social-links">
                      <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="LinkedIn">
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      </a>
                      <a href="https://github.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="GitHub">
                        <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      </a>
                    </div>
                  </div>
                  {adminMode && (
                    <div className="admin-card-controls admin-card-actions">
                      <button
                        type="button"
                        className="btn btn-admin-mini"
                        onClick={() => editRecord('speakers', speaker)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={() => deleteRecord('speakers', speaker.id, setSpeakers)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )

      case 'sponsors':
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
                    <div className="sponsor-logo-grid">
                      {group.map((sponsor) => (
                        <div key={sponsor.id} className="sponsor-card-outer">
                          <a href={sponsor.website} target="_blank" rel="noreferrer" className="sponsor-card glass-card">
                            <div className="logo-container">
                              <img src={sponsor.logoURL} alt={sponsor.name} loading="lazy" />
                            </div>
                            <span className="sponsor-name">{sponsor.name}</span>
                          </a>
                          {adminMode && (
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
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )

      case 'team':
        return (
          <section className="content-section" id="team">
            <div className="section-heading split">
              <div>
                <span>Steering Committee</span>
                <h2>The Organizing Team</h2>
                <p>Meet the faculty directors and student committees hosting OOSC 4.0 at IIIT Allahabad.</p>
              </div>
              {adminMode && (
                <button type="button" className="btn btn-admin-add" onClick={() => openModal('team', 'create')}>
                  + Add Team Member
                </button>
              )}
            </div>

            <div className="team-categories-container">
              {Object.entries(categorizedTeam).map(([categoryName, members]) => {
                if (members.length === 0 && !adminMode) return null
                return (
                  <div key={categoryName} className="team-category-section">
                    <h3 className="team-category-title">{categoryName}</h3>
                    <div className="card-grid team-grid">
                      {members.map((member) => (
                        <article key={member.id} className="card team-card glass-card">
                          <div className="image-wrapper team-avatar">
                            <img src={member.photoURL} alt={member.name} loading="lazy" />
                          </div>
                          <div className="card-content">
                            <h3>{member.name}</h3>
                            <p className="card-subtitle">{member.role}</p>
                            <p className="contact-info-text">{member.contact}</p>
                            <div className="social-links">
                              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon" aria-label="LinkedIn">
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                              </a>
                            </div>
                          </div>
                          {adminMode && (
                            <div className="admin-card-controls">
                              <button
                                type="button"
                                className="btn btn-admin-mini"
                                onClick={() => editRecord('team', member)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn-delete"
                                onClick={() => deleteRecord('team', member.id, setTeam)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )

      case 'hackathon':
        return (
          <div className="hackathon-body" id="hackathon">

            {/* ── HERO BANNER ── */}
            <div className="hackathon-hero">
              <div className="hackathon-hero-inner">
                <div className="hackathon-badge">
                  <span className="badge-dot"></span>
                  OOSC 4.0 · Hackathon 2025
                </div>
                <h1>Build the Future of Open Systems</h1>
                <p className="theme-label">Event Theme</p>
                <p className="theme-name">"AI × Open Source: Powering Intelligent Infrastructure"</p>
                <div className="hackathon-stat-strip">
                  <div className="hstat"><span className="hstat-value">₹1,00,000+</span><span className="hstat-label">Prize Pool</span></div>
                  <div className="hstat"><span className="hstat-value">36 Hrs</span><span className="hstat-label">Duration</span></div>
                  <div className="hstat"><span className="hstat-value">2–4</span><span className="hstat-label">Team Size</span></div>
                  <div className="hstat"><span className="hstat-value">Aug 28–30</span><span className="hstat-label">Event Dates</span></div>
                  <div className="hstat"><span className="hstat-value">IIITA</span><span className="hstat-label">Venue</span></div>
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
                <p className="problem-statement-text">
                  Modern infrastructure increasingly relies on intelligent, adaptive systems. Yet most open-source tooling remains static, rule-based, and poorly suited for dynamic workloads.
                </p>
                <br />
                <p className="problem-statement-text">Your challenge: design and prototype an AI-augmented open-source tool or platform across one of these tracks:</p>
                <br />
                <div className="rules-list" style={{ marginTop: '8px' }}>
                  {[
                    { track: 'Track A — Intelligent DevOps', desc: 'Build an AI-powered CI/CD pipeline optimizer or automated incident-response bot.' },
                    { track: 'Track B — Smart Data Systems', desc: 'Create a self-tuning database engine or an ML-driven query planner for open-source databases.' },
                    { track: 'Track C — Open AI Infra', desc: 'Develop an open-source inference runtime, model-serving framework, or federated-learning orchestrator.' },
                  ].map((t, i) => (
                    <div key={i} className="rule-item">
                      <span className="rule-num">{String.fromCharCode(65 + i)}</span>
                      <p><strong style={{ color: '#ffffff' }}>{t.track}:</strong> {t.desc}</p>
                    </div>
                  ))}
                </div>
                <p className="problem-statement-text" style={{ marginTop: '16px' }}>
                  All solutions must be open-source, reproducible, and include a live demo or working prototype.
                </p>
              </div>

              <div className="hk-card">
                <div className="hk-card-title">
                  <div className="hk-icon">👥</div>
                  <h3>Who Can Participate</h3>
                </div>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-muted)', marginBottom: '12px' }}>Eligibility</p>
                <div className="eligibility-list" style={{ marginBottom: '24px' }}>
                  {[
                    'Undergraduate & postgraduate students from any recognised university in India.',
                    'Research scholars and PhD students are welcome.',
                    'Participants from IIIT Allahabad receive priority registration slots.',
                    'International students enrolled in Indian universities are eligible.',
                    'Alumni (graduated ≤ 2 years ago) may join as wild-card entries.',
                    'Faculty members may mentor but cannot compete for prizes.',
                  ].map((item, i) => (
                    <div key={i} className="eligibility-item">
                      <span className="elig-check">✓</span>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-muted)', marginBottom: '12px' }}>Team Composition</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {[
                    { icon: '👤', label: 'Min 2 members' },
                    { icon: '👥', label: 'Max 4 members' },
                    { icon: '🌐', label: 'Cross-institution teams OK' },
                  ].map((t, i) => (
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
                <div className="prize-card gold">
                  <div className="prize-medal">🥇</div>
                  <p className="prize-position">1st Place</p>
                  <p className="prize-amount">₹50,000</p>
                  <p className="prize-desc">Cash + trophies + fast-track internship interviews with Title Sponsors + OOSC Featured Project badge</p>
                </div>
                <div className="prize-card silver">
                  <div className="prize-medal">🥈</div>
                  <p className="prize-position">2nd Place</p>
                  <p className="prize-amount">₹30,000</p>
                  <p className="prize-desc">Cash + trophies + mentorship sessions with senior open-source engineers from partner companies</p>
                </div>
                <div className="prize-card bronze">
                  <div className="prize-medal">🥉</div>
                  <p className="prize-position">3rd Place</p>
                  <p className="prize-amount">₹20,000</p>
                  <p className="prize-desc">Cash + trophies + exclusive swag kits and 6-month access to premium dev tooling subscriptions</p>
                </div>
              </div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--color-text-muted)', margin: '24px 0 12px' }}>Special Category Awards</p>
              <div className="special-prizes">
                {[
                  { icon: '💡', label: 'Best Innovation — ₹10,000' },
                  { icon: '🌱', label: 'Best Open-Source Impact — ₹10,000' },
                  { icon: '🎨', label: 'Best UI/UX Design — ₹5,000' },
                  { icon: '⚡', label: 'Best Rookie Team — ₹5,000' },
                  { icon: '🤖', label: 'Best AI Integration — ₹5,000' },
                ].map((p, i) => (
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
                  {[
                    'All code must be written during the hackathon window (Aug 28, 9 AM — Aug 30, 9 PM). Public scaffolding templates are permitted.',
                    'Projects must be open-sourced under an OSI-approved license (MIT, Apache-2.0, GPL-3.0, etc.) on a public GitHub repository.',
                    'Teams must submit a working prototype, a 3-minute demo video, and a project README before the submission deadline.',
                    'Plagiarism or use of undisclosed AI-generated code is grounds for immediate disqualification.',
                    'Each participant may only be a member of one team. Switching teams after registration closes is not permitted.',
                    "Judges' decisions on all prize allocations are final. Disputes must be raised within 2 hours of results announcement.",
                    'Participants must adhere to the OOSC 4.0 Code of Conduct. Harassment will result in removal.',
                    'Use of cloud APIs (OpenAI, Hugging Face, etc.) is permitted but must be disclosed in the project README.',
                  ].map((rule, i) => (
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
                  {[
                    { label: 'Registration Opens',        value: 'July 15, 2025',              desc: 'Team registration portal goes live at 12:00 PM IST.', status: 'past' },
                    { label: 'Registration Deadline',     value: 'August 10, 2025',            desc: 'Last date to register. No late entries accepted.',     status: 'active' },
                    { label: 'Problem Statement Release', value: 'August 20, 2025',            desc: 'All tracks and detailed briefs shared with registered teams.', status: '' },
                    { label: 'Hackathon Kick-off',        value: 'August 28 — 9:00 AM',        desc: 'Opening ceremony, check-in, and hacking begins.',      status: '' },
                    { label: 'Submission Deadline',       value: 'August 30 — 9:00 PM',        desc: 'GitHub link + demo video submitted via DevPost.',       status: '' },
                    { label: 'Judging & Presentations',   value: 'August 30 — 10:00 PM',       desc: 'Top 10 teams present live to the jury (5 min each).',   status: '' },
                    { label: 'Results & Prize Ceremony',  value: 'August 30 — 11:30 PM',       desc: 'Winners announced at the closing gala.',                status: '' },
                  ].map((d, i) => (
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
                {[
                  { title: 'Form Your Team',           desc: 'Assemble 2–4 members. Designate one Team Lead who will manage registration and submissions.' },
                  { title: 'Register on the Portal',   desc: 'Click "Register Now" and complete the team form. All members must provide a valid institutional email.' },
                  { title: 'Confirm on DevPost',       desc: "You'll receive a DevPost project invite after approval. Join using the same email — this is your submission platform." },
                  { title: 'Attend Kick-off (Aug 28)', desc: 'Report to CC-3, IIITA by 8:30 AM. Carry valid student ID. Remote participation is available for outstation teams.' },
                  { title: 'Build & Commit',           desc: 'Work in your public GitHub repository. Ensure it is public and licensed before the deadline.' },
                  { title: 'Record Your Demo Video',   desc: 'Create a ≤ 3-minute screen-recorded demo. Upload to YouTube (unlisted) or Google Drive and save the link.' },
                  { title: 'Submit on DevPost',        desc: 'Before Aug 30, 9:00 PM IST — submit your GitHub repo, demo video URL, and project description on DevPost.' },
                  { title: 'Present to the Jury',      desc: 'If shortlisted in the top 10, your Team Lead will be contacted for a 5-minute live presentation slot.' },
                ].map((step, i) => (
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
                <h3>Ready to Build?</h3>
                <p>Registration is open until August 10, 2025. Spots are limited — secure your team today.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
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

      case 'register':
        return <Registration onSubmit={() => setAdminMessage('Registration interest captured successfully!')} />

      case 'contact':
        return (
          <section className="content-section contact-section" id="contact">
            <div className="contact-layout-grid">
              <div className="contact-info-panel">
                <div className="section-heading">
                  <span>Connect</span>
                  <h2>Contact the Organizers</h2>
                  <p>Inquire about sponsorship opportunities, speaker submissions, or registration access keys.</p>
                </div>

                <div className="contact-details-cards">
                  <div className="contact-detail-card glass-card">
                    <span className="icon">✉</span>
                    <div>
                      <h4>Official Email</h4>
                      <p>contact@oosc4.0.iiita.ac.in</p>
                    </div>
                  </div>
                  <div className="contact-detail-card glass-card">
                    <span className="icon">📞</span>
                    <div>
                      <h4>Call / WhatsApp</h4>
                      <p>+91 7318 295 789</p>
                    </div>
                  </div>
                  <div className="contact-detail-card glass-card">
                    <span className="icon">📍</span>
                    <div>
                      <h4>Venue Location</h4>
                      <p>CC-3, IIIT Allahabad, Devghat, Jhalwa, Prayagraj, UP 211015</p>
                    </div>
                  </div>
                </div>

                <div className="map-wrapper glass-card">
                  <iframe 
                    title="IIIT Allahabad Campus Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3603.237248107936!2d81.76916531102919!3d25.430327377457788!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398ffd42b938924b%3A0xc4aa002a2468307d!2sIndian%20Institute%20of%20Information%20Technology%2C%20Allahabad!5e0!3m2!1sen!2sin!4v1717320000000!5m2!1sen!2sin"
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, borderRadius: '18px', filter: 'invert(90%) hue-rotate(180deg) grayscale(40%)' }} 
                    allowFullScreen="" 
                    loading="lazy"
                  ></iframe>
                </div>
              </div>

              <div className="contact-form-panel glass-card">
                <h3>Send an Inquiry</h3>
                <p>Complete the form below to reach our communications committee.</p>
                <form className="contact-form-elements" onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label htmlFor="contact-name">Full Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      required
                      placeholder="Your name"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-email">Email Address</label>
                    <input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      required
                      placeholder="you@example.com"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="contact-msg">Message</label>
                    <textarea
                      id="contact-msg"
                      rows="5"
                      value={form.message}
                      onChange={(event) => setForm({ ...form, message: event.target.value })}
                      required
                      placeholder="Write your message details..."
                      className="form-control"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block">
                    Submit Message
                  </button>
                  {formStatus && <p className="form-status-message">{formStatus}</p>}
                </form>
              </div>
            </div>
          </section>
        )

      default:
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
  }

  return (
    <div className="app-shell">
      <header className="site-header glass-header">
        <button
          type="button"
          className="brand"
          onClick={() => navigateTo('home')}
          title="Back to home"
        >
          <span className="brand-mark">OOSC</span>
          <span className="brand-text">4.0</span>
        </button>

        {/* Mobile Hamburger menu toggle button */}
        <button
          type="button"
          className={`hamburger-toggle ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
          <span className="toggle-bar"></span>
        </button>

        {/* Main Nav */}
        <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Primary navigation">
          {pageRoutes.map((route) => (
            <button
              key={route.key}
              type="button"
              className={route.key === currentPage ? 'nav-link active' : 'nav-link'}
              onClick={() => navigateTo(route.key)}
            >
              {route.label}
            </button>
          ))}
          <div className="mobile-actions-divider"></div>
          {adminMode ? (
            <button type="button" className="nav-action-btn logout-btn" onClick={logout}>
              Logout
            </button>
          ) : (
            <button type="button" className="nav-action-btn admin-btn" onClick={() => navigateTo('admin')}>
              Admin Portal
            </button>
          )}
        </nav>

        {/* Header Desktop actions */}
        <div className="header-actions">
          <button
            type="button"
            className="btn btn-nav-cta"
            onClick={() => navigateTo('register')}
          >
            Register Now
          </button>
          {adminMode ? (
            <button type="button" className="btn btn-admin active" onClick={logout}>
              Logout
            </button>
          ) : (
            <button type="button" className="btn btn-admin" onClick={() => navigateTo('admin')}>
              Admin
            </button>
          )}
        </div>
      </header>

      {/* Admin Quick Tools panel */}
      {adminMode && (
        <section className="content-section admin-tools-bar glass-card" id="admin-tools">
          <div className="admin-tools-header">
            <div>
              <h3>Admin Dashboard Quick Tools</h3>
              <p>Logged in as: <strong>{adminEmail}</strong></p>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={logout}>
              Sign Out
            </button>
          </div>
          
          <div className="admin-tools-grid">
            <div className="uploader-tool">
              <h4>Media Asset Upload</h4>
              <p>Drag and drop assets here. Copy the generated URL into metadata fields.</p>
              <ImageUploader onUpload={setUploadUrl} />
              {uploadUrl && (
                <div className="generated-url-box">
                  <span>Asset URL:</span>
                  <code>{uploadUrl}</code>
                  <button 
                    type="button" 
                    className="btn-copy" 
                    onClick={() => {
                      navigator.clipboard.writeText(uploadUrl)
                      alert('Copied link!')
                    }}
                  >
                    Copy
                  </button>
                </div>
              )}
            </div>

            <div className="quick-management-actions">
              <h4>Quick Page Modifiers</h4>
              <p>Directly add metadata cards to the active database categories:</p>
              <div className="actions-flex">
                <button type="button" className="btn btn-admin-quick" onClick={() => openModal('speakers', 'create')}>+ Add Speaker</button>
                <button type="button" className="btn btn-admin-quick" onClick={() => openModal('sponsors', 'create')}>+ Add Sponsor</button>
                <button type="button" className="btn btn-admin-quick" onClick={() => openModal('events', 'create')}>+ Add Schedule Slot</button>
                <button type="button" className="btn btn-admin-quick" onClick={() => openModal('team', 'create')}>+ Add Team Member</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Page Content Body */}
      <main className="page-body">{renderPage()}</main>

      {modalOpen && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true">
          <div className="admin-modal-panel glass-card">
            <div className="admin-modal-header">
              <h3>{modalMode === 'create' ? `Add New ${resourceLabels[modalResource]}` : `Edit ${resourceLabels[modalResource]}`}</h3>
              <button type="button" className="btn-close-modal" onClick={closeModal} aria-label="Close dialog">✕</button>
            </div>
            <div className="admin-modal-body">
              {modalFieldMap[modalResource]?.map((field) => (
                <div key={field.key} className="form-group modal-form-group">
                  <label htmlFor={`modal-${field.key}`}>{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      id={`modal-${field.key}`}
                      value={modalData[field.key] ?? ''}
                      onChange={(event) => setModalField(field.key, event.target.value)}
                      className="form-control"
                      rows="4"
                    />
                  ) : (
                    <input
                      id={`modal-${field.key}`}
                      type={field.type}
                      value={modalData[field.key] ?? ''}
                      onChange={(event) => setModalField(field.key, event.target.value)}
                      className="form-control"
                    />
                  )}
                </div>
              ))}
              <div className="modal-upload-row">
                <div>
                  <p className="field-tip">Use upload or paste image/URL fields for live preview.</p>
                  <ImageUploader onUpload={setModalImage} label="Upload image or logo" />
                </div>
                {((modalResource === 'sponsors' ? modalData.logoURL : modalData.photoURL) || '').length > 0 && (
                  <div className="modal-preview-box">
                    <span>Preview</span>
                    <img src={modalResource === 'sponsors' ? modalData.logoURL : modalData.photoURL} alt="Preview" loading="lazy" />
                  </div>
                )}
              </div>
              {modalError && <p className="admin-status-message error modal-error">{modalError}</p>}
            </div>
            <div className="admin-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={saveModalRecord}>
                {modalMode === 'create' ? 'Create' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Component */}
      <Footer />

      {/* Admin Message alert bar */}
      {adminMessage && (
        <div className="admin-status-overlay">
          <div className="admin-toast glass-card">
            <span>{adminMessage}</span>
            <button type="button" onClick={() => setAdminMessage('')}>✕</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
