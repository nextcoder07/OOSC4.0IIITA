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
import AdminTools from './components/AdminTools.jsx'
import AdminModal from './components/AdminModal.jsx'
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
  const [adminUsername, setAdminUsername] = useState('')
  const [csrfToken, setCsrfToken] = useState('')
  
  // Auth Inputs
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
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
  const [currentPage, setCurrentPage] = useState(window.location.pathname.startsWith('/admin/login') ? 'admin' : 'home')
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [formStatus, setFormStatus] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Schedule page active day tab
  const [activeDay, setActiveDay] = useState('Aug 28')

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

  const navigateTo = (pageKey) => {
    if (pageKey === 'admin') return
    if (pageRoutes.some((route) => route.key === pageKey)) {
      window.history.pushState({}, '', `#${pageKey}`)
      setCurrentPage(pageKey)
      setMobileMenuOpen(false)
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

  // Handle back/forward buttons, hash navigation, and direct admin path access
  useEffect(() => {
    const updateRoute = () => {
      const isAdmin = window.location.pathname.startsWith('/admin/login')
      if (isAdmin) {
        setCurrentPage(adminMode ? 'home' : 'admin')
      } else {
        const hash = window.location.hash.replace('#', '')
        setCurrentPage(pageRoutes.some((route) => route.key === hash) ? hash : 'home')
      }
    }

    updateRoute()
    window.addEventListener('hashchange', updateRoute)
    window.addEventListener('popstate', updateRoute)
    return () => {
      window.removeEventListener('hashchange', updateRoute)
      window.removeEventListener('popstate', updateRoute)
    }
  }, [pageRoutes, adminMode])

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await fetch('/api/admin/me', { credentials: 'include' })
        if (!response.ok) return
        const data = await response.json()
        setAdminMode(true)
        setAdminUsername(data.username)
        if (window.location.pathname.startsWith('/admin/login')) {
          window.history.replaceState({}, '', '/')
          setCurrentPage('home')
        }
      } catch {
        setAdminMode(false)
        setAdminUsername('')
      }
    }

    restoreSession()
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

  const reorderRecords = async (resource, newItems, setter) => {
    if (!adminMode) {
      setAdminMessage('Log in as admin to reorder items.')
      return
    }

    setter(newItems)
    try {
      await apiFetch(`/api/${resource}/reorder`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItems.map((item) => ({ id: item.id, sortOrder: item.sortOrder }))),
      })
      setAdminMessage(`Reordered ${resource === 'events' ? 'schedule' : resource} successfully.`)
    } catch (error) {
      setAdminMessage(`Failed to save new order: ${error.message}`)
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
    if (!loginUsername || !loginPassword) {
      setAdminMessage('Please complete all input fields.')
      return
    }
    try {
      setAdminMessage('Signing in...')
      const data = await apiFetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword }),
      })
      setAdminUsername(data.username || loginUsername)
      setAdminMessage('Admin logged in successfully.')
      setAdminMode(true)
      setLoginUsername('')
      setLoginPassword('')
      window.history.pushState({}, '', '/')
      setCurrentPage('home')
    } catch (error) {
      setAdminMessage(error.message || 'Invalid username or password.')
    }
  }

  const logout = async () => {
    try {
      await apiFetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.warn('Logout failed', error)
    }
    setAdminUsername('')
    setAdminMode(false)
    setAdminMessage('Logged out.')
    window.history.pushState({}, '', '/')
    setCurrentPage('home')
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
        <AdminLogin
          loginUsername={loginUsername}
          setLoginUsername={setLoginUsername}
          loginPassword={loginPassword}
          setLoginPassword={setLoginPassword}
          handleLogin={handleLogin}
          adminMessage={adminMessage}
        />
      )
    }

    switch (currentPage) {
      case 'schedule':
        return (
          <Schedule
            filteredSchedule={filteredSchedule}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            adminMode={adminMode}
            openModal={openModal}
            editRecord={editRecord}
            deleteRecord={deleteRecord}
            setSchedule={setSchedule}
            getEventTime={getEventTime}
            getEventDesc={getEventDesc}
            schedule={schedule}
            reorderRecords={reorderRecords}
          />
        )

      case 'speakers':
        return (
          <Speakers
            speakers={speakers}
            adminMode={adminMode}
            openModal={openModal}
            editRecord={editRecord}
            deleteRecord={deleteRecord}
            setSpeakers={setSpeakers}
            reorderRecords={reorderRecords}
          />
        )

      case 'sponsors':
        return (
          <Sponsors
            sortedSponsors={sortedSponsors}
            adminMode={adminMode}
            openModal={openModal}
            editRecord={editRecord}
            deleteRecord={deleteRecord}
            setSponsors={setSponsors}
            sponsors={sponsors}
            reorderRecords={reorderRecords}
          />
        )

      case 'team':
        return (
          <Team
            categorizedTeam={categorizedTeam}
            adminMode={adminMode}
            openModal={openModal}
            editRecord={editRecord}
            deleteRecord={deleteRecord}
            setTeam={setTeam}
            team={team}
            reorderRecords={reorderRecords}
          />
        )

      case 'hackathon':
        return <Hackathon />

      case 'register':
        return <Registration onSubmit={() => setAdminMessage('Registration interest captured successfully!')} />

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
        return (
          <Home
            hero={hero}
            about={about}
            navigateTo={navigateTo}
          />
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
        </nav>

        {/* Header Desktop actions */}
        <div className="header-actions"></div>
      </header>

      {/* Admin Quick Tools panel */}
      {adminMode && (
        <AdminTools
          adminUsername={adminUsername}
          logout={logout}
          uploadUrl={uploadUrl}
          setUploadUrl={setUploadUrl}
          openModal={openModal}
          csrfToken={csrfToken}
        />
      )}

      {/* Page Content Body */}
      <main className="page-body">{renderPage()}</main>

      {modalOpen && (
        <AdminModal
          modalMode={modalMode}
          modalResource={modalResource}
          resourceLabels={resourceLabels}
          closeModal={closeModal}
          modalFieldMap={modalFieldMap}
          modalData={modalData}
          setModalField={setModalField}
          setModalImage={setModalImage}
          modalError={modalError}
          saveModalRecord={saveModalRecord}
          csrfToken={csrfToken}
        />
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
