import { useState } from 'react'

const API_BASE = 'http://localhost:8000'

const INITIAL_MESSAGES = [
  { type: 'ai', text: "Hello! Ask me a math question and I'll generate a visual explanation for you." }
]

export function useChat({ activeSessionId, isNewSession, createSession, updateSessionVideo }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [isLoading, setIsLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState(null)

  function resetChat() {
    setMessages(INITIAL_MESSAGES)
    setVideoUrl(null)
  }

  async function sendMessage(text) {
    let sessionId = activeSessionId
    if (isNewSession) {
      const session = createSession(text)
      sessionId = session.id
    }

    setMessages(prev => [...prev, { type: 'user', text }])
    setIsLoading(true)
    setVideoUrl(null)

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          user_id: 1,                
          conversation_id: sessionId ?? null
        })
      })

      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()

      setMessages(prev => [...prev, { type: 'ai', text: data.reply }])

      if (data.animation_id) {
        pollAnimation(data.animation_id, sessionId)
      } else {
        setIsLoading(false)
      }
    } catch (err) {
      setIsLoading(false)
      setMessages(prev => [...prev, {
        type: 'ai',
        text: 'Something went wrong connecting to the backend.'
      }])
      console.error(err)
    }
  }

  async function pollAnimation(animationId, sessionId) {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chat/animation/${animationId}`)
        const data = await res.json()

        if (data.status === 'rendered' && data.video_url) {
          clearInterval(interval)
          const mediaIndex = data.video_url.replace(/\\/g, '/').indexOf('/media/')
          const relativePath = data.video_url.replace(/\\/g, '/').slice(mediaIndex + 7)
          const servedUrl = `${API_BASE}/video/${relativePath}`
          setVideoUrl(servedUrl)
          updateSessionVideo(sessionId, servedUrl)
          setMessages(prev => [...prev, { type: 'ai', text: '✦ Visualization ready', isStatus: true }])
          setIsLoading(false)
        } else if (data.status === 'failed') {
          clearInterval(interval)
          setMessages(prev => [...prev, { type: 'ai', text: 'Render failed. Try again.' }])
          setIsLoading(false)
        }
      } catch {
        clearInterval(interval)
        setIsLoading(false)
      }
    }, 3000)
  }

  return { messages, isLoading, videoUrl, sendMessage, resetChat }
}