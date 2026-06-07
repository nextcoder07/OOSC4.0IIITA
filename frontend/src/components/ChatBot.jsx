import { useState, useRef, useEffect, useCallback } from 'react'
import './ChatBot.css'

// ─── KNOWLEDGE BASE ────────────────────────────────────────────────────────────
const knowledgeBase = [
  // General / What is OOSC
  {
    keywords: ['what is oosc', 'about oosc', 'oosc 4.0', 'what is this', 'tell me about', 'about the conference', 'about event', 'what is this event', 'what is this conference'],
    answer: `**OOSC 4.0** is the annual *Open Source Systems Conference* at **IIIT Allahabad**. It brings together researchers, developers, students, and industry leaders to explore distributed systems, cloud-native platforms, open source tooling, and collaborative innovation.`,
    nav: { label: 'Visit Home Page', route: 'home' },
  },
  // Dates
  {
    keywords: ['when', 'date', 'dates', 'when is', 'when does', 'conference date', 'event date', 'start date', 'timing', 'which month', 'august'],
    answer: `📅 **OOSC 4.0** runs from **August 28–30, 2026** — that's 3 full days of talks, workshops, hackathons, and networking!`,
    nav: { label: 'See Full Schedule', route: 'schedule' },
  },
  // Venue / Location
  {
    keywords: ['where', 'venue', 'location', 'address', 'campus', 'place', 'iiita', 'iiit allahabad', 'prayagraj', 'allahabad', 'how to reach', 'directions'],
    answer: `📍 The conference is held at **IIIT Allahabad** — CC-3 Building, Devghat, Jhalwa, Prayagraj, Uttar Pradesh 211015. You can find us on Google Maps from the Contact page!`,
    nav: { label: 'View Location & Map', route: 'contact' },
  },
  // Registration
  {
    keywords: ['register', 'registration', 'sign up', 'signup', 'how to join', 'enroll', 'apply', 'how to register', 'join', 'participate', 'form', 'google form'],
    answer: `📝 Registration is done via Google Form! Click below to go to our registration page and secure your spot. Hurry — seats are limited!`,
    nav: { label: 'Register Now', route: 'register' },
  },
  // Speakers
  {
    keywords: ['speaker', 'speakers', 'who is speaking', 'keynote', 'talks', 'presenters', 'guest', 'guests', 'who are the speakers'],
    answer: `🎤 We have an incredible lineup of **20+ speakers** from academia, startups, and enterprise engineering. They'll cover topics like distributed systems, AI, open source governance, and more.`,
    nav: { label: 'Meet the Speakers', route: 'speakers' },
  },
  // Sponsors
  {
    keywords: ['sponsor', 'sponsors', 'sponsorship', 'partners', 'who sponsors', 'sponsor tiers', 'become a sponsor', 'sponsoring'],
    answer: `🤝 OOSC 4.0 is supported by **10+ enterprise sponsors** across tiers: Title, Platinum, Gold, Silver, Community, and Media Partners. Interested in sponsoring? Reach out via the Contact page!`,
    nav: { label: 'View Sponsors', route: 'sponsors' },
  },
  // Schedule
  {
    keywords: ['schedule', 'agenda', 'timeline', 'itinerary', 'program', 'timetable', 'what happens', 'day 1', 'day 2', 'day 3', 'sessions'],
    answer: `📋 The 3-day schedule is packed:\n• **Day 1 (Aug 28)** — Opening Keynote, Hackathon Launch, Networking\n• **Day 2 (Aug 29)** — Workshops, Talks, Mentor Hours\n• **Day 3 (Aug 30)** — Panels, Closing Presentations, Awards`,
    nav: { label: 'View Full Schedule', route: 'schedule' },
  },
  // Team
  {
    keywords: ['team', 'organizers', 'who organized', 'organizing committee', 'core team', 'committee', 'volunteers', 'faculty'],
    answer: `👥 OOSC 4.0 is organized by the student and faculty community of **IIIT Allahabad**. Our team includes Faculty Coordinators, Student Coordinators, Technical Team, Design Team, and Hospitality & Logistics.`,
    nav: { label: 'Meet the Team', route: 'team' },
  },
  // Hackathon
  {
    keywords: ['hackathon', 'hack', 'coding challenge', 'build', 'prototype', 'competition', 'hacking'],
    answer: `⚡ The **OOSC 4.0 Hackathon** is a 36-hour competition with a prize pool of **₹1,00,000+**! Teams of 2–4 members work on AI × Open Source challenges across 3 tracks:\n\n• **Track A** — Intelligent DevOps\n• **Track B** — Smart Data Systems\n• **Track C** — Open AI Infra`,
    nav: { label: 'Hackathon Details', route: 'hackathon' },
  },
  // Hackathon Prizes
  {
    keywords: ['prize', 'prizes', 'reward', 'rewards', 'winning', 'how much', 'prize pool', 'prize money', 'cash prize', 'winner'],
    answer: `🏆 **Prize breakdown:**\n• 🥇 1st Place — ₹50,000 + trophies + internship fast-track\n• 🥈 2nd Place — ₹30,000 + mentorship sessions\n• 🥉 3rd Place — ₹20,000 + swag kits\n\n**Special Awards:** Best Innovation (₹10K), Best Open-Source Impact (₹10K), Best UI/UX (₹5K), Best Rookie (₹5K), Best AI Integration (₹5K)`,
    nav: { label: 'See All Prizes', route: 'hackathon' },
  },
  // Hackathon Rules
  {
    keywords: ['rules', 'guidelines', 'hackathon rules', 'code of conduct', 'plagiarism', 'allowed', 'not allowed'],
    answer: `📋 Key rules:\n• All code must be written during Aug 28–30\n• Projects must be open-sourced (MIT/Apache/GPL)\n• Submit prototype + 3-min demo video + README\n• No undisclosed AI-generated code\n• Max 1 team per participant\n• Must follow OOSC Code of Conduct`,
    nav: { label: 'Full Rules & Guidelines', route: 'hackathon' },
  },
  // Hackathon Eligibility
  {
    keywords: ['eligible', 'eligibility', 'who can participate', 'who can join', 'team size', 'students only', 'international', 'alumni'],
    answer: `👤 **Eligibility:**\n• UG & PG students from any Indian university\n• Research scholars & PhD students welcome\n• IIITA students get priority registration\n• International students in Indian universities eligible\n• Alumni (≤2 years) as wild-card entries\n• **Team size:** 2–4 members, cross-institution allowed`,
    nav: { label: 'Check Eligibility', route: 'hackathon' },
  },
  // Contact
  {
    keywords: ['contact', 'reach', 'email', 'phone', 'call', 'whatsapp', 'get in touch', 'inquiry', 'question', 'ask', 'help', 'support'],
    answer: `📬 You can reach the organizers:\n• ✉️ **Email:** contact@oosc4.0.iiita.ac.in\n• 📞 **Call/WhatsApp:** +91 7318 295 789\n\nOr use the contact form on our website!`,
    nav: { label: 'Go to Contact Page', route: 'contact' },
  },
  // Workshops
  {
    keywords: ['workshop', 'workshops', 'hands-on', 'lab', 'labs', 'practical', 'interactive'],
    answer: `⚙️ We have interactive workshops covering:\n• Cloud Native Observability\n• Deployment orchestration\n• API architectures\n• Systems diagnostics\n\nThese are hands-on labs designed for developers of all levels!`,
    nav: { label: 'View Schedule', route: 'schedule' },
  },
  // Networking
  {
    keywords: ['networking', 'meet', 'connect', 'connections', 'community', 'peers', 'mentors', 'mentorship'],
    answer: `🤝 OOSC 4.0 offers incredible networking:\n• **Networking Hub** for connecting with faculty, contributors, and engineers\n• **Mentor Hours** — 1-on-1 sessions with senior open source contributors\n• **Sponsor Showcase** — meet company reps and explore opportunities`,
    nav: { label: 'View Schedule', route: 'schedule' },
  },
  // Free / Cost
  {
    keywords: ['free', 'cost', 'fee', 'ticket', 'price', 'paid', 'how much does', 'charges', 'entry fee'],
    answer: `💰 Registration details including any fees are available on our registration page. IIITA students may receive priority/subsidized access. Check the registration form for current pricing!`,
    nav: { label: 'Check Registration', route: 'register' },
  },
  // Code Sprint
  {
    keywords: ['code sprint', 'sprint', 'contribution', 'contribute', 'open source contribution', 'github'],
    answer: `🌐 **Code Sprints** are a core part of OOSC 4.0! You can directly push contributions to whitelisted repositories and explore open system governance protocols during the event.`,
    nav: { label: 'Learn More', route: 'home' },
  },
  // Research / Academic
  {
    keywords: ['research', 'academic', 'paper', 'papers', 'publication', 'thesis', 'phd'],
    answer: `🔬 OOSC 4.0 bridges academia and open source with:\n• **Research talks** on server design, kernel optimizations, and databases\n• **Panel discussions** on open source governance\n• Access to developer workshops and server labs`,
    nav: { label: 'View Speakers', route: 'speakers' },
  },
  // Accommodation
  {
    keywords: ['accommodation', 'stay', 'hotel', 'hostel', 'where to stay', 'lodge', 'lodging', 'room'],
    answer: `🏨 For accommodation queries, please contact the organizing team directly. They can assist with on-campus or nearby hotel arrangements.\n\n📞 +91 7318 295 789\n✉️ contact@oosc4.0.iiita.ac.in`,
    nav: { label: 'Contact Organizers', route: 'contact' },
  },
  // Food
  {
    keywords: ['food', 'lunch', 'dinner', 'breakfast', 'catering', 'meals', 'refreshment'],
    answer: `🍽️ Meals and refreshments will be provided during the conference. Lunch & sponsor showcases are scheduled on Day 1! Specific dietary needs can be communicated during registration.`,
    nav: { label: 'View Schedule', route: 'schedule' },
  },
  // Certificate
  {
    keywords: ['certificate', 'certificates', 'certification', 'will i get', 'participation certificate', 'proof'],
    answer: `📜 Yes! All participants will receive participation certificates. Hackathon winners get additional winner certificates and trophies. Details will be shared closer to the event.`,
  },
  // Submission
  {
    keywords: ['submit', 'submission', 'devpost', 'how to submit', 'deadline', 'submission deadline'],
    answer: `📤 **Hackathon submissions:**\n• **Deadline:** August 30, 9:00 PM IST\n• **Platform:** DevPost\n• **Required:** GitHub repo link + 3-min demo video + project description\n• Top 10 teams present live to the jury (5 min each)`,
    nav: { label: 'Hackathon Details', route: 'hackathon' },
  },
  // Greetings
  {
    keywords: ['hi', 'hello', 'hey', 'hola', 'namaste', 'good morning', 'good evening', 'good afternoon', 'howdy', 'sup', 'yo'],
    answer: `👋 Hey there! Welcome to OOSC 4.0! I'm here to help you navigate the website and answer your questions. What would you like to know?`,
  },
  // Thanks
  {
    keywords: ['thanks', 'thank you', 'thx', 'appreciate', 'ty', 'great', 'awesome', 'cool', 'nice'],
    answer: `😊 You're welcome! Feel free to ask if you have any more questions. See you at OOSC 4.0! 🚀`,
  },
  // Navigation help
  {
    keywords: ['navigate', 'navigation', 'pages', 'menu', 'website', 'sitemap', 'where can i find', 'show me'],
    answer: `🗺️ Here are all the pages on our website:\n\n• 🏠 **Home** — Event overview & highlights\n• ⚡ **Hackathon** — Tracks, prizes, rules\n• 📋 **Schedule** — 3-day conference timeline\n• 🎤 **Speakers** — Speaker profiles & bios\n• 🤝 **Sponsors** — Our sponsor partners\n• 👥 **Team** — Organizing committee\n• 📝 **Register** — Sign up for the event\n• 📬 **Contact** — Reach the organizers\n\nUse the quick buttons below or just ask me!`,
  },
  // Bye
  {
    keywords: ['bye', 'goodbye', 'see you', 'later', 'exit', 'close', 'quit'],
    answer: `👋 Goodbye! Hope to see you at OOSC 4.0 — Aug 28–30 at IIIT Allahabad. Take care! 🎉`,
  },
]

// Quick action chips shown at the start
const quickActions = [
  { label: '📅 When & Where?', query: 'when and where is the conference?' },
  { label: '📝 Register', query: 'how to register?' },
  { label: '⚡ Hackathon', query: 'tell me about the hackathon' },
  { label: '🎤 Speakers', query: 'who are the speakers?' },
  { label: '📋 Schedule', query: 'what is the schedule?' },
  { label: '🏆 Prizes', query: 'what are the prizes?' },
  { label: '📬 Contact', query: 'how to contact organizers?' },
  { label: '🗺️ All Pages', query: 'show me all pages' },
]

// ─── FUZZY MATCHER ─────────────────────────────────────────────────────────────
function fuzzyMatch(input, keywords) {
  const normalized = input.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
  const inputWords = normalized.split(/\s+/)

  let bestScore = 0

  for (const keyword of keywords) {
    const kwNormalized = keyword.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
    const kwWords = kwNormalized.split(/\s+/)

    // Exact phrase match — highest priority
    if (normalized.includes(kwNormalized)) {
      const phraseScore = kwNormalized.length / Math.max(normalized.length, 1)
      bestScore = Math.max(bestScore, 0.7 + phraseScore * 0.3)
    }

    // Word overlap scoring
    let matchedWords = 0
    for (const kw of kwWords) {
      for (const iw of inputWords) {
        if (iw === kw) {
          matchedWords += 1
          break
        } else if (iw.length > 3 && kw.length > 3) {
          // Levenshtein-like tolerance for typos (1 char off)
          if (iw.includes(kw) || kw.includes(iw)) {
            matchedWords += 0.7
            break
          }
          // Simple edit distance check (swap or off-by-one)
          if (Math.abs(iw.length - kw.length) <= 1) {
            let diffs = 0
            const longer = iw.length >= kw.length ? iw : kw
            const shorter = iw.length < kw.length ? iw : kw
            for (let i = 0; i < shorter.length; i++) {
              if (shorter[i] !== longer[i]) diffs++
            }
            if (diffs <= 1) {
              matchedWords += 0.5
              break
            }
          }
        }
      }
    }

    if (kwWords.length > 0) {
      const wordScore = matchedWords / kwWords.length
      bestScore = Math.max(bestScore, wordScore * 0.85)
    }
  }

  return bestScore
}

function findBestMatch(userInput) {
  let bestEntry = null
  let bestScore = 0

  for (const entry of knowledgeBase) {
    const score = fuzzyMatch(userInput, entry.keywords)
    if (score > bestScore) {
      bestScore = score
      bestEntry = entry
    }
  }

  if (bestScore >= 0.35 && bestEntry) {
    return bestEntry
  }

  return null
}

// ─── COMPONENT ─────────────────────────────────────────────────────────────────
export default function ChatBot({ navigateTo }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `👋 Hi! I'm the **OOSC 4.0 Assistant**. I can help you navigate the website, find event info, and answer your questions.\n\nTry the quick actions below or type your question!`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
    if (isOpen) setHasUnread(false)
  }, [isOpen])

  const addBotMessage = useCallback((text, nav = null) => {
    setIsTyping(true)
    const delay = Math.min(400 + text.length * 2, 1200)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text, nav, timestamp: new Date() },
      ])
      setIsTyping(false)
      if (!isOpen) setHasUnread(true)
    }, delay)
  }, [isOpen])

  const handleSend = useCallback((text = null) => {
    const userText = (text || input).trim()
    if (!userText) return

    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, timestamp: new Date() },
    ])
    setInput('')

    const match = findBestMatch(userText)
    if (match) {
      addBotMessage(match.answer, match.nav || null)
    } else {
      addBotMessage(
        `🤔 I'm not sure I understood that. Here are some things I can help with:\n\n• Conference dates, venue & schedule\n• Hackathon details, prizes & rules\n• Speakers & sponsors info\n• Registration & contact\n\nOr try one of the quick action buttons! If you need personal help, visit our **Contact page**.`,
        { label: 'Go to Contact Page', route: 'contact' }
      )
    }
  }, [input, addBotMessage])

  const handleQuickAction = (query) => {
    handleSend(query)
  }

  const handleNavClick = (route) => {
    if (navigateTo) {
      navigateTo(route)
      setIsOpen(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Simple markdown-like rendering (bold, line breaks, bullet points)
  const renderMessageText = (text) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      // Bold
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Bullet points
      if (processed.trim().startsWith('•')) {
        return (
          <div key={i} className="cb-bullet-line" dangerouslySetInnerHTML={{ __html: processed }} />
        )
      }
      if (processed.trim() === '') {
        return <div key={i} className="cb-line-break" />
      }
      return (
        <div key={i} className="cb-text-line" dangerouslySetInnerHTML={{ __html: processed }} />
      )
    })
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        type="button"
        className={`cb-toggle-btn ${isOpen ? 'cb-toggle-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {hasUnread && <span className="cb-unread-dot" />}
          </>
        )}
      </button>

      {/* Chat window */}
      <div className={`cb-window ${isOpen ? 'cb-window-open' : ''}`}>
        {/* Header */}
        <div className="cb-header">
          <div className="cb-header-info">
            <div className="cb-avatar">
              <span>🤖</span>
            </div>
            <div>
              <h4 className="cb-header-title">OOSC 4.0 Assistant</h4>
              <span className="cb-status-dot" />
              <span className="cb-status-text">Online</span>
            </div>
          </div>
          <button
            type="button"
            className="cb-close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="cb-messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`cb-msg ${msg.sender === 'bot' ? 'cb-msg-bot' : 'cb-msg-user'}`}
            >
              {msg.sender === 'bot' && (
                <div className="cb-msg-avatar">🤖</div>
              )}
              <div className={`cb-msg-bubble ${msg.sender === 'bot' ? 'cb-bubble-bot' : 'cb-bubble-user'}`}>
                <div className="cb-msg-content">
                  {renderMessageText(msg.text)}
                </div>
                {msg.nav && (
                  <button
                    type="button"
                    className="cb-nav-btn"
                    onClick={() => handleNavClick(msg.nav.route)}
                  >
                    {msg.nav.label} →
                  </button>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="cb-msg cb-msg-bot">
              <div className="cb-msg-avatar">🤖</div>
              <div className="cb-msg-bubble cb-bubble-bot cb-typing-bubble">
                <div className="cb-typing-dots">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 2 && (
          <div className="cb-quick-actions">
            {quickActions.map((action, i) => (
              <button
                key={i}
                type="button"
                className="cb-quick-chip"
                onClick={() => handleQuickAction(action.query)}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="cb-input-area">
          <input
            ref={inputRef}
            type="text"
            className="cb-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about OOSC 4.0..."
            disabled={isTyping}
          />
          <button
            type="button"
            className="cb-send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
