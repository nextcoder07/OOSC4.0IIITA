export const navItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'events', label: 'Events' },
  { id: 'speakers', label: 'Speakers' },
  { id: 'sponsors', label: 'Sponsors' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'team', label: 'Team' },
  { id: 'merch', label: 'Merchandise' },
  { id: 'contact', label: 'Contact' },
];

export const heroData = {
  title: 'OOSC 4.0',
  subtitle: 'Open Source Systems Conference at IIITA',
  dates: 'Aug 28–30, 2026',
  venue: 'Indian Institute of Information Technology, Allahabad',
  cta: 'Register Interest',
  bannerText: 'Building the next generation of open source systems, AI, and community-driven research.',
};

export const aboutData = {
  heading: 'About OOSC 4.0',
  description:
    'OOSC 4.0 is the annual Open Source Systems Conference at IIITA, bringing together researchers, developers, students, and industry leaders to explore distributed systems, cloud-native platforms, open source tooling, and collaborative innovation.',
  highlights: [
    '3 days of talks, workshops, and hackathon challenges',
    'Speakers from academia, startups, and enterprise engineering',
    'Networking, mentorship, and project showcases',
  ],
};

export const eventsData = [
  {
    id: 'event-1',
    title: 'Opening Keynote & Systems Vision',
    description: 'A keynote on open source system architecture, sustainability, and the future of collaborative engineering.',
    date: 'Aug 28',
    time: '10:00 AM',
    type: 'Talk',
    sortOrder: 1,
  },
  {
    id: 'event-2',
    title: 'Hackathon Launch: Build for Impact',
    description: 'Teams form, mentors onboard, and the OOSC 4.0 hackathon challenge begins.',
    date: 'Aug 28',
    time: '2:00 PM',
    type: 'Hackathon',
    sortOrder: 2,
  },
  {
    id: 'event-3',
    title: 'Workshop: Cloud Native Observability',
    description: 'Hands-on workshop covering monitoring and tracing in modern distributed systems.',
    date: 'Aug 29',
    time: '11:00 AM',
    type: 'Workshop',
    sortOrder: 3,
  },
  {
    id: 'event-4',
    title: 'Panel: Open Source Governance',
    description: 'Leaders discuss community collaboration, licensing, and inclusive governance models.',
    date: 'Aug 30',
    time: '3:00 PM',
    type: 'Panel',
    sortOrder: 4,
  },
];

export const speakersData = [
  {
    id: 'speaker-1',
    name: 'Dr. Ananya Mishra',
    title: 'Lead Researcher, IIITA',
    bio: 'Designing resilient distributed systems for open source communities and educational platforms.',
    photoURL: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    sortOrder: 1,
  },
  {
    id: 'speaker-2',
    name: 'Mr. Rohit Singh',
    title: 'Principal Engineer, OpenStack',
    bio: 'Expert in cloud orchestration and infrastructure automation for large open source deployments.',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    sortOrder: 2,
  },
  {
    id: 'speaker-3',
    name: 'Ms. Priya Patel',
    title: 'Founder, OpenAI Systems Guild',
    bio: 'Leading AI-safe open source initiatives and developer communities for ethical tooling.',
    photoURL: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80',
    sortOrder: 3,
  },
  {
    id: 'speaker-4',
    name: 'Prof. Neeraj Kumar',
    title: 'CSE Faculty, IIITA',
    bio: 'Researcher in operating systems, parallel computing, and secure open source design.',
    photoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    sortOrder: 4,
  },
];

export const sponsorsData = [
  {
    id: 'sponsor-1',
    name: 'IIITA Tech Labs',
    logoURL: 'https://via.placeholder.com/250x120?text=Title+Sponsor',
    category: 'Title Sponsor',
    website: 'https://iiita.ac.in',
    sortOrder: 1,
  },
  {
    id: 'sponsor-2',
    name: 'CloudNova',
    logoURL: 'https://via.placeholder.com/200x100?text=Platinum+Sponsor',
    category: 'Platinum Sponsor',
    website: 'https://cloudnova.example',
    sortOrder: 1,
  },
  {
    id: 'sponsor-3',
    name: 'OpenEdge',
    logoURL: 'https://via.placeholder.com/200x100?text=Gold+Sponsor',
    category: 'Gold Sponsor',
    website: 'https://openedge.example',
    sortOrder: 1,
  },
  {
    id: 'sponsor-4',
    name: 'HackStreet',
    logoURL: 'https://via.placeholder.com/200x100?text=Supporter',
    category: 'Supporter',
    website: 'https://hackstreet.example',
    sortOrder: 1,
  },
];

export const scheduleData = [
  {
    id: 'slot-1',
    title: 'Registration & Networking',
    details: 'Check in, collect badges, and meet the conference community.',
    dateTime: 'Aug 28 · 9:00 AM',
    sortOrder: 1,
  },
  {
    id: 'slot-2',
    title: 'Lunch & Sponsor Showcase',
    details: 'Explore sponsor booths and open source project demos.',
    dateTime: 'Aug 28 · 1:00 PM',
    sortOrder: 2,
  },
  {
    id: 'slot-3',
    title: 'Mentor Hours',
    details: 'One-on-one sessions with mentors and open source contributors.',
    dateTime: 'Aug 29 · 4:00 PM',
    sortOrder: 3,
  },
  {
    id: 'slot-4',
    title: 'Closing Presentations',
    details: 'Team demos, awards, and conference closing remarks.',
    dateTime: 'Aug 30 · 5:00 PM',
    sortOrder: 4,
  },
];

export const teamData = [
  {
    id: 'team-1',
    name: 'Aisha Verma',
    role: 'Conference Chair',
    contact: 'aisha.verma@iiita.ac.in',
    photoURL: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=400&q=80',
    sortOrder: 1,
  },
  {
    id: 'team-2',
    name: 'Karan Mehta',
    role: 'Logistics Lead',
    contact: '+91 98765 43210',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    sortOrder: 2,
  },
  {
    id: 'team-3',
    name: 'Sonal Gupta',
    role: 'Community Coordinator',
    contact: 'sonal.gupta@iiita.ac.in',
    photoURL: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    sortOrder: 3,
  },
];

export const merchData = [
  {
    id: 'merch-1',
    title: 'OOSC 4.0 Tee',
    description: 'Premium conference t-shirt with the OOSC 4.0 logo and IIITA colors.',
    imageURL: 'https://via.placeholder.com/300x220?text=OOSC+Tee',
    purchaseLink: 'https://shop.example.com/oosc-tee',
  },
  {
    id: 'merch-2',
    title: 'Notebook & Sticker Pack',
    description: 'Stylish notebook and sticker bundle for open source contributors.',
    imageURL: 'https://via.placeholder.com/300x220?text=Notebook+Pack',
    purchaseLink: 'https://shop.example.com/oosc-pack',
  },
];
