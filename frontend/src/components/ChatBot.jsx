import { useState, useRef, useEffect, useCallback } from 'react'
import './ChatBot.css'

// ─── KNOWLEDGE BASE ────────────────────────────────────────────────────────────
// Each entry has: intents (question-word patterns), phrases (multi-word), words (single), answer, nav
const knowledgeBase = [
  {
    id: 'about',
    intents: ['what is oosc', 'what is this conference', 'what is this event', 'tell me about oosc', 'about this event'],
    phrases: ['about oosc', 'about the conference', 'about event', 'oosc 4.0', 'open source conference'],
    words: [],
    answer: `**OOSC 4.0** is the annual *Open Source Systems Conference* at **IIIT Allahabad**. It brings together researchers, developers, students, and industry leaders to explore distributed systems, cloud-native platforms, open source tooling, and collaborative innovation.`,
    nav: { label: 'Visit Home Page', route: 'home' },
  },
  {
    id: 'dates',
    intents: ['when is the conference', 'when does it start', 'when is oosc', 'what are the dates', 'which month'],
    phrases: ['conference date', 'event date', 'start date', 'event dates'],
    words: ['dates'],
    answer: `📅 **OOSC 4.0** runs from **August 28–30, 2026** — that's 3 full days of talks, workshops, hackathons, and networking!`,
    nav: { label: 'See Full Schedule', route: 'schedule' },
  },
  {
    id: 'venue',
    intents: ['where is the conference', 'where is it held', 'where is oosc', 'how to reach', 'what is the venue'],
    phrases: ['venue location', 'iiit allahabad', 'conference venue', 'event location'],
    words: ['venue', 'location', 'address', 'campus', 'prayagraj', 'allahabad', 'directions'],
    answer: `📍 The conference is held at **IIIT Allahabad** — CC-3 Building, Devghat, Jhalwa, Prayagraj, Uttar Pradesh 211015.`,
    nav: { label: 'View Location & Map', route: 'contact' },
  },
  {
    id: 'register',
    intents: ['how to register', 'how do i register', 'how to sign up', 'how to join', 'how to apply', 'how to participate', 'can i register'],
    phrases: ['sign up', 'google form', 'registration form'],
    words: ['register', 'registration', 'signup', 'enroll'],
    answer: `📝 Registration is done via Google Form! Click below to go to our registration page and secure your spot. Hurry — seats are limited!`,
    nav: { label: 'Register Now', route: 'register' },
  },
  {
    id: 'speakers',
    intents: ['who are the speakers', 'who is speaking', 'who are the guests', 'tell me about speakers'],
    phrases: ['keynote speaker', 'guest speaker', 'speaker list'],
    words: ['speakers', 'keynote', 'presenters'],
    answer: `🎤 We have an incredible lineup of **20+ speakers** from academia, startups, and enterprise engineering. They'll cover topics like distributed systems, AI, open source governance, and more.`,
    nav: { label: 'Meet the Speakers', route: 'speakers' },
  },
  {
    id: 'sponsors',
    intents: ['who are the sponsors', 'who sponsors oosc', 'how to become a sponsor', 'tell me about sponsors'],
    phrases: ['sponsor tiers', 'become a sponsor', 'sponsorship opportunities'],
    words: ['sponsors', 'sponsorship', 'sponsoring'],
    answer: `🤝 OOSC 4.0 is supported by **10+ enterprise sponsors** across tiers: Title, Platinum, Gold, Silver, Community, and Media Partners. Interested in sponsoring? Reach out via the Contact page!`,
    nav: { label: 'View Sponsors', route: 'sponsors' },
  },
  {
    id: 'schedule',
    intents: ['what is the schedule', 'what happens each day', 'tell me the agenda', 'what are the sessions'],
    phrases: ['day 1', 'day 2', 'day 3', 'conference schedule', 'event schedule'],
    words: ['schedule', 'agenda', 'timeline', 'itinerary', 'timetable', 'sessions'],
    answer: `📋 The 3-day schedule is packed:\n• **Day 1 (Aug 28)** — Opening Keynote, Hackathon Launch, Networking\n• **Day 2 (Aug 29)** — Workshops, Talks, Mentor Hours\n• **Day 3 (Aug 30)** — Panels, Closing Presentations, Awards`,
    nav: { label: 'View Full Schedule', route: 'schedule' },
  },
  {
    id: 'team',
    intents: ['who organized this', 'who made this', 'who built this', 'who is behind this', 'who runs this', 'who created this', 'who developed this', 'who are the organizers', 'tell me about the team', 'who made this website'],
    phrases: ['organizing committee', 'core team', 'organizing team', 'event organizers', 'made this website', 'built this website', 'created this website', 'developed this website'],
    words: ['organizers', 'organizer', 'committee', 'volunteers'],
    answer: `👥 OOSC 4.0 is organized by the student and faculty community of **IIIT Allahabad**. Our team includes Faculty Coordinators, Student Coordinators, Technical Team, Design Team, and Hospitality & Logistics.`,
    nav: { label: 'Meet the Team', route: 'team' },
  },
  {
    id: 'hackathon',
    intents: ['tell me about the hackathon', 'what is the hackathon', 'hackathon details', 'how does the hackathon work'],
    phrases: ['hackathon tracks', 'coding challenge', 'hackathon competition'],
    words: ['hackathon', 'hacking'],
    answer: `⚡ The **OOSC 4.0 Hackathon** is a 36-hour competition with a prize pool of **₹1,00,000+**! Teams of 2–4 members work on AI × Open Source challenges across 3 tracks:\n\n• **Track A** — Intelligent DevOps\n• **Track B** — Smart Data Systems\n• **Track C** — Open AI Infra`,
    nav: { label: 'Hackathon Details', route: 'hackathon' },
  },
  {
    id: 'prizes',
    intents: ['what are the prizes', 'how much is the prize', 'what do winners get', 'tell me about prizes'],
    phrases: ['prize pool', 'prize money', 'cash prize', 'prize breakdown'],
    words: ['prizes', 'rewards', 'winner', 'winning'],
    answer: `🏆 **Prize breakdown:**\n• 🥇 1st Place — ₹50,000 + trophies + internship fast-track\n• 🥈 2nd Place — ₹30,000 + mentorship sessions\n• 🥉 3rd Place — ₹20,000 + swag kits\n\n**Special Awards:** Best Innovation (₹10K), Best Open-Source Impact (₹10K), Best UI/UX (₹5K), Best Rookie (₹5K), Best AI Integration (₹5K)`,
    nav: { label: 'See All Prizes', route: 'hackathon' },
  },
  {
    id: 'rules',
    intents: ['what are the rules', 'what are the guidelines', 'is plagiarism allowed', 'what is not allowed'],
    phrases: ['hackathon rules', 'code of conduct', 'hackathon guidelines'],
    words: ['rules', 'guidelines', 'plagiarism'],
    answer: `📋 Key rules:\n• All code must be written during Aug 28–30\n• Projects must be open-sourced (MIT/Apache/GPL)\n• Submit prototype + 3-min demo video + README\n• No undisclosed AI-generated code\n• Max 1 team per participant\n• Must follow OOSC Code of Conduct`,
    nav: { label: 'Full Rules & Guidelines', route: 'hackathon' },
  },
  {
    id: 'eligibility',
    intents: ['who can participate', 'who can join', 'am i eligible', 'what is the team size', 'can alumni join', 'can international students join'],
    phrases: ['team size', 'students only', 'eligibility criteria'],
    words: ['eligible', 'eligibility'],
    answer: `👤 **Eligibility:**\n• UG & PG students from any Indian university\n• Research scholars & PhD students welcome\n• IIITA students get priority registration\n• International students in Indian universities eligible\n• Alumni (≤2 years) as wild-card entries\n• **Team size:** 2–4 members, cross-institution allowed`,
    nav: { label: 'Check Eligibility', route: 'hackathon' },
  },
  {
    id: 'contact',
    intents: ['how to contact', 'how to reach you', 'what is the email', 'what is the phone number', 'how to get in touch'],
    phrases: ['contact organizers', 'contact info', 'email address', 'phone number', 'get in touch'],
    words: ['contact', 'email', 'phone', 'whatsapp'],
    answer: `📬 You can reach the organizers:\n• ✉️ **Email:** contact@oosc4.0.iiita.ac.in\n• 📞 **Call/WhatsApp:** +91 7318 295 789\n\nOr use the contact form on our website!`,
    nav: { label: 'Go to Contact Page', route: 'contact' },
  },
  {
    id: 'workshops',
    intents: ['what workshops are there', 'tell me about workshops', 'are there hands-on sessions'],
    phrases: ['hands-on lab', 'interactive workshop'],
    words: ['workshop', 'workshops', 'labs'],
    answer: `⚙️ We have interactive workshops covering:\n• Cloud Native Observability\n• Deployment orchestration\n• API architectures\n• Systems diagnostics\n\nThese are hands-on labs designed for developers of all levels!`,
    nav: { label: 'View Schedule', route: 'schedule' },
  },
  {
    id: 'networking',
    intents: ['how can i network', 'are there networking events', 'can i meet mentors'],
    phrases: ['networking hub', 'mentor hours', 'meet mentors'],
    words: ['networking', 'mentorship', 'mentors'],
    answer: `🤝 OOSC 4.0 offers incredible networking:\n• **Networking Hub** for connecting with faculty, contributors, and engineers\n• **Mentor Hours** — 1-on-1 sessions with senior open source contributors\n• **Sponsor Showcase** — meet company reps and explore opportunities`,
    nav: { label: 'View Schedule', route: 'schedule' },
  },
  {
    id: 'cost',
    intents: ['is it free', 'how much does it cost', 'what is the entry fee', 'do i need to pay', 'is there a fee'],
    phrases: ['entry fee', 'ticket price', 'registration fee'],
    words: ['free', 'cost', 'fee', 'ticket', 'price', 'charges'],
    answer: `💰 Registration details including any fees are available on our registration page. IIITA students may receive priority/subsidized access. Check the registration form for current pricing!`,
    nav: { label: 'Check Registration', route: 'register' },
  },
  {
    id: 'codesprint',
    intents: ['what are code sprints', 'how to contribute', 'can i contribute to open source'],
    phrases: ['code sprint', 'open source contribution'],
    words: ['sprint', 'contribute', 'contribution'],
    answer: `🌐 **Code Sprints** are a core part of OOSC 4.0! You can directly push contributions to whitelisted repositories and explore open system governance protocols during the event.`,
    nav: { label: 'Learn More', route: 'home' },
  },
  {
    id: 'research',
    intents: ['are there research talks', 'is it academic', 'can phd students present'],
    phrases: ['research talks', 'academic papers', 'research panels'],
    words: ['research', 'academic', 'papers', 'publication'],
    answer: `🔬 OOSC 4.0 bridges academia and open source with:\n• **Research talks** on server design, kernel optimizations, and databases\n• **Panel discussions** on open source governance\n• Access to developer workshops and server labs`,
    nav: { label: 'View Speakers', route: 'speakers' },
  },
  {
    id: 'accommodation',
    intents: ['where can i stay', 'is there accommodation', 'are there hotels nearby', 'do you provide hostel'],
    phrases: ['where to stay', 'hotel nearby', 'hostel accommodation'],
    words: ['accommodation', 'hotel', 'hostel', 'lodge', 'lodging'],
    answer: `🏨 For accommodation queries, please contact the organizing team directly. They can assist with on-campus or nearby hotel arrangements.\n\n📞 +91 7318 295 789\n✉️ contact@oosc4.0.iiita.ac.in`,
    nav: { label: 'Contact Organizers', route: 'contact' },
  },
  {
    id: 'food',
    intents: ['is food provided', 'will there be meals', 'what about lunch'],
    phrases: ['food provided', 'meals included'],
    words: ['food', 'lunch', 'dinner', 'breakfast', 'catering', 'meals'],
    answer: `🍽️ Meals and refreshments will be provided during the conference. Lunch & sponsor showcases are scheduled on Day 1! Specific dietary needs can be communicated during registration.`,
    nav: { label: 'View Schedule', route: 'schedule' },
  },
  {
    id: 'certificate',
    intents: ['will i get a certificate', 'do you give certificates', 'is there a participation certificate'],
    phrases: ['participation certificate', 'winner certificate'],
    words: ['certificate', 'certificates', 'certification'],
    answer: `📜 Yes! All participants will receive participation certificates. Hackathon winners get additional winner certificates and trophies. Details will be shared closer to the event.`,
  },
  {
    id: 'submission',
    intents: ['how to submit', 'what is the submission deadline', 'where to submit', 'how to submit hackathon project'],
    phrases: ['submission deadline', 'submit on devpost', 'hackathon submission'],
    words: ['submission', 'devpost'],
    answer: `📤 **Hackathon submissions:**\n• **Deadline:** August 30, 9:00 PM IST\n• **Platform:** DevPost\n• **Required:** GitHub repo link + 3-min demo video + project description\n• Top 10 teams present live to the jury (5 min each)`,
    nav: { label: 'Hackathon Details', route: 'hackathon' },
  },
  {
    id: 'greetings',
    intents: [],
    phrases: ['good morning', 'good evening', 'good afternoon'],
    words: ['hi', 'hello', 'hey', 'hola', 'namaste', 'howdy', 'sup', 'yo'],
    answer: `👋 Hey there! Welcome to OOSC 4.0! I'm here to help you navigate the website and answer your questions. What would you like to know?`,
  },
  {
    id: 'thanks',
    intents: [],
    phrases: ['thank you', 'thanks a lot'],
    words: ['thanks', 'thx', 'appreciate', 'ty'],
    answer: `😊 You're welcome! Feel free to ask if you have any more questions. See you at OOSC 4.0! 🚀`,
  },
  {
    id: 'navigate',
    intents: ['what pages are there', 'show me all pages', 'what can i find here', 'help me navigate', 'where can i find'],
    phrases: ['all pages', 'site map', 'website pages'],
    words: ['navigate', 'navigation', 'sitemap', 'pages'],
    answer: `🗺️ Here are all the pages on our website:\n\n• 🏠 **Home** — Event overview & highlights\n• ⚡ **Hackathon** — Tracks, prizes, rules\n• 📋 **Schedule** — 3-day conference timeline\n• 🎤 **Speakers** — Speaker profiles & bios\n• 🤝 **Sponsors** — Our sponsor partners\n• 👥 **Team** — Organizing committee\n• 📝 **Register** — Sign up for the event\n• 📬 **Contact** — Reach the organizers\n\nJust ask me about any page!`,
  },
  {
    id: 'bye',
    intents: [],
    phrases: ['see you', 'good bye'],
    words: ['bye', 'goodbye', 'later'],
    answer: `👋 Goodbye! Hope to see you at OOSC 4.0 — Aug 28–30 at IIIT Allahabad. Take care! 🎉`,
  },
]

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

// ─── INTENT-BASED MATCHER ──────────────────────────────────────────────────────
function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim()
}

function scoreEntry(input, entry) {
  const norm = normalize(input)
  let best = 0

  // 1. Intent matching (highest priority — full question patterns)
  for (const intent of entry.intents) {
    const ni = normalize(intent)
    if (norm.includes(ni) || ni.includes(norm)) {
      const overlap = Math.min(ni.length, norm.length) / Math.max(ni.length, norm.length)
      best = Math.max(best, 0.85 + overlap * 0.15)
    }
    // Check if most words of the intent appear in input
    const iWords = ni.split(' ')
    const nWords = norm.split(' ')
    let matched = 0
    for (const iw of iWords) {
      if (nWords.some(nw => nw === iw || (nw.length > 3 && iw.length > 3 && (nw.includes(iw) || iw.includes(nw))))) {
        matched++
      }
    }
    if (iWords.length >= 2 && matched >= iWords.length * 0.7) {
      best = Math.max(best, 0.75 + (matched / iWords.length) * 0.2)
    }
  }

  // 2. Phrase matching (multi-word — medium-high priority)
  for (const phrase of entry.phrases) {
    const np = normalize(phrase)
    if (norm.includes(np)) {
      best = Math.max(best, 0.7 + (np.length / Math.max(norm.length, 1)) * 0.2)
    }
  }

  // 3. Single-word matching (lowest priority, needs exact match on distinctive words)
  const inputWords = norm.split(' ')
  for (const word of entry.words) {
    const nw = normalize(word)
    if (inputWords.includes(nw)) {
      // Single words get a moderate score — can be overridden by better intent/phrase matches
      best = Math.max(best, 0.55)
    }
  }

  return best
}

function findBestMatch(userInput) {
  let bestEntry = null
  let bestScore = 0

  for (const entry of knowledgeBase) {
    const score = scoreEntry(userInput, entry)
    if (score > bestScore) {
      bestScore = score
      bestEntry = entry
    }
  }

  return bestScore >= 0.5 && bestEntry ? bestEntry : null
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

  useEffect(() => { scrollToBottom() }, [messages, isTyping, scrollToBottom])

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus()
    if (isOpen) setHasUnread(false)
  }, [isOpen])

  const addBotMessage = useCallback((text, nav = null) => {
    setIsTyping(true)
    const delay = Math.min(400 + text.length * 2, 1200)
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text, nav, timestamp: new Date() }])
      setIsTyping(false)
      if (!isOpen) setHasUnread(true)
    }, delay)
  }, [isOpen])

  const handleSend = useCallback((text = null) => {
    const userText = (text || input).trim()
    if (!userText) return

    setMessages(prev => [...prev, { sender: 'user', text: userText, timestamp: new Date() }])
    setInput('')

    const match = findBestMatch(userText)
    if (match) {
      addBotMessage(match.answer, match.nav || null)
    } else {
      addBotMessage(
        `🤔 I couldn't find a specific answer for that. Here's what I can help with:\n\n• Conference dates, venue & schedule\n• Hackathon details, prizes & rules\n• Speakers & sponsors info\n• Registration & contact details\n• Team & organizer info\n\nTry rephrasing your question, or visit our **Contact page** for personal help!`,
        { label: 'Go to Contact Page', route: 'contact' }
      )
    }
  }, [input, addBotMessage])

  const handleNavClick = (route) => {
    if (navigateTo) { navigateTo(route); setIsOpen(false) }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const renderMessageText = (text) => {
    return text.split('\n').map((line, i) => {
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>')
      if (processed.trim().startsWith('•'))
        return <div key={i} className="cb-bullet-line" dangerouslySetInnerHTML={{ __html: processed }} />
      if (processed.trim() === '')
        return <div key={i} className="cb-line-break" />
      return <div key={i} className="cb-text-line" dangerouslySetInnerHTML={{ __html: processed }} />
    })
  }

  return (
    <>
      <button
        type="button"
        className={`cb-toggle-btn ${isOpen ? 'cb-toggle-open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
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

      <div className={`cb-window ${isOpen ? 'cb-window-open' : ''}`}>
        <div className="cb-header">
          <div className="cb-header-info">
            <div className="cb-avatar"><span>🤖</span></div>
            <div>
              <h4 className="cb-header-title">OOSC 4.0 Assistant</h4>
              <span className="cb-status-dot" /><span className="cb-status-text">Online</span>
            </div>
          </div>
          <button type="button" className="cb-close-btn" onClick={() => setIsOpen(false)} aria-label="Close chat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="cb-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`cb-msg ${msg.sender === 'bot' ? 'cb-msg-bot' : 'cb-msg-user'}`}>
              {msg.sender === 'bot' && <div className="cb-msg-avatar">🤖</div>}
              <div className={`cb-msg-bubble ${msg.sender === 'bot' ? 'cb-bubble-bot' : 'cb-bubble-user'}`}>
                <div className="cb-msg-content">{renderMessageText(msg.text)}</div>
                {msg.nav && (
                  <button type="button" className="cb-nav-btn" onClick={() => handleNavClick(msg.nav.route)}>
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
                <div className="cb-typing-dots"><span /><span /><span /></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 2 && (
          <div className="cb-quick-actions">
            {quickActions.map((action, i) => (
              <button key={i} type="button" className="cb-quick-chip" onClick={() => handleSend(action.query)}>
                {action.label}
              </button>
            ))}
          </div>
        )}

        <div className="cb-input-area">
          <input ref={inputRef} type="text" className="cb-input" value={input}
            onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Ask about OOSC 4.0..." disabled={isTyping}
          />
          <button type="button" className="cb-send-btn" onClick={() => handleSend()}
            disabled={!input.trim() || isTyping} aria-label="Send message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
