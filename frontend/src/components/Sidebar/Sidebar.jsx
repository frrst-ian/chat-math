import styles from "./Sidebar.module.css"
export function Sidebar({ collapsed, onToggle, sessions, activeSessionId, onNewSession, onSelectSession, onLogout }) {
  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarTop}>
        <button
          className={styles.logoCircle}
          onClick={() => collapsed && onToggle()}
          aria-label={collapsed ? 'Open sidebar' : undefined}
        >
          <span className={styles.logoText}>CM</span>
          <i className={`ph ph-sidebar-simple ${styles.logoHoverIcon}`} aria-hidden="true" />
        </button>
        <span className={styles.brandName}>ChatMath</span>
        <button
          className={`${styles.iconBtn} ${styles.collapseBtn}`}
          style={{ marginLeft: 'auto' }}
          title="Close sidebar"
          aria-label="Close sidebar"
          onClick={onToggle}
        >
          <i className="ph ph-sidebar-simple" style={{ fontSize: 18 }} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.sidebarNav}>
        <button className={styles.navItem} onClick={onNewSession}>
          <span className={styles.navIcon}><i className="ph ph-pencil-simple-line" aria-hidden="true" /></span>
          <span className={styles.navLabel}>New session</span>
        </button>
      </div>

      <div className={styles.sessionSection}>
        <div className={styles.sectionLabel}>Recent</div>
        <div className={styles.sessionList}>
          {sessions.map(s => (
            <button
              key={s.id}
              className={`${styles.sessionBtn} ${s.id === activeSessionId ? styles.active : ''}`}
              onClick={() => onSelectSession(s)}
            >
              <span className={styles.sDot} />
              <span className={styles.sLabel}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.userRow}>
        <div className={styles.userAvatar} aria-hidden="true">AJ</div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>Aran Joshua</div>
          <div className={styles.userRole}>Teacher</div>
        </div>
        <button
          className={styles.iconBtn}
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