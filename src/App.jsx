import { useState } from 'react'
import ExamPage from './components/ExamPage'
import LearnPage from './components/LearnPage'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('learn')

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-badge">IPA</div>
            <div>
              <h1 className="brand-title">IT Passport Exam Preparation</h1>
              <p className="brand-sub">IT Literacy &amp; Programming Assessment — Beginner Level</p>
            </div>
          </div>
          <nav className="tab-nav">
            <button
              className={`tab-btn ${activeTab === 'learn' ? 'active' : ''}`}
              onClick={() => setActiveTab('learn')}
            >
              📚 Learn
            </button>
            <button
              className={`tab-btn ${activeTab === 'exam' ? 'active' : ''}`}
              onClick={() => setActiveTab('exam')}
            >
              📝 Exam
            </button>
          </nav>
        </div>
      </header>
      <main className="app-main">
        {activeTab === 'learn' ? <LearnPage /> : <ExamPage />}
      </main>
    </div>
  )
}
