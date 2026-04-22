import { useState, useRef, useEffect } from 'react'
import VideoPlayer from '../VideoPlayer/VideoPlayer'
import styles from './CenterStage.module.css'

export default function CenterStage({ videoUrl, isLoading, visualTitle, toast, onDismissToast }) {
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
    <main className={styles.centerStage}>
      <div className={styles.toolbar}>
        <div className={styles.exportWrap} ref={exportWrapRef}>
          <button
            className={`${styles.toolBtn} ${dropdownOpen ? styles.exportBtnOpen : ''}`}
            onClick={handleExportBtn}
          >
            <i className="ph ph-download-simple" style={{ fontSize: 15 }} aria-hidden="true" />
            <span>{exportLabel}</span>
            <i
              className={`ph ph-caret-down ${styles.exportCaret} ${dropdownOpen ? styles.exportCaretOpen : ''}`}
              style={{ fontSize: 11, marginLeft: 2 }}
              aria-hidden="true"
            />
          </button>
          <div className={`${styles.exportDropdown} ${dropdownOpen ? styles.open : ''}`} role="menu" aria-label="Export options">
            <button className={styles.exportOption} role="menuitem" onClick={handleDownload}>
              <i className="ph ph-file-video" aria-hidden="true" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.canvasWrap}>
        {showVideo && <VideoPlayer videoUrl={videoUrl} />}

        <div className={`${styles.blankState} ${showVideo ? styles.hidden : ''}`}>
          <div className={styles.blankTitle}>
            <div className={styles.blankIcon}>
              <i className="ph ph-chart-line" aria-hidden="true" />
            </div>
            Ready to bring math to life?
          </div>
        </div>

        <div className={`${styles.loadingOverlay} ${isLoading ? styles.show : ''}`} role="status" aria-label="Rendering visualization">
          <div className={styles.loadingInner}>
            <div className={styles.spinner} />
            <div className={styles.loadingLabel}>
              <span className={styles.loadingTitle}>Rendering visualization</span>
              <div className={styles.loadingDots} aria-hidden="true">
                <span /><span /><span />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.titleView}>
          <div className="title-pip" aria-hidden="true" />
          <span className={styles.visualTitle}>{visualTitle}</span>
        </div>
        <div className={`${styles.toast} ${toast.visible ? styles.show : ''}`} role="status" aria-live="polite">
          <i className={`ph-fill ph-check-circle ${styles.toastIcon}`} aria-hidden="true" />
          <span>{toast.message}</span>
        </div>
      </div>
    </main>
  )
}