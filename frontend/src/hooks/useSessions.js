import { useState } from 'react'

let sessionCounter = 0

export function useSessions() {
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [isNewSession, setIsNewSession] = useState(true)
  const [visualTitle, setVisualTitle] = useState('New Session')

  function newSession() {
    setActiveSessionId(null)
    setIsNewSession(true)
    setVisualTitle('New Session')
  }

  function selectSession(session) {
    setActiveSessionId(session.id)
    setIsNewSession(false)
    setVisualTitle(session.label)
  }

  function createSession(text) {
    const label = text.length > 30 ? `${text.slice(0, 30)}…` : text
    sessionCounter++
    const session = { id: sessionCounter, label, videoUrl: null }
    setSessions(prev => [session, ...prev])
    setActiveSessionId(session.id)
    setIsNewSession(false)
    setVisualTitle(label)
    return session
  }

  function updateSessionVideo(sessionId, videoUrl) {
    setSessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, videoUrl } : s)
    )
  }

  return {
    sessions,
    activeSessionId,
    isNewSession,
    visualTitle,
    newSession,
    selectSession,
    createSession,
    updateSessionVideo,
  }
}