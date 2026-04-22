import styles from './Bubble.module.css'

export default function Bubble({ type, text, isStatus }) {
    if (type === 'user') {
        return <div className={styles.user}>{text}</div>
    }
    if (isStatus) {
        return (
            <div className={styles.status}>
                <span className={styles.statusDot} />
                {text}
            </div>
        )
    }
    return <div className={styles.ai}>{text}</div>
}