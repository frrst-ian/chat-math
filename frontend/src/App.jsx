import { useState, useRef, useEffect, useCallback } from 'react'

const API_BASE = 'http://localhost:8000'

function fmtTime(s) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

// ── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ collapsed, onToggle, sessions, activeSessionId, onNewSession, onSelectSession, onLogout }) {
  return (
    <aside id="sidebar" className={collapsed ? 'collapsed' : ''}>
      <div className="sidebar-top">
        <button
          className="logo-circle"
          onClick={() => collapsed && onToggle()}
          aria-label={collapsed ? 'Open sidebar' : undefined}
        >
          <span className="logo-text">CM</span>
          <i className="ph ph-sidebar-simple logo-hover-icon" aria-hidden="true" />
        </button>
        <span className="brand-name">ChatMath</span>
        <button
          className="icon-btn collapse-btn"
          style={{ marginLeft: 'auto' }}
          title="Close sidebar"
          aria-label="Close sidebar"
          onClick={onToggle}
        >
          <i className="ph ph-sidebar-simple" style={{ fontSize: 18 }} aria-hidden="true" />
        </button>
      </div>

      <div className="sidebar-nav">
        <button className="nav-item" onClick={onNewSession}>
          <span className="nav-icon"><i className="ph ph-pencil-simple-line" aria-hidden="true" /></span>
          <span className="nav-label">New session</span>
        </button>
      </div>

      <div className="session-section">
        <div className="section-label">Recent</div>
        <div className="session-list">
          {sessions.map(s => (
            <button
              key={s.id}
              className={`session-btn${s.id === activeSessionId ? ' active' : ''}`}
              onClick={() => onSelectSession(s)}
            >
              <span className="s-dot" />
              <span className="s-label">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="user-row">
        <div className="user-avatar" aria-hidden="true">AJ</div>
        <div className="user-info">
          <div className="user-name">Aran Joshua</div>
          <div className="user-role">Teacher</div>
        </div>
        <button
          className="icon-btn"
          title="Log out"
          aria-label="Log out"
          style={{ marginLeft: 'auto' }}
          onClick={onLogout}
        >
          <i className="ph ph-sign-out" style={{ fontSize: 16 }} aria-hidden="true" />
        </button>
      </div>
    </aside>
  )
}

// ── VIDEO PLAYER ─────────────────────────────────────────────────────────────
function VideoPlayer({ videoUrl, onEnded }) {
  const videoRef = useRef(null)
  const wrapRef = useRef(null)
  const hideTimerRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [timeLabel, setTimeLabel] = useState('0:00 / 0:00')
  const [fillPct, setFillPct] = useState(0)
  const [scrubVal, setScrubVal] = useState(0)
  const [controlsVisible, setControlsVisible] = useState(false)
  const [isFs, setIsFs] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return
    video.src = videoUrl
    video.load()
    video.play().catch(() => {})
  }, [videoUrl])

  function showControls() { setControlsVisible(true) }
  function hideControls() { setControlsVisible(false) }
  function scheduleHide() {
    clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(hideControls, 2000)
  }

  function handleMouseEnter() {
    showControls()
    if (!videoRef.current?.paused) scheduleHide()
  }
  function handleMouseMove() {
    showControls()
    if (!videoRef.current?.paused) scheduleHide()
    else clearTimeout(hideTimerRef.current)
  }
  function handleMouseLeave() {
    clearTimeout(hideTimerRef.current)
    hideControls()
  }

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play()
    else v.pause()
  }

  function handleTimeUpdate() {
    const v = videoRef.current
    if (!v || !v.duration) return
    const pct = (v.currentTime / v.duration) * 100
    setFillPct(pct)
    setScrubVal(Math.round((v.currentTime / v.duration) * 1000))
    setTimeLabel(`${fmtTime(v.currentTime)} / ${fmtTime(v.duration)}`)
  }

  function handleLoadedMetadata() {
    const v = videoRef.current
    if (v) setTimeLabel(`0:00 / ${fmtTime(v.duration)}`)
  }

  function handleScrub(e) {
    const v = videoRef.current
    if (!v || !v.duration) return
    const val = Number(e.target.value)
    setScrubVal(val)
    v.currentTime = (val / 1000) * v.duration
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      wrapRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    function onFsChange() { setIsFs(!!document.fullscreenElement) }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  return (
    <div
      id="videoWrap"
      ref={wrapRef}
      className={`visible${controlsVisible ? ' controls-visible' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <video
        id="visualVideo"
        ref={videoRef}
        preload="auto"
        aria-label="Math visualization"
        onPlay={() => { setPlaying(true); scheduleHide() }}
        onPause={() => { setPlaying(false); clearTimeout(hideTimerRef.current) }}
        onEnded={() => {
          setPlaying(false)
          clearTimeout(hideTimerRef.current)
          hideControls()
          onEnded && onEnded()
        }}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
      <div id="videoControls">
        <button id="vcPlayPause" title="Play/Pause" aria-label="Play or pause" onClick={togglePlay}>
          <i id="vcPlayIcon" className={playing ? 'ph-fill ph-pause' : 'ph-fill ph-play'} aria-hidden="true" />
        </button>
        <span id="vcTime" aria-live="off">{timeLabel}</span>
        <div id="vcScrubTrack" role="presentation">
          <div id="vcScrubFill" style={{ width: `${fillPct}%` }} />
          <input
            id="vcScrub"
            type="range"
            min="0"
            max="1000"
            value={scrubVal}
            step="1"
            aria-label="Seek"
            onChange={handleScrub}
          />
        </div>
        <button id="vcFullscreen" title="Fullscreen" aria-label="Toggle fullscreen" onClick={toggleFullscreen}>
          <i id="vcFsIcon" className={isFs ? 'ph ph-arrows-in' : 'ph ph-arrows-out'} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

// ── CENTER STAGE ─────────────────────────────────────────────────────────────
function CenterStage({ videoUrl, isLoading, visualTitle, toast, onDismissToast }) {
  const exportWrapRef = useRef(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [exportLabel, setExportLabel] = useState('Export')

  useEffect(() => {
    function onDocClick(e) {
      if (exportWrapRef.current && !exportWrapRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  function handleExportBtn() {
    if (!videoUrl) {
      onDismissToast('No visualization to export yet')
      return
    }
    setDropdownOpen(v => !v)
  }

  function triggerDownload(src) {
    const a = document.createElement('a')
    a.href = src
    a.download = src.split('/').pop()
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  function handleDownload() {
    setDropdownOpen(false)
    setExportLabel('Exporting...')
    triggerDownload(videoUrl)
    setTimeout(() => {
      setExportLabel('Export')
      onDismissToast('Export saved successfully')
    }, 1200)
  }

  const showVideo = !!videoUrl && !isLoading

  return (
    <main id="centerStage">
      <div className="toolbar">
        <div className="export-wrap" ref={exportWrapRef}>
          <button
            className={`tool-btn${dropdownOpen ? ' export-btn-open' : ''}`}
            onClick={handleExportBtn}
          >
            <i className="ph ph-download-simple" style={{ fontSize: 15 }} aria-hidden="true" />
            <span>{exportLabel}</span>
            <i
              className={`ph ph-caret-down export-caret${dropdownOpen ? ' export-caret-open' : ''}`}
              style={{ fontSize: 11, marginLeft: 2 }}
              aria-hidden="true"
            />
          </button>
          <div id="exportDropdown" className={dropdownOpen ? 'open' : ''} role="menu" aria-label="Export options">
            <button className="export-option" role="menuitem" onClick={handleDownload}>
              <i className="ph ph-file-video" aria-hidden="true" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      <div id="canvasWrap">
        {showVideo && <VideoPlayer videoUrl={videoUrl} />}

        <div id="blankState" className={showVideo ? 'hidden' : ''}>
          <div className="blank-title">
            <div className="blank-icon">
              <i className="ph ph-chart-line" aria-hidden="true" />
            </div>
            Ready to bring math to life?
          </div>
        </div>

        <div id="loadingOverlay" className={isLoading ? 'show' : ''} role="status" aria-label="Rendering visualization">
          <div className="loading-inner">
            <div className="spinner" />
            <div className="loading-label">
              <span className="loading-title">Rendering visualization</span>
              <div className="loading-dots" aria-hidden="true">
                <span /><span /><span />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="bottomBar">
        <div id="titleView">
          <div className="title-pip" aria-hidden="true" />
          <span id="visualTitle">{visualTitle}</span>
        </div>
        <div id="toast" className={toast.visible ? 'show' : ''} role="status" aria-live="polite">
          <i className="ph-fill ph-check-circle toast-icon" aria-hidden="true" />
          <span>{toast.message}</span>
        </div>
      </div>
    </main>
  )
}

// ── CHAT BUBBLE ──────────────────────────────────────────────────────────────
function Bubble({ type, text, isStatus }) {
  if (type === 'user') {
    return <div className="bubble-user fade-in">{text}</div>
  }
  return (
    <div className={`bubble-ai fade-in${isStatus ? ' bubble-status' : ''}`}>
      {text}
    </div>
  )
}

// ── RIGHT PANEL ──────────────────────────────────────────────────────────────
function RightPanel({ messages, onSend, locked }) {
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const [inputVal, setInputVal] = useState('')

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function handleInput(e) {
    setInputVal(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  function submit() {
    const text = inputVal.trim()
    if (!text || locked) return
    onSend(text)
    setInputVal('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
  }

  return (
    <aside id="rightPanel">
      <div id="chatContainer" ref={containerRef} role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map((m, i) => (
          <Bubble key={i} type={m.type} text={m.text} isStatus={m.isStatus} />
        ))}
      </div>

      <div className="input-wrap">
        <div id="inputBar">
          <textarea
            id="chatInput"
            ref={inputRef}
            rows={1}
            placeholder="Ask ChatMath..."
            aria-label="Ask a math question"
            value={inputVal}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={locked}
            style={{ opacity: locked ? 0.4 : undefined }}
          />
          <button
            className="send-btn"
            id="sendBtn"
            title="Send"
            aria-label="Send message"
            onClick={submit}
            disabled={locked}
            style={{ opacity: locked ? 0.4 : undefined, pointerEvents: locked ? 'none' : undefined }}
          >
            <i className="ph-fill ph-paper-plane-right" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  )
}

// ── LOGOUT MODAL ─────────────────────────────────────────────────────────────
function LogoutModal({ visible, onCancel, onConfirm }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && visible) onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [visible, onCancel])

  return (
    <div id="logoutModal" className={visible ? 'show' : ''} role="dialog" aria-modal="true" aria-labelledby="logoutModalTitle">
      <div id="logoutBackdrop" onClick={onCancel} />
      <div id="logoutCard">
        <div className="modal-icon">
          <i className="ph ph-sign-out" aria-hidden="true" />
        </div>
        <div className="modal-title" id="logoutModalTitle">Log out of ChatMath?</div>
        <div className="modal-body">
          Your session and conversation history will be cleared. You'll need to sign in again to continue.
        </div>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="modal-btn modal-btn-confirm" onClick={onConfirm}>Log out</button>
        </div>
      </div>
    </div>
  )
}

// ── APP ROOT ─────────────────────────────────────────────────────────────────
const INITIAL_MESSAGES = [
  { type: 'ai', text: "Hello! Ask me a math question and I'll generate a visual explanation for you." }
]

let sessionCounter = 0

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sessions, setSessions] = useState([])
  const [activeSessionId, setActiveSessionId] = useState(null)
  const [isNewSession, setIsNewSession] = useState(true)
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [videoUrl, setVideoUrl] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [visualTitle, setVisualTitle] = useState('New Session')
  const [logoutVisible, setLogoutVisible] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '' })
  const toastTimerRef = useRef(null)

  function showToast(msg) {
    setToast({ visible: true, message: msg })
    clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => {
      setToast(t => ({ ...t, visible: false }))
    }, 2500)
  }

  function handleNewSession() {
    setActiveSessionId(null)
    setIsNewSession(true)
    setVisualTitle('New Session')
    setVideoUrl(null)
    setMessages(INITIAL_MESSAGES)
  }

  function handleSelectSession(session) {
    setActiveSessionId(session.id)
    setIsNewSession(false)
    setVisualTitle(session.label)
    setVideoUrl(session.videoUrl ?? null)
    setMessages([
      { type: 'ai', text: `Hello! Ask me anything about ${session.label} and I'll generate a visual explanation for you.` }
    ])
  }

  async function handleSend(text) {
    let currentSessionId = activeSessionId

    if (isNewSession) {
      setIsNewSession(false)
      const label = text.length > 30 ? `${text.slice(0, 30)}\u2026` : text
      sessionCounter++
      const newSession = { id: sessionCounter, label, videoUrl: null }
      setSessions(prev => [newSession, ...prev])
      setActiveSessionId(newSession.id)
      currentSessionId = newSession.id
      setVisualTitle(label)
    }

    setMessages(prev => [...prev, { type: 'user', text }])
    setIsLoading(true)
    setVideoUrl(null)

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversation_id: activeSessionId?.toString() ?? null })
      })

      if (!res.ok) throw new Error(`Server error ${res.status}`)

      const data = await res.json()
      // data shape: { reply: string, video_url: string | null }

      setIsLoading(false)

      if (data.video_url) {
        // video_url from backend is a local file path; convert to /video/<filename>
        const mediaIndex = data.video_url.replace(/\\/g, '/').indexOf('/media/')
        const relativePath = data.video_url.replace(/\\/g, '/').slice(mediaIndex + 7)
        const servedUrl = `${API_BASE}/video/${relativePath}`
        setVideoUrl(servedUrl)
        setSessions(prev =>
          prev.map(s => s.id === currentSessionId ? { ...s, videoUrl: servedUrl } : s)
        )
        setMessages(prev => [...prev, { type: 'ai', text: '\u2756 Visualization ready', isStatus: true }])
      }
    } catch (err) {
      setIsLoading(false)
      setMessages(prev => [
        ...prev,
        { type: 'ai', text: 'Something went wrong connecting to the backend. Make sure uvicorn is running.' }
      ])
      console.error(err)
    }
  }

  function handleToggleSidebar() {
    setSidebarCollapsed(v => !v)
    const sidebar = document.getElementById('sidebar')
    if (sidebar && sidebarCollapsed) {
      sidebar.classList.add('animating')
      setTimeout(() => sidebar.classList.remove('animating'), 260)
    }
  }

  return (
    <>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onNewSession={handleNewSession}
        onSelectSession={handleSelectSession}
        onLogout={() => setLogoutVisible(true)}
      />

      <CenterStage
        videoUrl={videoUrl}
        isLoading={isLoading}
        visualTitle={visualTitle}
        toast={toast}
        onDismissToast={showToast}
      />

      <RightPanel
        messages={messages}
        onSend={handleSend}
        locked={isLoading}
      />

      <LogoutModal
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={() => window.location.reload()}
      />
    </>
  )
}
