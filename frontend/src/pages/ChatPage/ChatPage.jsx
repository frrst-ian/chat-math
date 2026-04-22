import { useState, useRef } from 'react'
import { useSessions } from '../../hooks/useSessions'
import { useChat } from '../../hooks/useChat'
import { Sidebar } from '../../components/Sidebar/Sidebar'
import CenterStage from '../../components/CenterStage/CenterStage'
import RightPanel from '../../components/RightPanel/RightPanel'
import LogoutModal from '../../components/LogoutModal/LogoutModal'
import { useNavigate } from 'react-router-dom'
import styles from './ChatPage.module.css'

export default function ChatPage() {
  const navigate = useNavigate()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [logoutVisible, setLogoutVisible] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '' })
  const toastTimer = useRef(null)

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

      <RightPanel
        messages={chat.messages}
        onSend={chat.sendMessage}
        locked={chat.isLoading}
      />

      <LogoutModal
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={() => navigate('/login')}
      />
    </div>
  )
}