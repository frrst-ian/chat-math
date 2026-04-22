import styles from './Bubble.module.css'

export default function Bubble({ type, text, isStatus }) {
  if (type === 'user') {
    return <div className={styles.bubbleUser}>{text}</div>
  }

  return (
    <div className={isStatus ? styles.bubbleStatus : styles.bubbleAi}>
      {text}
    </div>
  )
}