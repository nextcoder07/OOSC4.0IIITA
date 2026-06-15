import { useCallback, useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Footer from './components/Footer.jsx'
import ImageUploader from './components/ImageUploader.jsx'
import HomePage from './pages/HomePage.jsx'

const Registration = lazy(() => import('./components/Registration.jsx'))
const SchedulePage = lazy(() => import('./pages/SchedulePage.jsx'))
const SpeakersPage = lazy(() => import('./pages/SpeakersPage.jsx'))
const SponsorsPage = lazy(() => import('./pages/SponsorsPage.jsx'))
const TeamPage = lazy(() => import('./pages/TeamPage.jsx'))
const HackathonPage = lazy(() => import('./pages/HackathonPage.jsx'))
const ContactPage = lazy(() => import('./pages/ContactPage.jsx'))
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage.jsx'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage.jsx'))
const TermsOfUsePage = lazy(() => import('./pages/TermsOfUsePage.jsx'))
const AboutPage = lazy(() => import('./pages/aboutpage.jsx'))

import ChatBot from './components/ChatBot.jsx'
import {
  aboutData,
  heroData,
} from './data.js'
import './App.css'
import { Settings, X, Sun, Moon } from 'lucide-react'
// Eagerly load all page styles to fix CSS bugs caused by cross-file dependencies and lazy-loading
import './pages/HomePage.css'
import './pages/SchedulePage.css'
import './pages/SpeakersPage.css'
import './pages/SponsorsPage.css'
import './pages/TeamPage.css'
import './pages/HackathonPage.css'
import './pages/ContactPage.css'
import './pages/AdminLoginPage.css'
import './pages/PolicyPage.css'
import './pages/aboutpage.css'

function App() {
  const [adminMode, setAdminMode] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('oosc-theme')
    return stored === 'light' ? 'bright' : (stored || 'dark')
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('oosc-theme', theme)
  }, [theme])

  // Auth Inputs
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [adminMessage, setAdminMessage] = useState('')
  const [uploadUrl, setUploadUrl] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalResource, setModalResource] = useState('')
  const [modalMode, setModalMode] = useState('create')
  const [modalData, setModalData] = useState({})
  const [modalError, setModalError] = useState('')
  const [configModalOpen, setConfigModalOpen] = useState(false)

  const [hero] = useState(heroData)
  const [about] = useState(aboutData)
  const [speakers, setSpeakers] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [schedule, setSchedule] = useState([])
  const [team, setTeam] = useState([])
  const [apiError, setApiError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [formStatus, setFormStatus] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const headerRef = useRef(null)
  const rafRef = useRef(null)

  const scheduleNavbarGlow = useCallback((x, y) => {
    const nav = headerRef.current
    if (!nav) return

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      if (!nav) return
      nav.style.setProperty('--mouse-x', `${x}px`)
      nav.style.setProperty('--mouse-y', `${y}px`)
      nav.style.setProperty('--glow-opacity', '1')
      rafRef.current = null
    })
  }, [])

  const handleNavbarPointerMove = useCallback((event) => {
    const nav = headerRef.current
    if (!nav) return
    const rect = nav.getBoundingClientRect()
    scheduleNavbarGlow(event.clientX - rect.left, event.clientY - rect.top)
  }, [scheduleNavbarGlow])

  const handleNavbarPointerLeave = useCallback(() => {
    const nav = headerRef.current
    if (!nav) return
    nav.style.setProperty('--glow-opacity', '0')
  }, [])

  const handleNavbarPointerEnter = useCallback(() => {
    const nav = headerRef.current
    if (!nav) return
    nav.style.setProperty('--glow-opacity', '1')
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  useEffect(() => {
    const onPointerUp = () => {
      const nav = headerRef.current
      if (!nav) return
      nav.style.setProperty('--glow-opacity', '0')
    }
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    return () => window.removeEventListener('pointerup', onPointerUp)
  }, [])

  const [siteConfig, setSiteConfig] = useState({})

  // Schedule page active day tab
  const [activeDay, setActiveDay] = useState('Aug 28')

  // Drag and drop state variables
  const [draggedResource, setDraggedResource] = useState(null)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [draggedCategory, setDraggedCategory] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  // React Router
  const routerNavigate = useNavigate()
  const location = useLocation()
  const currentPage = location.pathname === '/' ? 'home' : location.pathname.substring(1)

  const pageRoutes = useMemo(() => [
    { key: 'home', label: 'Home' },
    { key: 'about', label: 'About' },
    { key: 'hackathon', label: 'Hackathon' },
    { key: 'schedule', label: 'Schedule' },
    { key: 'speakers', label: 'Speakers' },
    { key: 'sponsors', label: 'Sponsors' },
    { key: 'team', label: 'Team' },
    { key: 'register', label: 'Register' },
    { key: 'contact', label: 'Contact' },
  ], [])

  const navigateTo = (pageKey) => {
    if (pageKey === 'admin' || pageRoutes.some((route) => route.key === pageKey)) {
      routerNavigate(pageKey === 'home' ? '/' : '/' + pageKey)
      setMobileMenuOpen(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const data = await apiFetch('/admin/me')
        setAdminMode(true)
        setAdminEmail(data.email || '')
      } catch {
        setAdminMode(false)
        setAdminEmail('')
      }
    }

    restoreSession()

    // Fetch site config
    const fetchConfig = async () => {
      try {
        const data = await apiFetch('/api/site-config')
        setSiteConfig(data)
      } catch (err) {
        console.warn('Failed to fetch site config', err)
      }
    }
    fetchConfig()
  }, [])



  // Sponsor Tiers specified in the brochure
  const sponsorCategories = useMemo(
    () => [
      'Title',
      'Co-Title',
      'Platinum',
      'Gold',
      'Bronze',
      'Supporter',
    ],
    [],
  )
  const teamCategories = useMemo(
    () => [
      'Core Team',
      'Faculty Coordinators',
      'Student Coordinators',
      'Technical Team',
      'Design Team',
      'Hospitality & Logistics Team',
      'Sponsorship',
      'Media',
      'Filming',
    ],
    [],
  )

  const sortedSponsors = useMemo(() => {
    const grouped = new Map()
    sponsors.forEach((item) => {
      const category = item.category?.trim() || 'Others'
      const normalizedCategory = category || 'Others'
      const current = grouped.get(normalizedCategory) || []
      current.push(item)
      grouped.set(normalizedCategory, current)
    })

    const ordered = []
    sponsorCategories.forEach((category) => {
      const group = grouped.get(category) || []
      ordered.push({
        category,
        sponsors: group.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
      })
      grouped.delete(category)
    })

    grouped.forEach((group, category) => {
      ordered.push({
        category,
        sponsors: group.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
      })
    })

    return ordered
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
      'Hospitality': [],
      'Sponsorship': [],
      'Media': [],
      'Filming': [],
    }

    const sortedTeam = [...team].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    sortedTeam.forEach((member) => {
      if (member.department && groups[member.department]) {
        groups[member.department].push(member)
        return
      }

      // Fallback for legacy members without explicit department
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
  }, [])

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
      { key: 'linkedin', label: 'LinkedIn URL', type: 'text' },
      { key: 'github', label: 'GitHub URL', type: 'text' },
      { key: 'sortOrder', label: 'Sort Order', type: 'number' },
    ],
    sponsors: [
      { key: 'name', label: 'Sponsor Name', type: 'text' },
      { key: 'category', label: 'Category', type: 'select', options: sponsorCategories },
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
      { key: 'role', label: 'Role / Title', type: 'text' },
      { key: 'department', label: 'Team Category', type: 'select', options: teamCategories },
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
      speakers: { name: '', title: '', bio: '', photoURL: uploadUrl || '', linkedin: '', github: '', sortOrder: speakers.length + 1, published: true },
      sponsors: { name: '', category: '', website: '', logoURL: uploadUrl || '', sortOrder: sponsors.length + 1, published: true },
      events: { title: '', description: '', date: '', time: '', type: '', sortOrder: schedule.length + 1, published: true },
      team: { name: '', role: '', department: 'Student Coordinators', contact: '', photoURL: uploadUrl || '', sortOrder: team.length + 1, published: true },
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

  const saveSiteConfig = async (key, value) => {
    try {
      await apiFetch('/api/site-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      setSiteConfig((prev) => ({ ...prev, [key]: value }))
      setAdminMessage(`Updated config for ${key}`)
    } catch (error) {
      setAdminMessage(`Failed to update config: ${error.message}`)
    }
  }

  const editRecord = (resource, item) => {
    openModal(resource, 'edit', item)
  }

  useEffect(() => {
    const loadData = async () => {
      setApiError('')
      const resources = [
        { path: '/api/speakers', setter: setSpeakers, name: 'speakers' },
        { path: '/api/sponsors', setter: setSponsors, name: 'sponsors' },
        { path: '/api/events', setter: setSchedule, name: 'events' },
        { path: '/api/team', setter: setTeam, name: 'team' },
      ]

      await Promise.all(
        resources.map(async (resource) => {
          try {
            const data = await apiFetch(resource.path)
            resource.setter(Array.isArray(data) ? data : [])
          } catch (error) {
            const message = error?.message || `${resource.name} load failed.`
            console.warn(`Failed to load ${resource.name}:`, message)
            setApiError((current) => current || `Failed to load ${resource.name}: ${message}`)
            resource.setter([])
          }
        }),
      )
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

  const handleReorder = async (resource, reorderedItems) => {
    if (!adminMode) return

    updateResourceState(resource, () => reorderedItems)
    setAdminMessage('Updating order...')

    try {
      const originalList = {
        speakers,
        sponsors,
        events: schedule,
        team,
      }[resource]

      const updates = reorderedItems.filter((item) => {
        const originalItem = originalList.find((orig) => orig.id === item.id)
        return !originalItem || originalItem.sortOrder !== item.sortOrder
      })

      if (updates.length > 0) {
        await Promise.all(
          updates.map((item) =>
            apiFetch(`/api/${resource}/${item.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item),
            })
          )
        )
      }
      setAdminMessage('Order updated successfully.')
    } catch (error) {
      console.error('Failed to update order in database:', error)
      setAdminMessage(`Error updating order: ${error.message}`)

      try {
        const freshData = await apiFetch(`/api/${resource}`)
        updateResourceState(resource, () => freshData)
      } catch (refetchError) {
        console.error('Failed to revert order:', refetchError)
      }
    }
  }

  const handleDragStart = (e, resource, index, category = null) => {
    if (!adminMode) {
      e.preventDefault()
      return
    }
    setDraggedResource(resource)
    setDraggedIndex(index)
    setDraggedCategory(category)
  }

  const handleDragOver = (e, resource, index, category = null) => {
    if (!adminMode || draggedResource !== resource || draggedCategory !== category) {
      return
    }
    e.preventDefault()
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleDragEnd = () => {
    setDraggedResource(null)
    setDraggedIndex(null)
    setDraggedCategory(null)
    setDragOverIndex(null)
  }

  const handleDrop = async (e, resource, index, category = null) => {
    e.preventDefault()
    if (!adminMode || draggedResource !== resource || draggedCategory !== category || draggedIndex === null || draggedIndex === index) {
      handleDragEnd()
      return
    }

    let activeArray = []
    if (resource === 'speakers') {
      activeArray = [...speakers].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    } else if (resource === 'sponsors') {
      activeArray = sponsors.filter((s) => s.category === category).sort((a, b) => a.sortOrder - b.sortOrder)
    } else if (resource === 'events') {
      activeArray = schedule.filter((item) => {
        const dayStr = item.date || item.dateTime || ''
        return dayStr.includes(activeDay)
      }).sort((a, b) => a.sortOrder - b.sortOrder)
    } else if (resource === 'team') {
      activeArray = categorizedTeam[category]
    }

    if (activeArray.length === 0) {
      handleDragEnd()
      return
    }

    const reordered = [...activeArray]
    const [moved] = reordered.splice(draggedIndex, 1)
    reordered.splice(index, 0, moved)

    const normalized = reordered.map((item, order) => ({
      ...item,
      sortOrder: order + 1,
    }))

    if (resource === 'speakers') {
      await handleReorder('speakers', normalized)
    } else if (resource === 'sponsors') {
      const otherSponsors = sponsors.filter((s) => s.category !== category)
      const mergedSponsors = [...otherSponsors, ...normalized]
      await handleReorder('sponsors', mergedSponsors)
    } else if (resource === 'events') {
      const otherEvents = schedule.filter((item) => {
        const dayStr = item.date || item.dateTime || ''
        return !dayStr.includes(activeDay)
      })
      const mergedEvents = [...otherEvents, ...normalized]
      await handleReorder('events', mergedEvents)
    } else if (resource === 'team') {
      const otherTeam = team.filter((member) => {
        return !activeArray.some((orig) => orig.id === member.id)
      })
      const mergedTeam = [...otherTeam, ...normalized]
      await handleReorder('team', mergedTeam)
    }

    handleDragEnd()
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

  const getPlaceholderForConfig = (key) => {
    const defaults = {
      heroTitle: hero.title,
      heroSubtitle: hero.subtitle,
      aboutTitle: about.heading,
      aboutSubtitle: about.description,
      scheduleTitle: 'Event Schedule',
      scheduleSubtitle: '...',
      speakersTitle: 'Thought Leadership',
      speakersSubtitle: 'Featured technology leaders, academics, and research engineers guiding our tracks.',
      speakersHighlight1Title: '50+ Sessions',
      speakersHighlight1Desc: 'Covering AI, Cloud, and Systems',
      speakersHighlight2Title: 'Industry Leaders',
      speakersHighlight2Desc: 'Top tech companies and academia',
      speakersCtaTitle: 'Want to share your expertise?',
      speakersCtaDesc: "We're always looking for passionate speakers to lead sessions, workshops, and panels.",
      speakersCtaLink: 'https://events.canonical.com/event/154/abstracts/',
      sponsorsTitle: 'Conference Supporters',
      sponsorsSubtitle: 'Academic institutions and corporate engineering partners supporting open systems research.',
      teamTitle: 'The Organizing Team',
      teamSubtitle: 'Meet the faculty directors and student committees hosting OOSC 4.0 at IIIT Allahabad.',
      hackathonBadge: 'OOSC 4.0 · Hackathon 2025',
      hackathonTitle: 'Build the Future of Open Systems',
      hackathonTheme: 'AI × Open Source: Powering Intelligent Infrastructure',
      hackathonPrizePool: '₹1,00,000+',
      hackathonDuration: '36 Hrs',
      hackathonTeamSize: '2–4',
      hackathonDates: 'Aug 28–30',
      hackathonVenue: 'IIITA',
      hackathonCtaReady: 'Ready to Build?',
      hackathonCtaDesc: 'Registration is open until August 10, 2025. Spots are limited — secure your team today.',
      contactTitle: 'Get in Touch',
      contactSubtitle: 'Have questions about OOSC 4.0? Reach out to our dedicated teams below.'
    }

    const formatHints = {
      hackathonProblemStatement: "Paragraph 1\\nParagraph 2...",
      hackathonTracks: "Track Title || Description\\nTrack Title 2 || Description 2...",
      hackathonEligibility: "Item 1\\nItem 2\\nItem 3...",
      hackathonTeamComposition: "Icon (Lucide Name) || Label\\nUser || Min 2 members...",
      hackathonPrizes: "Icon (Lucide Name) || Position || Amount || Description || Class (gold/silver/bronze)\\nTrophy || 1st Place || ₹50,000 || Cash + Trophies || gold...",
      hackathonSpecialPrizes: "Icon (Lucide Name) || Label\\nLightbulb || Best Innovation — ₹10,000...",
      hackathonRules: "Rule 1\\nRule 2\\nRule 3...",
      hackathonTimeline: "Label || Date/Value || Description || Status (past/active)\\nRegistration Opens || July 15 || Portal goes live || past...",
      hackathonSteps: "Step Title || Step Description\\nForm Your Team || Assemble 2-4 members...",
    }

    if (formatHints[key]) {
      return `Format: \n${formatHints[key]}`
    }
    return defaults[key] || 'Default text'
  }

  return (
    <div className="app-shell">
      <header
        ref={headerRef}
        className="site-header glass-header"
        onPointerMove={handleNavbarPointerMove}
        onPointerDown={handleNavbarPointerMove}
        onPointerEnter={handleNavbarPointerEnter}
        onPointerLeave={handleNavbarPointerLeave}
      >
        <button
          type="button"
          className="brand"
          onClick={() => navigateTo('home')}
          title="OOSC 4.0 — Back to home"
          aria-label="OOSC 4.0 home"
        >
          <img src="/OOSC_logo.png" alt="OOSC 4.0 Open Source Systems Conference logo" className="brand-logo" />
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
          <a
            href={siteConfig.speakersCtaLink || 'https://events.canonical.com/event/154/abstracts/'}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-action-btn cfp-mobile-btn"
          >
            Call for Proposal
          </a>
          {adminMode && (
            <button type="button" className="nav-action-btn logout-btn" onClick={logout}>
              Logout
            </button>
          )}
        </nav>

        {/* Header Desktop actions */}
        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={() => setTheme(theme === 'dark' ? 'bright' : 'dark')}
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <a
            href={siteConfig.speakersCtaLink || 'https://events.canonical.com/event/154/abstracts/'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-nav-cta-outline cfp-desktop-btn"
          >
            Call for Proposal
          </a>

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


          <button
            type="button"
            className="btn btn-nav-cta"
            onClick={() => navigateTo('register')}
          >
            Register Now
          </button>
          {adminMode && (
            <button type="button" className="btn btn-admin active" onClick={logout}>
              Logout
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
                <button type="button" className="btn btn-admin-quick" onClick={() => setConfigModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Settings size={16} /> Edit Site Text</button>
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
      <main className={`page-body ${currentPage === 'home' ? 'page-body--home' : currentPage === 'hackathon' ? 'page-body--hackathon' : 'page-body--inner'}`}>
        {apiError && (
          <div className="api-error-banner" style={{ margin: '0 1rem 1rem', padding: '1rem', background: 'rgba(248, 113, 113, 0.1)', color: '#FCA5A5', borderRadius: '10px', border: '1px solid #FCA5A5' }}>
            <strong>Data load issue:</strong> {apiError}
          </div>
        )}
        <ErrorBoundary>
          <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted-strong)' }}>Loading view...</div>}>
            <Routes>
              <Route path="/" element={
                <HomePage hero={hero} about={about} siteConfig={siteConfig} navigateTo={navigateTo} />
              } />
              <Route path="/about" element={
                <AboutPage siteConfig={siteConfig} about={about} />
              } />
              <Route path="/schedule" element={
                <SchedulePage
                  siteConfig={siteConfig} adminMode={adminMode} filteredSchedule={filteredSchedule}
                  activeDay={activeDay} setActiveDay={setActiveDay}
                  draggedResource={draggedResource} draggedIndex={draggedIndex} dragOverIndex={dragOverIndex}
                  handleDragStart={handleDragStart} handleDragOver={handleDragOver}
                  handleDragEnd={handleDragEnd} handleDrop={handleDrop}
                  openModal={openModal} editRecord={editRecord} deleteRecord={deleteRecord}
                  setSchedule={setSchedule} getEventTime={getEventTime} getEventDesc={getEventDesc}
                />
              } />
              <Route path="/speakers" element={
                <SpeakersPage
                  siteConfig={siteConfig} adminMode={adminMode} speakers={speakers}
                  draggedResource={draggedResource} draggedIndex={draggedIndex} dragOverIndex={dragOverIndex}
                  handleDragStart={handleDragStart} handleDragOver={handleDragOver}
                  handleDragEnd={handleDragEnd} handleDrop={handleDrop}
                  openModal={openModal} editRecord={editRecord} deleteRecord={deleteRecord}
                  setSpeakers={setSpeakers}
                />
              } />
              <Route path="/sponsors" element={
                <SponsorsPage
                  siteConfig={siteConfig} adminMode={adminMode} sortedSponsors={sortedSponsors}
                  draggedResource={draggedResource} draggedIndex={draggedIndex}
                  draggedCategory={draggedCategory} dragOverIndex={dragOverIndex}
                  handleDragStart={handleDragStart} handleDragOver={handleDragOver}
                  handleDragEnd={handleDragEnd} handleDrop={handleDrop}
                  openModal={openModal} editRecord={editRecord} deleteRecord={deleteRecord}
                  setSponsors={setSponsors}
                />
              } />
              <Route path="/team" element={
                <TeamPage
                  siteConfig={siteConfig} adminMode={adminMode} categorizedTeam={categorizedTeam}
                  draggedResource={draggedResource} draggedIndex={draggedIndex}
                  draggedCategory={draggedCategory} dragOverIndex={dragOverIndex}
                  handleDragStart={handleDragStart} handleDragOver={handleDragOver}
                  handleDragEnd={handleDragEnd} handleDrop={handleDrop}
                  openModal={openModal} editRecord={editRecord} deleteRecord={deleteRecord}
                  setTeam={setTeam}
                />
              } />
              <Route path="/hackathon" element={
                <HackathonPage siteConfig={siteConfig} navigateTo={navigateTo} />
              } />
              <Route path="/register" element={
                <Registration onSubmit={() => setAdminMessage('Registration interest captured successfully!')} />
              } />
              <Route path="/contact" element={
                <ContactPage
                  siteConfig={siteConfig} form={form} setForm={setForm}
                  formStatus={formStatus} handleFormSubmit={handleFormSubmit}
                />
              } />
              <Route path="/admin" element={
                <AdminLoginPage
                  siteConfig={siteConfig} loginEmail={loginEmail} setLoginEmail={setLoginEmail}
                  loginPassword={loginPassword} setLoginPassword={setLoginPassword}
                  handleLogin={handleLogin} adminMessage={adminMessage}
                />
              } />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfUsePage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      {modalOpen && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}>
          <div className="admin-modal-panel glass-card">
            <div className="admin-modal-header">
              <h3>{modalMode === 'create' ? `Add New ${resourceLabels[modalResource]}` : `Edit ${resourceLabels[modalResource]}`}</h3>
              <button type="button" className="btn-close-modal" onClick={closeModal} aria-label="Close dialog"><X size={20} /></button>
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
                  ) : field.type === 'select' ? (
                    <select
                      id={`modal-${field.key}`}
                      value={modalData[field.key] ?? ''}
                      onChange={(event) => setModalField(field.key, event.target.value)}
                      className="form-control"
                    >
                      <option value="" disabled>Select {field.label}</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
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

      {configModalOpen && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" onClick={(e) => { if (e.target === e.currentTarget) setConfigModalOpen(false) }}>
          <div className="admin-modal-panel glass-card admin-modal-panel--narrow">
            <div className="admin-modal-header">
              <h3>Edit Site Text Configurations</h3>
              <button type="button" className="btn-close-modal" onClick={() => setConfigModalOpen(false)} aria-label="Close dialog"><X size={20} /></button>
            </div>
            <div className="admin-modal-body">
              <p className="field-tip mb-tip">
                Leave empty to use default values. Changes save immediately.
              </p>
              {[
                {
                  groupName: 'Hero & About',
                  fields: [
                    { key: 'heroTitle', label: 'Hero Title' },
                    { key: 'heroSubtitle', label: 'Hero Subtitle' },
                    { key: 'aboutTitle', label: 'About Heading' },
                    { key: 'aboutSubtitle', label: 'About Description' },
                  ]
                },
                {
                  groupName: 'Schedule & Team',
                  fields: [
                    { key: 'scheduleTitle', label: 'Schedule Title' },
                    { key: 'scheduleSubtitle', label: 'Schedule Subtitle' },
                    { key: 'teamTitle', label: 'Team Title' },
                    { key: 'teamSubtitle', label: 'Team Subtitle' },
                  ]
                },
                {
                  groupName: 'Speakers & Sponsors',
                  fields: [
                    { key: 'speakersTitle', label: 'Speakers Title' },
                    { key: 'speakersSubtitle', label: 'Speakers Subtitle' },
                    { key: 'speakersHighlight1Title', label: 'Speakers Highlight 1 Title' },
                    { key: 'speakersHighlight1Desc', label: 'Speakers Highlight 1 Desc' },
                    { key: 'speakersHighlight2Title', label: 'Speakers Highlight 2 Title' },
                    { key: 'speakersHighlight2Desc', label: 'Speakers Highlight 2 Desc' },
                    { key: 'speakersCtaTitle', label: 'Speakers CTA Title' },
                    { key: 'speakersCtaDesc', label: 'Speakers CTA Desc' },
                    { key: 'speakersCtaLink', label: 'Speakers CTA Link' },
                    { key: 'sponsorsTitle', label: 'Sponsors Title' },
                    { key: 'sponsorsSubtitle', label: 'Sponsors Subtitle' },
                  ]
                },
                {
                  groupName: 'Hackathon Quick Details',
                  fields: [
                    { key: 'hackathonBadge', label: 'Hackathon Badge' },
                    { key: 'hackathonTitle', label: 'Hackathon Title' },
                    { key: 'hackathonTheme', label: 'Hackathon Theme' },
                    { key: 'hackathonPrizePool', label: 'Hackathon Prize Pool' },
                    { key: 'hackathonDuration', label: 'Hackathon Duration' },
                    { key: 'hackathonTeamSize', label: 'Hackathon Team Size' },
                    { key: 'hackathonDates', label: 'Hackathon Dates' },
                    { key: 'hackathonVenue', label: 'Hackathon Venue' },
                  ]
                },
                {
                  groupName: 'Hackathon Content (Advanced)',
                  fields: [
                    { key: 'hackathonProblemStatement', label: 'Problem Statement', type: 'textarea' },
                    { key: 'hackathonTracks', label: 'Tracks (JSON or List)', type: 'textarea' },
                    { key: 'hackathonEligibility', label: 'Eligibility List', type: 'textarea' },
                    { key: 'hackathonTeamComposition', label: 'Team Composition List', type: 'textarea' },
                    { key: 'hackathonPrizes', label: 'Prizes List', type: 'textarea' },
                    { key: 'hackathonSpecialPrizes', label: 'Special Prizes List', type: 'textarea' },
                    { key: 'hackathonRules', label: 'Rules List', type: 'textarea' },
                    { key: 'hackathonTimeline', label: 'Timeline Dates', type: 'textarea' },
                    { key: 'hackathonSteps', label: 'Registration Steps', type: 'textarea' },
                    { key: 'hackathonCtaReady', label: 'CTA Heading' },
                    { key: 'hackathonCtaDesc', label: 'CTA Description' },
                  ]
                },
                {
                  groupName: 'Contact Information',
                  fields: [
                    { key: 'contactTitle', label: 'Contact Title' },
                    { key: 'contactSubtitle', label: 'Contact Subtitle' },
                  ]
                }
              ].map(group => (
                <div key={group.groupName} className="config-section-group">
                  <h4 className="config-section-title">{group.groupName}</h4>
                  <div className="config-section-fields">
                    {group.fields.map(field => (
                      <div key={field.key} className="form-group modal-form-group">
                        <label>{field.label}</label>
                        <div className="flex-gap-sm">
                          {field.type === 'textarea' ? (
                            <textarea
                              value={siteConfig[field.key] || ''}
                              onChange={(e) => setSiteConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                              onFocus={(e) => {
                                if (e.target.dataset.orig === undefined) {
                                  e.target.dataset.orig = e.target.value;
                                }
                              }}
                              onBlur={(e) => {
                                const val = e.target.value.trim();
                                if (val !== (e.target.dataset.orig || '').trim()) {
                                  saveSiteConfig(field.key, val);
                                  e.target.dataset.orig = val;
                                }
                              }}
                              className="form-control"
                              placeholder={getPlaceholderForConfig(field.key)}
                              rows="6"
                            />
                          ) : (
                            <input
                              type="text"
                              value={siteConfig[field.key] || ''}
                              onChange={(e) => setSiteConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                              onFocus={(e) => {
                                if (e.target.dataset.orig === undefined) {
                                  e.target.dataset.orig = e.target.value;
                                }
                              }}
                              onBlur={(e) => {
                                const val = e.target.value.trim();
                                if (val !== (e.target.dataset.orig || '').trim()) {
                                  saveSiteConfig(field.key, val);
                                  e.target.dataset.orig = val;
                                }
                              }}
                              className="form-control"
                              placeholder={getPlaceholderForConfig(field.key)}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="admin-modal-actions">
              <button type="button" className="btn btn-primary" onClick={() => setConfigModalOpen(false)}>
                Done
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
            <button type="button" onClick={() => setAdminMessage('')}><X size={16} /></button>
          </div>
        </div>
      )}

      {/* Chatbot Assistant */}
      <ChatBot navigateTo={navigateTo} />
    </div>
  )
}

export default App
