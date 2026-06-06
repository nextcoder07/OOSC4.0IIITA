import { useCallback, useEffect, useMemo, useState } from 'react'
import Footer from './components/Footer.jsx'
import Registration from './components/Registration.jsx'
import Hackathon from './components/Hackathon.jsx'
import Contact from './components/Contact.jsx'
import AdminLogin from './components/AdminLogin.jsx'
import Schedule from './components/Schedule.jsx'
import Speakers from './components/Speakers.jsx'
import Sponsors from './components/Sponsors.jsx'
import Team from './components/Team.jsx'
import Home from './components/Home.jsx'
import AdminModal from './components/AdminModal.jsx'

// Admin Components
import AdminLayout from './components/admin/AdminLayout.jsx'
import AdminDashboardHome from './components/admin/AdminDashboardHome.jsx'
import AdminResourceManager from './components/admin/AdminResourceManager.jsx'
import AdminPageManager from './components/admin/AdminPageManager.jsx'
import AdminMediaLibrary from './components/admin/AdminMediaLibrary.jsx'
import AdminAudits from './components/admin/AdminAudits.jsx'
import AdminInbox from './components/admin/AdminInbox.jsx'
import AdminPreviewEditShell from './components/admin/AdminPreviewEditShell.jsx'

import {
  aboutData,
  heroData,
} from './data.js'
import './App.css'

function App() {
  const [adminMode, setAdminMode] = useState(false)
  const [adminUsername, setAdminUsername] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  
  // Auth Inputs
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
  const [adminMessage, setAdminMessage] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalResource, setModalResource] = useState('')
  const [modalMode, setModalMode] = useState('create')
  const [modalData, setModalData] = useState({})
  const [modalError, setModalError] = useState('')

  // CMS Database states
  const [speakers, setSpeakers] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [schedule, setSchedule] = useState([])
  const [team, setTeam] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [messages, setMessages] = useState([])
  const [mediaAssets, setMediaAssets] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [settings, setSettings] = useState({})

  // Layout states
  const [currentPage, setCurrentPage] = useState('home')
  const [adminTab, setAdminTab] = useState('dashboard')
  const [previewShell, setPreviewShell] = useState(null) // { section, mode } or null
  
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [formStatus, setFormStatus] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDay, setActiveDay] = useState('Aug 28')
  const [themeMode, setThemeMode] = useState('bright')

  const pageRoutes = useMemo(() => [
    { key: 'home', label: 'Home' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'hackathon', label: 'Hackathon' },
    { key: 'speakers', label: 'Speakers' },
    { key: 'sponsors', label: 'Sponsors' },
    { key: 'team', label: 'Team' },
    { key: 'register', label: 'Register' },
    { key: 'contact', label: 'Contact' },
  ], [])

  // Dynamic Home Config parsing
  const hero = useMemo(() => {
    try {
      if (settings.home_content) {
        return JSON.parse(settings.home_content).hero
      }
    } catch (e) {}
    return heroData
  }, [settings])

  const about = useMemo(() => {
    try {
      if (settings.home_content) {
        return JSON.parse(settings.home_content).about
      }
    } catch (e) {}
    return aboutData
  }, [settings])

  const hackathonContent = useMemo(() => {
    try {
      if (settings.hackathon_content) {
        return JSON.parse(settings.hackathon_content)
      }
    } catch (e) {}
    return null
  }, [settings])

  // Sponsors Grouping
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

  // Team Grouping
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
      const dept = member.department || ''
      const role = member.role ? member.role.toLowerCase() : ''
      const name = member.name ? member.name.toLowerCase() : ''

      if (dept && groups[dept]) {
        groups[dept].push(member)
      } else if (
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
        role.includes('catering')
      ) {
        groups['Hospitality & Logistics Team'].push(member)
      } else if (
        role.includes('chair') || 
        role.includes('lead') || 
        role.includes('head')
      ) {
        groups['Core Team'].push(member)
      } else {
        groups['Student Coordinators'].push(member)
      }
    })

    return groups
  }, [team])

  // API Fetch Utility
  const apiFetch = useCallback(async (path, options = {}) => {
    const headers = { ...(options.headers || {}) }
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }

    const response = await fetch(path, {
      ...options,
      credentials: 'include',
      headers: Object.keys(headers).length ? headers : undefined,
    })

    const data = await response.json().catch(() => null)
    if (!response.ok) {
      const error = new Error(data?.error || response.statusText || 'Request failed')
      error.status = response.status
      error.body = data
      throw error
    }
    return data
  }, [csrfToken])

  const retryApiFetch = useCallback(async (path, options = {}, retries = 2, delayMs = 400) => {
    let lastError = null
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await apiFetch(path, options)
      } catch (error) {
        lastError = error
        if (error?.status === 429 || attempt === retries) break
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
    throw lastError
  }, [apiFetch])

  // Navigation handlers
  const navigateTo = (pageKey) => {
    window.history.pushState({}, '', `#${pageKey}`)
    setCurrentPage(pageKey)
    setMobileMenuOpen(false)
    // Scroll to top on navigation or re-click
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  const navigateAdminTo = (tab) => {
    window.history.pushState({}, '', `/admin/${tab}`)
    setAdminTab(tab)
    // Scroll to top for admin sections
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  // Location / Path Synchronization
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname
      if (path.startsWith('/admin')) {
        if (path.startsWith('/admin/preview/')) {
          const section = path.replace('/admin/preview/', '')
          setPreviewShell({ section, mode: 'preview' })
        } else if (path.startsWith('/admin/edit/')) {
          const section = path.replace('/admin/edit/', '')
          setPreviewShell({ section, mode: 'edit' })
        } else {
          setPreviewShell(null)
          const tab = path.replace('/admin/', '') || 'dashboard'
          setAdminTab(tab)
          if (tab === 'login') {
            setCurrentPage('admin')
          }
        }
      } else {
        setPreviewShell(null)
        const hash = window.location.hash.replace('#', '')
        setCurrentPage(pageRoutes.some((route) => route.key === hash) ? hash : 'home')
      }
    }

    handleLocationChange()
    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [pageRoutes])

  // CSRF token loader
  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const data = await apiFetch('/api/csrf-token')
        if (data?.csrfToken) setCsrfToken(data.csrfToken)
      } catch (e) {
        console.warn('Could not load CSRF token.', e.message)
      }
    }
    fetchCsrf()
  }, [apiFetch])

  // Synchronize theme to document body
  useEffect(() => {
    document.body.setAttribute('data-theme', themeMode)
  }, [themeMode])

  // Restore active user session on startup
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const data = await apiFetch('/admin/me')
        setAdminMode(true)
        setAdminUsername(data.username)
        // If logged in and on admin path, keep it, otherwise redirect from login to dashboard
        if (window.location.pathname === '/admin/login') {
          navigateAdminTo('dashboard')
        }
      } catch {
        setAdminMode(false)
        setAdminUsername('')
      }
    }
    restoreSession()
  }, [])

  // Content loader
  const loadDatabaseContent = useCallback(async () => {
    setAdminMessage('')

    try {
      const includeDraft = adminMode ? '1' : '0'
      const [speakerRes, sponsorRes, eventRes, teamRes, settingsRes] =
        await Promise.all([
          retryApiFetch(`/api/speakers?includeDraft=${includeDraft}`),
          retryApiFetch(`/api/sponsors?includeDraft=${includeDraft}`),
          retryApiFetch(`/api/events?includeDraft=${includeDraft}`),
          retryApiFetch(`/api/team?includeDraft=${includeDraft}`),
          retryApiFetch('/api/settings'),
        ])

      setSpeakers(speakerRes || [])
      setSponsors(sponsorRes || [])
      setSchedule(eventRes || [])
      setTeam(teamRes || [])
      setSettings(settingsRes || {})

      // Load admin specific queues if logged in
      if (adminMode) {
        const [regRes, msgRes, mediaRes, auditRes] = await Promise.all([
          apiFetch('/api/registrations'),
          apiFetch('/api/messages'),
          apiFetch('/api/media'),
          apiFetch('/api/audit-logs'),
        ])
        setRegistrations(regRes || [])
        setMessages(msgRes || [])
        setMediaAssets(mediaRes || [])
        setAuditLogs(auditRes || [])
      }
    } catch (error) {
      console.error('Backend fetch failed, no website data available.', error.message);
      // Silently handle error without admin popup
      setSpeakers([]);
      setSponsors([]);
      setSchedule([]);
      setTeam([]);
      setSponsors([])
      setSchedule([])
      setTeam([])
    }
  }, [adminMode, apiFetch])

  useEffect(() => {
    loadDatabaseContent()
  }, [loadDatabaseContent])

  // CMS CRUD Save handler
  const handleSaveRecord = async (resource, payload) => {
    if (!adminMode) {
      setAdminMessage('Log in as admin to save content.')
      return
    }

    try {
      const isNew = !payload.id || payload.id === 'new'
      const endpoint = isNew ? `/api/${resource}` : `/api/${resource}/${payload.id}`
      const method = isNew ? 'POST' : 'PUT'
      
      await apiFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      setAdminMessage(`Saved ${resource.slice(0, -1)} successfully.`)
      loadDatabaseContent()
    } catch (error) {
      setAdminMessage(`Error: ${error.message}`)
    }
  }

  // CMS CRUD Delete handler
  const handleDeleteRecord = async (resource, id) => {
    if (!adminMode) return

    try {
      await apiFetch(`/api/${resource}/${id}`, { method: 'DELETE' })
      setAdminMessage(`Deleted record successfully.`)
      loadDatabaseContent()
    } catch (error) {
      setAdminMessage(`Error: ${error.message}`)
    }
  }

  // Reorder list order
  const handleReorderResource = async (resource, updatedList) => {
    // Update local state first for instant UI response
    if (resource === 'speakers') setSpeakers(updatedList)
    if (resource === 'sponsors') setSponsors(updatedList)
    if (resource === 'team') setTeam(updatedList)
    if (resource === 'events') setSchedule(updatedList)

    try {
      await Promise.all(
        updatedList.map((item) =>
          apiFetch(`/api/${resource}/${item.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sortOrder: item.sortOrder }),
          })
        )
      )
      loadDatabaseContent()
    } catch (error) {
      setAdminMessage(`Reordering sync failed: ${error.message}`)
    }
  }

  // Save Dynamic Settings (JSON page properties)
  const handleSaveSettings = async (settingsPayload) => {
    try {
      await apiFetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsPayload }),
      })
      loadDatabaseContent()
    } catch (error) {
      setAdminMessage(`Failed to save settings: ${error.message}`)
    }
  }

  // Mark inbox message as read
  const handleMarkMessageRead = async (id) => {
    try {
      await apiFetch(`/api/messages/${id}/read`, { method: 'PATCH' })
      loadDatabaseContent()
    } catch (e) {
      setAdminMessage(e.message)
    }
  }

  // Media Library Deletion
  const handleDeleteMediaAsset = async (id) => {
    try {
      await apiFetch(`/api/media/${id}`, { method: 'DELETE' })
      loadDatabaseContent()
    } catch (e) {
      setAdminMessage(e.message)
    }
  }

  // In-Context edit overlays (modal popups during Edit Preview mode)
  const openInContextModal = (resource, mode = 'edit', item = {}) => {
    setModalResource(resource)
    setModalMode(mode)
    setModalData(item)
    setModalError('')
    setModalOpen(true)
  }

  const handleSaveModalRecord = async () => {
    try {
      const payload = { ...modalData }
      if (payload.sortOrder !== undefined) {
        payload.sortOrder = Number(payload.sortOrder || 0)
      }

      const isNew = modalMode === 'create'
      const endpoint = isNew ? `/api/${modalResource}` : `/api/${modalResource}/${payload.id}`
      const method = isNew ? 'POST' : 'PUT'

      await apiFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      setModalOpen(false)
      loadDatabaseContent()
      setAdminMessage(`Saved successfully in context!`)
    } catch (error) {
      setModalError(error.message)
    }
  }

  // Auth logins
  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginUsername || !loginPassword) {
      setAdminMessage('Please complete all input fields.')
      return
    }
    try {
      setAdminMessage('Signing in...')
      const data = await apiFetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      })
      setAdminUsername(data.username || loginUsername)
      setAdminMessage('Admin logged in successfully.')
      setAdminMode(true)
      setLoginUsername('')
      setLoginPassword('')
      navigateAdminTo('dashboard')
    } catch (error) {
      setAdminMessage(error.message || 'Invalid username or password.')
    }
  }

  const handleLogout = async () => {
    try {
      await apiFetch('/admin/logout', { method: 'POST' })
    } catch (error) {
      console.warn('Logout warning', error)
    }
    setAdminUsername('')
    setAdminMode(false)
    setAdminMessage('Logged out.')
    window.history.pushState({}, '', '/')
    setCurrentPage('home')
  }

  // Public Form handler
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setFormStatus('Please complete all fields.')
      return
    }

    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setFormStatus('Message received! Thank you.')
      setForm({ name: '', email: '', message: '' })
    } catch (error) {
      setFormStatus(error.message)
    }
  }

  // Helpers
  const getEventTime = (item) => item.dateTime || `${item.date} · ${item.time}`
  const getEventDesc = (item) => item.details || item.description

  const filteredSchedule = useMemo(() => {
    return schedule
      .filter((item) => (item.date || '').includes(activeDay))
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }, [schedule, activeDay])

  // Public viewport switcher
  const renderPublicPage = () => {
    switch (currentPage) {
      case 'schedule':
        return (
          <Schedule
            filteredSchedule={filteredSchedule}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            adminMode={false}
            getEventTime={getEventTime}
            getEventDesc={getEventDesc}
          />
        )
      case 'speakers':
        return <Speakers speakers={speakers} adminMode={false} />
      case 'sponsors':
        return <Sponsors sortedSponsors={sortedSponsors} adminMode={false} />
      case 'team':
        return <Team categorizedTeam={categorizedTeam} adminMode={false} />
      case 'hackathon':
        return <Hackathon content={hackathonContent} />
      case 'register':
        return (
          <Registration
            onSubmit={() => setAdminMessage('Registration interest captured successfully!')}
          />
        )
      case 'contact':
        return (
          <Contact
            form={form}
            setForm={setForm}
            handleFormSubmit={handleFormSubmit}
            formStatus={formStatus}
          />
        )
      case 'home':
      default:
        return (
          <Home
            hero={hero}
            about={about}
            navigateTo={navigateTo}
          />
        )
    }
  }

  // Dynamic dashboard analytics metrics
  const dashboardStats = useMemo(() => {
    return {
      speakers: speakers.length,
      sponsors: sponsors.length,
      team: team.length,
      leads: registrations.length,
      unreadMessages: messages.filter((m) => !m.read).length,
    }
  }, [speakers, sponsors, team, registrations, messages])

  // ──── MAIN RENDERING SHELLS ──────────────────────────────────────────────────

  // Shell 1: Preview or Context Edit mode
  if (previewShell) {
    return (
      <div className="app-shell" data-theme={themeMode} style={{ padding: 0 }}>
        <AdminPreviewEditShell
          section={previewShell.section}
          mode={previewShell.mode}
          onBack={() => {
            setPreviewShell(null)
            navigateAdminTo(previewShell.section)
          }}
          onPublish={() => setAdminMessage('All drafts published successfully!')}
          hero={hero}
          about={about}
          speakers={speakers}
          sortedSponsors={sortedSponsors}
          categorizedTeam={categorizedTeam}
          filteredSchedule={filteredSchedule}
          activeDay={activeDay}
          setActiveDay={setActiveDay}
          openModal={openInContextModal}
          editRecord={(res, item) => openInContextModal(res, 'edit', item)}
          deleteRecord={handleDeleteRecord}
          setSpeakers={setSpeakers}
          setSponsors={setSponsors}
          setTeam={setTeam}
          setSchedule={setSchedule}
          getEventTime={getEventTime}
          getEventDesc={getEventDesc}
        />

        {modalOpen && (
          <AdminModal
            modalMode={modalMode}
            modalResource={modalResource}
            resourceLabels={{
              speakers: 'Speaker',
              sponsors: 'Sponsor',
              events: 'Schedule Slot',
              team: 'Team Member',
            }}
            closeModal={() => setModalOpen(false)}
            modalFieldMap={{
              speakers: [
                { key: 'name', label: 'Name', type: 'text' },
                { key: 'title', label: 'Title / Affiliation', type: 'text' },
                { key: 'bio', label: 'Biography', type: 'textarea' },
                { key: 'photoURL', label: 'Photo URL', type: 'text' },
              ],
              sponsors: [
                { key: 'name', label: 'Sponsor Name', type: 'text' },
                { key: 'category', label: 'Category', type: 'text' },
                { key: 'website', label: 'Website URL', type: 'text' },
                { key: 'logoURL', label: 'Logo URL', type: 'text' },
              ],
              events: [
                { key: 'title', label: 'Session Title', type: 'text' },
                { key: 'description', label: 'Description', type: 'textarea' },
                { key: 'date', label: 'Date', type: 'text' },
                { key: 'time', label: 'Time', type: 'text' },
              ],
              team: [
                { key: 'name', label: 'Name', type: 'text' },
                { key: 'role', label: 'Role', type: 'text' },
                { key: 'contact', label: 'Contact Details', type: 'text' },
                { key: 'photoURL', label: 'Photo URL', type: 'text' },
              ],
            }}
            modalData={modalData}
            setModalField={(f, v) => setModalData((prev) => ({ ...prev, [f]: v }))}
            setModalImage={(url) =>
              setModalData((prev) => ({
                ...prev,
                [modalResource === 'sponsors' ? 'logoURL' : 'photoURL']: url,
              }))
            }
            modalError={modalError}
            saveModalRecord={handleSaveModalRecord}
          />
        )}

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

  // Shell 2: Admin CMS Dashboard Layout
  const isCmsRoute = window.location.pathname.startsWith('/admin')
  if (isCmsRoute) {
    if (!adminMode || currentPage === 'admin') {
      return (
        <div className="app-shell" data-theme={themeMode} style={{ padding: '60px 20px', maxWidth: '500px', margin: '0 auto' }}>
          <AdminLogin
            loginUsername={loginUsername}
            setLoginUsername={setLoginUsername}
            loginPassword={loginPassword}
            setLoginPassword={setLoginPassword}
            handleLogin={handleLogin}
            adminMessage={adminMessage}
          />
        </div>
      )
    }

    return (
      <div className="app-shell" data-theme={themeMode} style={{ padding: 0 }}>
        <AdminLayout
          currentTab={adminTab}
          onNavigate={navigateAdminTo}
          adminUsername={adminUsername}
          onLogout={handleLogout}
          unreadCount={dashboardStats.unreadMessages}
        >
          {adminTab === 'dashboard' && (
            <AdminDashboardHome
              stats={dashboardStats}
              recentLogs={auditLogs}
              onNavigate={navigateAdminTo}
              onOpenModal={(res) => {
                const defaults = {
                  speakers: { name: '', title: '', bio: '', photoURL: '', published: false, sortOrder: speakers.length + 1 },
                  sponsors: { name: '', category: 'Title Sponsor', website: '', logoURL: '', published: false, sortOrder: sponsors.length + 1 },
                  team: { name: '', role: '', contact: '', photoURL: '', published: false, sortOrder: team.length + 1 },
                  events: { title: '', description: '', date: 'Aug 28', time: '', type: 'Talk', published: false, sortOrder: schedule.length + 1 },
                }
                openInContextModal(res, 'create', defaults[res])
              }}
            />
          )}

          {['speakers', 'sponsors', 'team', 'events'].includes(adminTab) && (
            <AdminResourceManager
              resource={adminTab}
              items={
                adminTab === 'speakers' ? speakers :
                adminTab === 'sponsors' ? sponsors :
                adminTab === 'team' ? team :
                schedule
              }
              onSave={handleSaveRecord}
              onDelete={handleDeleteRecord}
              onReorder={handleReorderResource}
              onPreview={(res) => {
                window.history.pushState({}, '', `/admin/preview/${res}`)
                setPreviewShell({ section: res, mode: 'preview' })
              }}
            />
          )}

          {['home', 'hackathon'].includes(adminTab) && (
            <AdminPageManager
              pageKey={adminTab}
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {adminTab === 'media' && (
            <AdminMediaLibrary
              mediaAssets={mediaAssets}
              onUploadAsset={loadDatabaseContent}
              onDeleteAsset={handleDeleteMediaAsset}
            />
          )}

          {adminTab === 'messages' && (
            <AdminInbox
              messages={messages}
              registrations={registrations}
              onMarkRead={handleMarkMessageRead}
              onDeleteMessage={(id) => handleDeleteRecord('messages', id)}
              onDeleteRegistration={(id) => handleDeleteRecord('registrations', id)}
            />
          )}

          {adminTab === 'registrations' && (
            <AdminInbox
              messages={messages}
              registrations={registrations}
              onMarkRead={handleMarkMessageRead}
              onDeleteMessage={(id) => handleDeleteRecord('messages', id)}
              onDeleteRegistration={(id) => handleDeleteRecord('registrations', id)}
            />
          )}

          {adminTab === 'audits' && <AdminAudits auditLogs={auditLogs} />}

          {adminTab === 'settings' && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3>Console Configuration Settings</h3>
              <p className="field-tip" style={{ marginBottom: '20px' }}>
                Manage authentication constraints, cookie security details, and basic SEO configurations.
              </p>
              
              <div className="form-group">
                <label>Admin Login Email</label>
                <input type="text" className="form-control" value="admin@example.com" disabled />
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>Session Expiration Interval</label>
                <select className="form-control" disabled>
                  <option>24 Hours (Active)</option>
                  <option>7 Days</option>
                  <option>30 Days</option>
                </select>
              </div>
            </div>
          )}

          {adminTab === 'contact-settings' && (
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3>Contact Page Information Settings</h3>
              <p className="field-tip" style={{ marginBottom: '20px' }}>
                Specify maps widgets, contact email labels, and conference venue directions.
              </p>
              
              <div className="form-group">
                <label>Support Contact Email Address</label>
                <input type="text" className="form-control" value="oosc@iiita.ac.in" disabled />
              </div>
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>Location Maps Iframe Code</label>
                <textarea className="form-control" rows="3" disabled>
                  https://www.google.com/maps/embed...
                </textarea>
              </div>
            </div>
          )}
        </AdminLayout>

        {modalOpen && (
          <AdminModal
            modalMode={modalMode}
            modalResource={modalResource}
            resourceLabels={{
              speakers: 'Speaker',
              sponsors: 'Sponsor',
              events: 'Schedule Slot',
              team: 'Team Member',
            }}
            closeModal={() => setModalOpen(false)}
            modalFieldMap={{
              speakers: [
                { key: 'name', label: 'Name', type: 'text' },
                { key: 'title', label: 'Title / Affiliation', type: 'text' },
                { key: 'bio', label: 'Biography', type: 'textarea' },
                { key: 'photoURL', label: 'Photo URL', type: 'text' },
              ],
              sponsors: [
                { key: 'name', label: 'Sponsor Name', type: 'text' },
                { key: 'category', label: 'Category', type: 'text' },
                { key: 'website', label: 'Website URL', type: 'text' },
                { key: 'logoURL', label: 'Logo URL', type: 'text' },
              ],
              events: [
                { key: 'title', label: 'Session Title', type: 'text' },
                { key: 'description', label: 'Description', type: 'textarea' },
                { key: 'date', label: 'Date', type: 'text' },
                { key: 'time', label: 'Time', type: 'text' },
              ],
              team: [
                { key: 'name', label: 'Name', type: 'text' },
                { key: 'role', label: 'Role', type: 'text' },
                { key: 'contact', label: 'Contact Details', type: 'text' },
                { key: 'photoURL', label: 'Photo URL', type: 'text' },
              ],
            }}
            modalData={modalData}
            setModalField={(f, v) => setModalData((prev) => ({ ...prev, [f]: v }))}
            setModalImage={(url) =>
              setModalData((prev) => ({
                ...prev,
                [modalResource === 'sponsors' ? 'logoURL' : 'photoURL']: url,
              }))
            }
            modalError={modalError}
            saveModalRecord={handleSaveModalRecord}
          />
        )}

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

  // Shell 3: Public Website Experience (Untouched clean visitor shell)
  return (
    <div className="app-shell" data-theme={themeMode}>
      <header className="site-header glass-header">
        <button
          type="button"
          className="brand"
          onClick={() => navigateTo('home')}
          title="Back to home"
        >
          <img src="/photos/oosclogo.jpeg" alt="OOSC Logo" className="brand-logo" />
        </button>

        {/* Desktop-only theme toggle (far right) — hidden on tablet/phone */}
        <button
          type="button"
          className="theme-switcher desktop-only-theme"
          onClick={() => setThemeMode((prev) => (prev === 'bright' ? 'dark' : 'bright'))}
          title={themeMode === 'bright' ? 'Switch to dark mode' : 'Switch to bright mode'}
        >
          {themeMode === 'bright' ? '🌙' : '☀️'}
        </button>

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

        <nav className={`main-nav ${mobileMenuOpen ? 'mobile-open' : ''}`} aria-label="Primary navigation">
          {pageRoutes.map((route) => {
            const isExtra = ['schedule', 'hackathon', 'team'].includes(route.key)
            return (
              <button
                key={route.key}
                type="button"
                className={`${route.key === currentPage ? 'nav-link active' : 'nav-link'} ${isExtra ? 'extra' : ''}`}
                onClick={() => navigateTo(route.key)}
              >
                {route.label}
              </button>
            )
          })}

          {/* Theme toggle inside dropdown — visible only in dropdown on tablet/phone */}
          <button
            type="button"
            className="nav-link dropdown-theme-toggle"
            onClick={() => setThemeMode((prev) => (prev === 'bright' ? 'dark' : 'bright'))}
          >
            {themeMode === 'bright' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
        </nav>
      </header>

      {/* Page Content Body */}
      <main className="page-body">{renderPublicPage()}</main>

      <Footer />

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
