import { useState, useRef } from 'react'

const API_BASE = 'http://localhost:8000'
const DEV_MODE = true
const DEV_VIDEO = 'http://localhost:8000/video/videos/scene_8bfda8cc/480p15/Visualization.mp4'

const INITIAL_MESSAGES = [
  { type: 'ai', text: "Hello! Ask me a math question and I'll generate a visual explanation for you." }
]

export function useChat({ activeSessionId, isNewSession, createSession, updateSessionVideo }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [isLoading, setIsLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState(null)
  const backendConversationId = useRef(null)

  function resetChat() {
    setMessages(INITIAL_MESSAGES)
    setVideoUrl(null)
    backendConversationId.current = null
  }

  async function sendMessage(text) {
    let frontendSessionId = activeSessionId
    if (isNewSession) {
      const session = createSession(text)
      frontendSessionId = session.id
    }

    setMessages(prev => [...prev, { type: 'user', text }])

    if (DEV_MODE) {
      setTimeout(() => {
        setVideoUrl(DEV_VIDEO)
        updateSessionVideo(frontendSessionId, DEV_VIDEO)
        setMessages(prev => [...prev,
          { type: 'ai', text: 'Here is your Pythagorean Theorem visualization.' },
          { type: 'ai', text: '✦ Visualization ready', isStatus: true }
        ])
      }, 800)
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          user_id: 1,
          conversation_id: backendConversationId.current ?? null,
        })
      })

      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()

      backendConversationId.current = data.conversation_id
      setMessages(prev => [...prev, { type: 'ai', text: data.reply }])

      if (data.animation_id) {
        pollAnimation(data.animation_id, frontendSessionId)
      } else {
        setIsLoading(false)
      }
    } catch (err) {
      setIsLoading(false)
      setMessages(prev => [...prev, { type: 'ai', text: 'Something went wrong connecting to the backend.' }])
    }
  }

  async function pollAnimation(animationId, frontendSessionId) {
    let attempts = 0
    const maxAttempts = 40

    const interval = setInterval(async () => {
      attempts++
      if (attempts > maxAttempts) {
        clearInterval(interval)
        setMessages(prev => [...prev, { type: 'ai', text: 'Render timed out. Try again.' }])
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_BASE}/api/animation/${animationId}`)
        const data = await res.json()

        if (data.status === 'rendered' && data.video_url) {
          clearInterval(interval)
          const normalized = data.video_url.replace(/\\/g, '/')
          const servedUrl = `${API_BASE}/video/${normalized}`
          setVideoUrl(servedUrl)
          updateSessionVideo(frontendSessionId, servedUrl)
          setMessages(prev => [...prev, { type: 'ai', text: '✦ Visualization ready', isStatus: true }])
          setIsLoading(false)
        } else if (data.status === 'failed') {
          clearInterval(interval)
          setMessages(prev => [...prev, { type: 'ai', text: 'Render failed. Try again.' }])
          setIsLoading(false)
        }
      } catch {
        clearInterval(interval)
        setMessages(prev => [...prev, { type: 'ai', text: 'Lost connection to server.' }])
        setIsLoading(false)
      }
    }, 3000)
  }

  return { messages, isLoading, videoUrl, sendMessage, resetChat }
}