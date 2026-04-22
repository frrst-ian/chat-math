import { useState, useRef, useEffect } from 'react'
import styles from './RightPanel.module.css'
import Bubble from '../Bubble/Bubble'

export default function RightPanel({ messages, onSend, locked }) {
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
    <aside className={styles.rightPanel}>
      <div className={styles.chatContainer} ref={containerRef} role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map((m, i) => (
          <Bubble key={i} type={m.type} text={m.text} isStatus={m.isStatus} />
        ))}
      </div>

      <div className={styles.inputWrap}>
        <div className={styles.inputBar}>
          <textarea
            className={styles.chatInput}
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
            className={styles.sendBtn}
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