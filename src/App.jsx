import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const floatingHearts = [
  { left: '4%', top: '5%', size: 'small', delay: '0s', icon: '\u2665' },
  { left: '13%', top: '14%', size: 'tiny', delay: '1.2s', icon: '\u2665' },
  { left: '84%', top: '7%', size: 'small', delay: '0.8s', icon: '\u2665' },
  { left: '77%', top: '32%', size: 'tiny', delay: '1.6s', icon: '\u2665' },
  { left: '19%', top: '72%', size: 'tiny', delay: '0.5s', icon: '\u2736' },
  { left: '89%', top: '74%', size: 'tiny', delay: '1.4s', icon: '\u2665' },
  { left: '6%', top: '86%', size: 'tiny', delay: '2s', icon: '\u2736' },
  { left: '92%', top: '89%', size: 'tiny', delay: '2.2s', icon: '\u2736' },
]

function App() {
  const [introOpened, setIntroOpened] = useState(false)
  const [introDone, setIntroDone] = useState(false)
  const [saidYes, setSaidYes] = useState(false)
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 })
  const [noHasMoved, setNoHasMoved] = useState(false)
  const [noCount, setNoCount] = useState(0)
  const [isYesExcited, setIsYesExcited] = useState(false)
  const [isYesHovered, setIsYesHovered] = useState(false)
  const noAnchorRef = useRef(null)
  const calmTimerRef = useRef(null)
  const celebrationParticles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 1.8}s`,
        duration: `${4.4 + Math.random() * 2.8}s`,
        size: `${0.9 + Math.random() * 1.4}rem`,
        drift: `${-42 + Math.random() * 84}px`,
        icon: Math.random() > 0.25 ? '\u2665' : '\u2736',
      })),
    [],
  )
  const introRoses = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        left: `${18 + Math.random() * 64}%`,
        top: `${20 + Math.random() * 52}%`,
        delay: `${Math.random() * 0.2}s`,
        dx: `${-160 + Math.random() * 320}px`,
        dy: `${-180 + Math.random() * 220}px`,
        rotate: `${-220 + Math.random() * 440}deg`,
        scale: `${0.75 + Math.random() * 0.7}`,
      })),
    [],
  )

  const getNoButtonSize = useCallback(() => {
    if (window.innerWidth <= 540) {
      return { width: 98, height: 44 }
    }
    return { width: 110, height: 46 }
  }, [])

  const moveNoButton = useCallback(() => {
    const buttonSize = getNoButtonSize()
    const padding = 16
    const maxX = Math.max(padding, window.innerWidth - buttonSize.width - padding)
    const maxY = Math.max(padding, window.innerHeight - buttonSize.height - padding)

    setNoHasMoved(true)
    setNoCount((count) => count + 1)
    setIsYesExcited(true)

    if (calmTimerRef.current) {
      clearTimeout(calmTimerRef.current)
    }
    calmTimerRef.current = setTimeout(() => {
      setIsYesExcited(false)
    }, 1400)

    setNoPosition({
      x: Math.floor(Math.random() * (maxX - padding + 1)) + padding,
      y: Math.floor(Math.random() * (maxY - padding + 1)) + padding,
    })
  }, [getNoButtonSize])

  const placeNoAtAnchor = useCallback(() => {
    if (!noAnchorRef.current) return

    const anchorRect = noAnchorRef.current.getBoundingClientRect()
    setNoPosition({
      x: Math.floor(anchorRect.left),
      y: Math.floor(anchorRect.top),
    })
  }, [])

  useEffect(() => {
    placeNoAtAnchor()
  }, [placeNoAtAnchor])

  useEffect(() => {
    if (!introDone || saidYes || noHasMoved) return

    const frame = requestAnimationFrame(placeNoAtAnchor)
    const t1 = setTimeout(placeNoAtAnchor, 180)
    const t2 = setTimeout(placeNoAtAnchor, 420)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [introDone, saidYes, noHasMoved, placeNoAtAnchor])

  useEffect(() => {
    const onResize = () => {
      if (!noHasMoved && !saidYes) {
        placeNoAtAnchor()
      }
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [noHasMoved, saidYes, placeNoAtAnchor])

  useEffect(() => {
    return () => {
      if (calmTimerRef.current) {
        clearTimeout(calmTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!introOpened) return
    const timer = setTimeout(() => {
      setIntroDone(true)
    }, 1100)
    return () => clearTimeout(timer)
  }, [introOpened])

  return (
    <main className={`valentine-page ${saidYes ? 'celebration-on' : ''} ${introDone ? 'intro-finished' : 'intro-pending'}`}>
      {!introDone && (
        <div className={`intro-overlay ${introOpened ? 'open' : ''}`}>
          <div
            className="intro-roses"
            role="button"
            aria-label="Start animation"
            tabIndex={0}
            onClick={() => setIntroOpened(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                setIntroOpened(true)
              }
            }}
          >
            {introRoses.map((rose) => (
              <span
                key={rose.id}
                className="intro-rose"
                style={{
                  left: rose.left,
                  top: rose.top,
                  animationDelay: rose.delay,
                  '--rose-dx': rose.dx,
                  '--rose-dy': rose.dy,
                  '--rose-rotate': rose.rotate,
                  '--rose-scale': rose.scale,
                }}
              >
                🌹
              </span>
            ))}
          </div>
          {!introOpened && <p className="intro-hint"></p>}
        </div>
      )}

      <div className="floating-layer" aria-hidden="true">
        {floatingHearts.map((heart, index) => (
          <span
            key={`${heart.left}-${index}`}
            className={`float-mark ${heart.size}`}
            style={{ left: heart.left, top: heart.top, animationDelay: heart.delay }}
          >
            {heart.icon}
          </span>
        ))}
      </div>
      {saidYes && <div className="bg-light-bloom" aria-hidden="true" />}
      {saidYes && (
        <div className="celebration-layer" aria-hidden="true">
          {celebrationParticles.map((particle) => (
            <span
              key={particle.id}
              className="celebration-heart"
              style={{
                left: particle.left,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
                fontSize: particle.size,
                '--heart-drift': particle.drift,
              }}
            >
              {particle.icon}
            </span>
          ))}
        </div>
      )}

      <article className="love-card">
        <p className="eyebrow">Nursey Babby</p>
        <h1>Happy Valentine's Day!</h1>

        <div className="divider" aria-hidden="true">
          <span />
          <b>{'\u2665'}</b>
          <span />
        </div>

        <p className="subtitle">This is something for you</p>

        {saidYes ? (
          <section className="invite-box" aria-label="Event details">
            <p className="invite-heading">YOU ARE CORDIALLY INVITED</p>
            <p className="invite-row">Date: February 14th, 9:00 AM</p>
            <p className="invite-row">Place: Our favorite Place</p>
          </section>
        ) : (
          <p className="details-locked">Say yes to unlock more details!</p>
        )}

        {!saidYes && (
          <div className="actions-row">
            <button
              className={`yes-button ${isYesExcited ? 'yes-breathe-active' : 'yes-breathe-idle'} ${
                isYesHovered ? 'yes-glow' : ''
              }`}
              type="button"
              onClick={() => setSaidYes(true)}
              onMouseEnter={() => setIsYesHovered(true)}
              onMouseLeave={() => setIsYesHovered(false)}
              onFocus={() => setIsYesHovered(true)}
              onBlur={() => setIsYesHovered(false)}
              style={{ '--yes-scale': isYesExcited ? `${Math.min(1.12 + noCount * 0.06, 1.55)}` : '1.03' }}
            >
              {'Say YES '}
              
            </button>
            <span ref={noAnchorRef} className="no-anchor" aria-hidden="true" />
          </div>
        )}

        {saidYes && (
          <>
            <p className="signoff">Your's truly</p>
            <p className="signature">BABBY</p>
          </>
        )}
      </article>

      {!saidYes && introDone && (
        <button
          className="no-button"
          type="button"
          style={{ left: `${noPosition.x}px`, top: `${noPosition.y}px` }}
          onMouseEnter={moveNoButton}
          onClick={moveNoButton}
          onTouchStart={moveNoButton}
        >
          No
        </button>
      )}
    </main>
  )
}

export default App
