import { useEffect } from 'react'
import styles from './LogoutModal.module.css'

export default function LogoutModal({ visible, onCancel, onConfirm }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && visible) onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [visible, onCancel])

  return (
    <div className={`${styles.modal} ${visible ? styles.show : ''}`} role="dialog" aria-modal="true" aria-labelledby="logoutModalTitle">
      <div className={styles.backdrop} onClick={onCancel} />
      <div className={styles.card}>
        <div className={styles.icon}>
          <i className="ph ph-sign-out" aria-hidden="true" />
        </div>
        <div className={styles.title} id="logoutModalTitle">Log out of ChatMath?</div>
        <div className={styles.body}>
          Your session and conversation history will be cleared. You'll need to sign in again to continue.
        </div>
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.btnCancel}`} onClick={onCancel}>Cancel</button>
          <button className={`${styles.btn} ${styles.btnConfirm}`} onClick={onConfirm}>Log out</button>
        </div>
      </div>
    </div>
  )
}