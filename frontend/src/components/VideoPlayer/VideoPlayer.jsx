import { useState, useRef, useEffect } from 'react'
import styles from './VideoPlayer.module.css'

function fmtTime(s) {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function VideoPlayer({ videoUrl, onEnded }) {
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
        hideTimerRef.current = setTimeout(hideControls, 2500)
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
            ref={wrapRef}
            className={`${styles.videoWrap} ${controlsVisible ? styles.controlsVisible : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={togglePlay}
        >
            <video
                className={styles.video}
                ref={videoRef}
                preload="auto"
                aria-label="Math visualization"
                onPlay={() => { setPlaying(true); scheduleHide() }}
                onPause={() => { setPlaying(false); clearTimeout(hideTimerRef.current) }}
                onEnded={() => {
                    setPlaying(false)
                    clearTimeout(hideTimerRef.current)
                    showControls()
                    onEnded && onEnded()
                }}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
            />
            <div className={styles.controls} onClick={e => e.stopPropagation()}>
                <button className={styles.playPause} title="Play/Pause" aria-label="Play or pause" onClick={togglePlay}>
                    <i className={playing ? 'ph-fill ph-pause' : 'ph-fill ph-play'} aria-hidden="true" />
                </button>
                <span className={styles.time} aria-live="off">{timeLabel}</span>
                <div className={styles.scrubTrack} role="presentation">
                    <div className={styles.scrubFill} style={{ width: `${fillPct}%` }} />
                    <input
                        className={styles.scrub}
                        type="range"
                        min="0"
                        max="1000"
                        value={scrubVal}
                        step="1"
                        aria-label="Seek"
                        onChange={handleScrub}
                    />
                </div>
                <button className={styles.fullscreen} title="Fullscreen" aria-label="Toggle fullscreen" onClick={toggleFullscreen}>
                    <i className={isFs ? 'ph ph-arrows-in' : 'ph ph-arrows-out'} aria-hidden="true" />
                </button>
            </div>
        </div>
    )
}