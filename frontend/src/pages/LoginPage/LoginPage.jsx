import { useNavigate } from 'react-router-dom'
import styles from './LoginPage.module.css'

export default function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>
          <span>CM</span>
        </div>
        <h1 className={styles.loginTitle}>ChatMath</h1>
        <p className={styles.loginSub}>Math visualization for teachers</p>

        <div className={styles.loginFields}>
          <input className={styles.loginInput} type="email" placeholder="Email" />
          <input className={styles.loginInput} type="password" placeholder="Password" />
        </div>

        <button className={styles.loginBtn} onClick={() => navigate('/')}>
          Sign in
        </button>

        <div className={styles.loginDivider}><span>or</span></div>

        <button className={styles.loginGoogleBtn}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.1-6.1C34.36 3.1 29.45 1 24 1 14.82 1 7.07 6.48 3.64 14.18l7.1 5.52C12.4 13.62 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.42c-.54 2.9-2.18 5.36-4.64 7.02l7.1 5.52C43.18 37.48 46.1 31.4 46.1 24.5z"/>
            <path fill="#FBBC05" d="M10.74 28.3A14.6 14.6 0 0 1 9.5 24c0-1.5.26-2.95.74-4.3l-7.1-5.52A23.9 23.9 0 0 0 .1 24c0 3.86.92 7.5 2.54 10.72l7.1-5.52z"/>
            <path fill="#34A853" d="M24 47c5.45 0 10.02-1.8 13.36-4.9l-7.1-5.52C28.5 38.4 26.36 39.1 24 39.1c-6.26 0-11.6-4.12-13.26-9.7l-7.1 5.52C7.07 42.52 14.82 47 24 47z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  )
}