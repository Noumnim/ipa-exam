import { useState } from 'react'
import { TOPICS } from '../data/topics'

const FILTERS = ['All', 'Technology', 'Management', 'Strategy', 'Programming']

const SECTION_COLORS = {
  Technology:  { bg: '#eff6ff', text: '#1a56db', border: '#bfdbfe' },
  Management:  { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
  Strategy:    { bg: '#f5f3ff', text: '#7e3af2', border: '#ddd6fe' },
  Programming: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
}

export default function LearnPage() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [openTopics, setOpenTopics] = useState({})

  const toggle = (id) => setOpenTopics(prev => ({ ...prev, [id]: !prev[id] }))

  const visible = TOPICS.filter(t => {
    const matchSection = filter === 'All' || t.section === filter
    const q = search.trim().toLowerCase()
    const matchSearch = !q ||
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.keyPoints.some(kp => kp.toLowerCase().includes(q))
    return matchSection && matchSearch
  })

  return (
    <div>
      {/* Header */}
      <div className="learn-header">
        <h2>Study Guide</h2>
        <p>Explore topic explanations, key concepts, and reference links for every exam area.</p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="🔍  Search topics, concepts…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: 420,
            padding: '9px 14px',
            border: '1.5px solid #d1d5db',
            borderRadius: 8,
            fontSize: 14,
            outline: 'none',
            fontFamily: 'inherit',
            color: '#1f2937',
            background: 'white',
          }}
        />
      </div>

      {/* Section filter */}
      <div className="learn-filter">
        {FILTERS.map(f => {
          const col = f !== 'All' ? SECTION_COLORS[f] : null
          const isActive = filter === f
          return (
            <button
              key={f}
              className={`filter-btn ${isActive ? 'active' : ''}`}
              style={isActive && col ? { background: col.text, borderColor: col.text } : {}}
              onClick={() => setFilter(f)}
            >
              {f === 'Technology'  && '🖥️ '}
              {f === 'Management'  && '📅 '}
              {f === 'Strategy'    && '📈 '}
              {f === 'Programming' && '💻 '}
              {f}
              {f !== 'All' && (
                <span style={{ marginLeft: 6, opacity: .7, fontSize: 11 }}>
                  ({TOPICS.filter(t => t.section === f).length})
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Count */}
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
        Showing {visible.length} of {TOPICS.length} topics
      </p>

      {/* Topic grid */}
      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9ca3af' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <p>No topics match your search. Try different keywords.</p>
        </div>
      ) : (
        <div className="topics-grid">
          {visible.map(topic => (
            <TopicCard
              key={topic.id}
              topic={topic}
              isOpen={!!openTopics[topic.id]}
              onToggle={() => toggle(topic.id)}
            />
          ))}
        </div>
      )}

      {/* Footer reference */}
      <div style={{ marginTop: 40, padding: '20px 24px', background: '#f9fafb', borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 13, color: '#6b7280' }}>
        <strong style={{ color: '#374151' }}>About this exam:</strong> This preparation guide is based on the IPA IT Passport-style examination covering IT core technology, management, strategy, and programming fundamentals.
        Learn more at the{' '}
        <a href="https://www.itpec.org/" target="_blank" rel="noopener noreferrer" style={{ color: '#1a56db', textDecoration: 'underline' }}>
          ITPEC official website ↗
        </a>
        {' '}and the{' '}
        <a href="https://www.ipa.go.jp/en/" target="_blank" rel="noopener noreferrer" style={{ color: '#1a56db', textDecoration: 'underline' }}>
          IPA Japan website ↗
        </a>.
      </div>
    </div>
  )
}

function TopicCard({ topic, isOpen, onToggle }) {
  const col = SECTION_COLORS[topic.section] || SECTION_COLORS.Technology
  return (
    <div className="topic-card">
      {/* Header — always visible, click to expand */}
      <div className="topic-card-header" onClick={onToggle}>
        <div
          className="topic-icon"
          style={{ background: col.bg, border: `1.5px solid ${col.border}` }}
        >
          {topic.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ marginBottom: 2 }}>{topic.title}</h3>
          <span
            className="topic-section-badge"
            style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}` }}
          >
            {topic.section}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>
            Q{topic.relatedQs.join(', ')}
          </span>
          <span className={`topic-expand-icon ${isOpen ? 'open' : ''}`}>▼</span>
        </div>
      </div>

      {/* Body — visible when expanded */}
      {isOpen && (
        <div className="topic-card-body">
          <div className="topic-card-body-inner">

            {/* Summary */}
            <p className="topic-summary">{topic.summary}</p>

            {/* Key points */}
            <div className="key-points">
              <h4>Key Concepts</h4>
              <ul>
                {topic.keyPoints.map((kp, i) => (
                  <li key={i}>{kp}</li>
                ))}
              </ul>
            </div>

            {/* References */}
            <div className="references-section">
              <h4>📎 Learn More — Reference Links</h4>
              <div className="ref-list">
                {topic.references.map((ref, i) => (
                  <a
                    key={i}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ref-link"
                  >
                    <span className="ref-link-icon">🔗</span>
                    {ref.title}
                    <span style={{ marginLeft: 'auto', fontSize: 11, opacity: .6 }}>↗</span>
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

