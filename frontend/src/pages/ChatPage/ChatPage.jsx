import { useState, useRef, useCallback } from 'react'
import { useSessions } from '../../hooks/useSessions'
import { useChat } from '../../hooks/useChat'
import { Sidebar } from '../../components/Sidebar/Sidebar'
import CenterStage from '../../components/CenterStage/CenterStage'
import RightPanel from '../../components/RightPanel/RightPanel'
import LogoutModal from '../../components/LogoutModal/LogoutModal'
import { useNavigate } from 'react-router-dom'
import styles from './ChatPage.module.css'

const MIN_WIDTH = 260
const MAX_WIDTH = 600
const DEFAULT_WIDTH = 430

export default function ChatPage() {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [logoutVisible, setLogoutVisible] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '' })
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH)
  const toastTimer = useRef(null)
  const dragging = useRef(false)

  const sessions = useSessions()
  const chat = useChat({
    activeSessionId: sessions.activeSessionId,
    isNewSession: sessions.isNewSession,
    createSession: sessions.createSession,
    updateSessionVideo: sessions.updateSessionVideo,
  })

  function showToast(msg) {
    setToast({ visible: true, message: msg })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500)
  }

  function handleNewSession() {
    sessions.newSession()
    chat.resetChat()
  }

  function handleSelectSession(session) {
    sessions.selectSession(session)
    chat.resetChat()
  }

  const onDragStart = useCallback((e) => {
    dragging.current = true
    e.preventDefault()

    function onMove(e) {
      if (!dragging.current) return
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const newWidth = window.innerWidth - clientX
      setPanelWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth)))
    }

    function onUp() {
      dragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  return (
    <div className={styles.chatPage}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(v => !v)}
        sessions={sessions.sessions}
        activeSessionId={sessions.activeSessionId}
        onNewSession={handleNewSession}
        onSelectSession={handleSelectSession}
        onLogout={() => setLogoutVisible(true)}
      />

      <CenterStage
        videoUrl={chat.videoUrl}
        isLoading={chat.isLoading}
        visualTitle={sessions.visualTitle}
        toast={toast}
        onDismissToast={showToast}
      />

      <div className={styles.dragHandle} onMouseDown={onDragStart} />

      <RightPanel
        messages={chat.messages}
        onSend={chat.sendMessage}
        locked={chat.isLoading}
        panelWidth={panelWidth}
      />

      <LogoutModal
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={() => navigate('/login')}
      />
    </div>
  )
}