
export default function Hackathon({ content }) {
  const data = content || {
    hero: {
      title: 'OOSC 4.0 Hackathon',
      subtitle: 'Flagship open source coding track',
      description: 'Join the flagship hackathon track for students, researchers, and open source builders.',
    },
    cards: [
      { title: 'What to Expect', desc: 'Teams will solve real systems, AI, and open source challenges in a fast-paced sprint supported by mentors.' },
      { title: 'Who Should Participate', bullet1: 'Students passionate about software, hardware, and open collaboration', bullet2: 'Researchers and contributors exploring practical implementation', bullet3: 'Teams aiming to present strong solutions to judges and sponsors' },
      { title: 'Prizes & Support', desc: 'Top teams earn awards, mentorship sessions, and fast-track invitations to showcase at the closing ceremony.' }
    ]
  }

  return (
    <section className="content-section hackathon-section" id="hackathon">
      <div className="section-heading">
        <span>Competition</span>
        <h2>{data.hero.title}</h2>
        <p>{data.hero.description || data.hero.subtitle}</p>
      </div>
      <div className="hackathon-content-grid">
        {data.cards?.map((card, i) => (
          <div key={i} className="glass-card">
            <h3>{card.title}</h3>
            {card.desc ? (
              <p>{card.desc}</p>
            ) : (
              <ul>
                {card.bullet1 && <li>{card.bullet1}</li>}
                {card.bullet2 && <li>{card.bullet2}</li>}
                {card.bullet3 && <li>{card.bullet3}</li>}
              </ul>
            )}
          </div>
        ))}
      </div>
      {data.hero.registrationLink && (
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <a href={data.hero.registrationLink} target="_blank" rel="noreferrer" className="btn btn-primary">
            Register for Hackathon
          </a>
        </div>
      )}
    </section>
  )
}
