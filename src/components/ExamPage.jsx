import { useState, useEffect, useRef, useCallback } from 'react'
import { QUESTIONS, SECTIONS, POINTS_PER_Q, PART1_MIN_TOTAL, PART2_MIN_TOTAL } from '../data/questions'

const TOTAL_SECONDS = 120 * 60

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0')
  const s = (secs % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function calcResults(answers) {
  const sectionScores = { A: 0, B: 0, C: 0, D: 0 }
  QUESTIONS.forEach(q => {
    if (answers[q.id] === q.answer) sectionScores[q.section]++
  })
  const pts = { A: sectionScores.A * 25, B: sectionScores.B * 25, C: sectionScores.C * 25, D: sectionScores.D * 25 }
  const part1Total = pts.A + pts.B + pts.C
  const part2Total = pts.D
  const part1Pass = part1Total >= PART1_MIN_TOTAL && pts.A >= 200 && pts.B >= 100 && pts.C >= 175
  const part2Pass = part2Total >= PART2_MIN_TOTAL
  return { sectionCorrect: sectionScores, pts, part1Total, part2Total, part1Pass, part2Pass, pass: part1Pass && part2Pass }
}

// Group questions by section/subsection
const GROUPED = Object.entries(SECTIONS).map(([key, sec]) => ({
  key,
  ...sec,
  questions: QUESTIONS.filter(q => q.section === key),
}))

export default function ExamPage() {
  const [phase, setPhase] = useState('start') // start | exam | results
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS)
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const intervalRef = useRef(null)

  const startExam = () => {
    setAnswers({})
    setTimeLeft(TOTAL_SECONDS)
    setSubmitted(false)
    setPhase('exam')
  }

  const submitExam = useCallback(() => {
    clearInterval(intervalRef.current)
    const r = calcResults(answers)
    setResults(r)
    setSubmitted(true)
    setPhase('results')
    setShowConfirm(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [answers])

  useEffect(() => {
    if (phase !== 'exam') return
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { submitExam(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [phase, submitExam])

  const answeredCount = Object.keys(answers).length

  if (phase === 'start') return <StartScreen onStart={startExam} />

  if (phase === 'results') return <ResultsPage results={results} answers={answers} onRetry={() => setPhase('start')} />

  const timerClass = timeLeft < 300 ? 'danger' : timeLeft < 600 ? 'warning' : ''

  return (
    <div>
      {/* Top bar */}
      <div className="exam-topbar">
        <div className="exam-progress-wrap">
          <div className="exam-progress-label">{answeredCount} / {QUESTIONS.length} answered</div>
          <div className="exam-progress-bar">
            <div className="exam-progress-fill" style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }} />
          </div>
        </div>
        <div className={`exam-timer ${timerClass}`}>⏱ {formatTime(timeLeft)}</div>
        <button className="exam-submit-btn" onClick={() => setShowConfirm(true)}>Submit Exam</button>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '28px 32px', maxWidth: 400, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
            <h3 style={{ marginBottom: 8, fontSize: 18 }}>Submit Exam?</h3>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>
              You have answered {answeredCount} of {QUESTIONS.length} questions. Unanswered questions score zero.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn-outline" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn-primary" onClick={submitExam}>Yes, Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Questions */}
      {GROUPED.map(sec => (
        <div key={sec.key}>
          <div className="exam-section-header">
            <span className="section-pill" style={{ background: sec.color }}>Part {sec.part} – {sec.key}</span>
            <h3>{sec.name}</h3>
            <span className="sec-meta">{sec.questions.length} Q · {sec.maxPoints} pts · min {sec.minPass} pts</span>
          </div>

          {/* Group by subsection for Part 2 */}
          {sec.key === 'D' ? (
            renderSubsections(sec.questions, answers, setAnswers)
          ) : (
            sec.questions.map(q => (
              <QuestionCard key={q.id} q={q} selected={answers[q.id]} onSelect={opt => setAnswers(a => ({ ...a, [q.id]: opt }))} />
            ))
          )}
        </div>
      ))}
    </div>
  )
}

function renderSubsections(questions, answers, setAnswers) {
  const subs = []
  const seen = []
  questions.forEach(q => {
    if (!seen.includes(q.subsection)) {
      seen.push(q.subsection)
      subs.push({ label: q.subsection, qs: [] })
    }
    subs[subs.length - 1].qs.push(q)
  })
  return subs.map(sub => (
    <div key={sub.label}>
      <div className="subsection-label">{sub.label}</div>
      {sub.qs.map(q => (
        <QuestionCard key={q.id} q={q} selected={answers[q.id]} onSelect={opt => setAnswers(a => ({ ...a, [q.id]: opt }))} />
      ))}
    </div>
  ))
}

function QuestionCard({ q, selected, onSelect, showAnswer }) {
  const opts = ['A', 'B', 'C', 'D']
  return (
    <div className={`question-card ${selected ? 'answered' : ''}`}>
      <div className="question-header">
        <div className="q-num">{q.id}</div>
        <div className="question-text">{q.text}</div>
      </div>
      {q.code && <pre className="code-block">{q.code}</pre>}
      <div className="options-grid">
        {opts.map(opt => {
          let cls = 'option-btn'
          if (showAnswer) {
            if (opt === q.answer) cls += ' correct'
            else if (opt === selected && selected !== q.answer) cls += ' wrong'
          } else if (opt === selected) {
            cls += ' selected'
          }
          return (
            <button key={opt} className={cls} onClick={() => !showAnswer && onSelect(opt)}>
              <span className="opt-letter">{opt}</span>
              {q.options[opt]}
            </button>
          )
        })}
      </div>
      {showAnswer && (
        <div className="explanation-box">
          <strong>Explanation</strong>
          {q.explanation}
        </div>
      )}
    </div>
  )
}

function StartScreen({ onStart }) {
  return (
    <div className="card exam-start">
      <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
      <h2>IT Passport Examination</h2>
      <p>IT Literacy &amp; Programming Assessment — Beginner Level</p>

      <div className="exam-info-grid">
        <div className="exam-info-card">
          <div className="ei-label">Questions</div>
          <div className="ei-value">94</div>
          <div className="ei-sub">Part 1: 59 · Part 2: 35</div>
        </div>
        <div className="exam-info-card">
          <div className="ei-label">Time Limit</div>
          <div className="ei-value">120</div>
          <div className="ei-sub">minutes</div>
        </div>
        <div className="exam-info-card">
          <div className="ei-label">Total Marks</div>
          <div className="ei-value">2350</div>
          <div className="ei-sub">25 pts per question</div>
        </div>
        <div className="exam-info-card">
          <div className="ei-label">Format</div>
          <div className="ei-value" style={{ fontSize: 14 }}>Multiple Choice</div>
          <div className="ei-sub">4 options, 1 correct</div>
        </div>
      </div>

      <div className="pass-rules">
        <h4>Passing Rules</h4>
        <ul>
          <li>Part 1 total ≥ 900 pts (out of 1475)</li>
          <li>Technology ≥ 200 pts · Management ≥ 100 pts · Strategy ≥ 175 pts</li>
          <li>Part 2 (Programming) ≥ 525 pts (out of 875)</li>
          <li>Both Part 1 AND Part 2 must pass to achieve overall PASS</li>
          <li>No penalty for wrong answers — attempt every question</li>
        </ul>
      </div>

      <button className="btn-primary" style={{ fontSize: 16, padding: '13px 36px' }} onClick={onStart}>
        Start Examination →
      </button>
    </div>
  )
}

function ResultsPage({ results, answers, onRetry }) {
  const { pts, part1Total, part2Total, part1Pass, part2Pass, pass, sectionCorrect } = results
  const [showReview, setShowReview] = useState(false)

  const sectionMeta = [
    { key: 'A', label: 'Technology', color: '#1a56db', pts: pts.A, max: 600, min: 200, pass: pts.A >= 200, correct: sectionCorrect.A, total: 24 },
    { key: 'B', label: 'Management', color: '#059669', pts: pts.B, max: 300, min: 100, pass: pts.B >= 100, correct: sectionCorrect.B, total: 12 },
    { key: 'C', label: 'Strategy', color: '#7e3af2', pts: pts.C, max: 575, min: 175, pass: pts.C >= 175, correct: sectionCorrect.C, total: 23 },
    { key: 'D', label: 'Programming', color: '#d97706', pts: pts.D, max: 875, min: 525, pass: pts.D >= 525, correct: sectionCorrect.D, total: 35 },
  ]

  return (
    <div className="results-page">
      <div className={`card result-hero ${pass ? 'pass' : 'fail'}`}>
        <div className="result-verdict">{pass ? '🎉' : '📖'}</div>
        <h2>{pass ? 'PASS' : 'FAIL'}</h2>
        <p>{pass ? 'Congratulations! You passed both parts.' : 'Keep studying — you need to pass both Part 1 and Part 2.'}</p>
      </div>

      <div className="results-grid">
        {sectionMeta.map(s => (
          <div className="result-section-card card" key={s.key}>
            <div className="rsc-header">
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, display: 'inline-block' }}></span>
              <h4>{s.label}</h4>
            </div>
            <div className="rsc-score" style={{ color: s.color }}>
              {s.pts} <span className="rsc-max">/ {s.max}</span>
            </div>
            <div className="rsc-bar">
              <div className="rsc-fill" style={{ width: `${(s.pts / s.max) * 100}%`, background: s.color }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>{s.correct}/{s.total} correct</span>
              <span className={`rsc-pass ${s.pass ? 'ok' : 'fail'}`}>{s.pass ? '✓ Pass' : `✗ Need ${s.min} pts`}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Part totals */}
      <div className="part-totals-grid">
        {[
          { label: 'Part 1 Total', score: part1Total, max: 1475, min: PART1_MIN_TOTAL, pass: part1Pass },
          { label: 'Part 2 Total', score: part2Total, max: 875, min: PART2_MIN_TOTAL, pass: part2Pass },
        ].map(p => (
          <div key={p.label} className="card" style={{ padding: '16px 20px', borderColor: p.pass ? '#86efac' : '#fca5a5' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 4 }}>{p.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: p.pass ? '#059669' : '#dc2626' }}>
              {p.score} <span style={{ fontSize: 14, fontWeight: 400, color: '#9ca3af' }}>/ {p.max}</span>
            </div>
            <div style={{ fontSize: 13, color: p.pass ? '#059669' : '#dc2626', fontWeight: 600 }}>
              {p.pass ? `✓ Pass (min ${p.min})` : `✗ Need ${p.min} pts`}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <button className="btn-primary" onClick={onRetry}>Try Again</button>
        <button className="btn-outline" onClick={() => setShowReview(v => !v)}>
          {showReview ? 'Hide' : 'Review'} All Answers
        </button>
      </div>

      {showReview && (
        <div>
          {GROUPED.map(sec => (
            <div key={sec.key}>
              <div className="exam-section-header">
                <span className="section-pill" style={{ background: sec.color }}>Part {sec.part} – {sec.key}</span>
                <h3>{sec.name}</h3>
              </div>
              {sec.key === 'D'
                ? renderSubsections(sec.questions, answers, () => {}, true)
                : sec.questions.map(q => (
                    <QuestionCard key={q.id} q={q} selected={answers[q.id]} onSelect={() => {}} showAnswer />
                  ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
