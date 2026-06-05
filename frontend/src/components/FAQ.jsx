
export default function FAQ({ items = [] }) {
  return (
    <section className="content-section" id="faq">
      <div className="section-heading">
        <span>FAQ</span>
        <h2>Frequently asked questions</h2>
        <p>Answers to common questions about OOSC 4.0 — schedule, registration, and participation.</p>
      </div>
      <div className="card-grid faq-grid">
        {(items.length ? items : DEFAULT_FAQ).map((q) => (
          <article key={q.id ?? q.question} className="card">
            <h3>{q.question}</h3>
            <p className="muted">{q.answer}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

const DEFAULT_FAQ = [
  { question: 'Who should attend?', answer: 'Developers, researchers, and students interested in open source systems.' },
  { question: 'How do I propose a talk?', answer: 'Use the contact form with your proposal and we will respond.' },
]
