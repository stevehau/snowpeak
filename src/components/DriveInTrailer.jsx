import { useState, useEffect, useCallback } from 'react'

const GITHUB_PAGES_URL = 'https://stevehau.github.io/snowpeak/'

function DriveInTrailer({ onBack, standalone = false }) {
  const [lightsOff, setLightsOff] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false)

  // Dim lights then start the trailer
  useEffect(() => {
    const t1 = setTimeout(() => setLightsOff(true), 800)
    const t2 = setTimeout(() => setShowTrailer(true), 1600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const handleBack = useCallback(() => {
    if (standalone) {
      window.location.hash = ''
      window.location.reload()
    } else {
      onBack()
    }
  }, [onBack, standalone])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') handleBack()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleBack])

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: lightsOff
        ? 'linear-gradient(180deg, #050510 0%, #0a0a20 40%, #0c1225 100%)'
        : 'linear-gradient(180deg, #1a2040 0%, #0a1030 40%, #0c1225 100%)',
      transition: 'background 1.5s ease',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      fontFamily: "'Georgia', serif",
    }}>

      {/* Stars in the night sky */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {[
          { x: 5, y: 3, s: 2 }, { x: 12, y: 8, s: 1.5 }, { x: 20, y: 2, s: 1 },
          { x: 30, y: 6, s: 2 }, { x: 42, y: 4, s: 1.5 }, { x: 55, y: 7, s: 1 },
          { x: 65, y: 2, s: 2 }, { x: 75, y: 5, s: 1.5 }, { x: 85, y: 3, s: 1 },
          { x: 92, y: 8, s: 2 }, { x: 8, y: 12, s: 1 }, { x: 35, y: 11, s: 1.5 },
          { x: 58, y: 10, s: 1 }, { x: 78, y: 13, s: 1.5 }, { x: 95, y: 11, s: 1 },
          { x: 15, y: 15, s: 1 }, { x: 48, y: 14, s: 1 }, { x: 88, y: 16, s: 1 },
        ].map((star, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.s,
            height: star.s,
            borderRadius: '50%',
            background: 'white',
            opacity: lightsOff ? (0.3 + Math.random() * 0.5) : 0.1,
            transition: 'opacity 2s ease',
          }} />
        ))}
      </div>

      {/* "NOW SHOWING" sign above screen */}
      <div style={{
        color: '#FFD700',
        fontSize: 'clamp(10px, 1.8vw, 18px)',
        letterSpacing: '6px',
        textTransform: 'uppercase',
        marginBottom: '8px',
        opacity: lightsOff ? 0.8 : 0.4,
        transition: 'opacity 1.5s ease',
        textShadow: '0 0 10px rgba(255,215,0,0.5)',
      }}>
        Now Showing
      </div>

      {/* ===== THE MOVIE SCREEN ===== */}
      <div style={{
        position: 'relative',
        width: 'min(85vw, 960px)',
        maxWidth: '960px',
      }}>
        {/* Screen frame (wooden/metal border) */}
        <div style={{
          border: '6px solid #3a3020',
          borderRadius: '4px',
          boxShadow: lightsOff
            ? '0 0 40px rgba(255,255,255,0.05), inset 0 0 30px rgba(0,0,0,0.3), 0 8px 30px rgba(0,0,0,0.6)'
            : '0 0 10px rgba(255,255,255,0.02), inset 0 0 10px rgba(0,0,0,0.2), 0 4px 15px rgba(0,0,0,0.4)',
          background: '#111',
          transition: 'box-shadow 1.5s ease',
          overflow: 'hidden',
        }}>
          {/* Inner screen border (projector light edge) */}
          <div style={{
            border: '2px solid #555',
            borderRadius: '2px',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Projector beam shimmer */}
            {showTrailer && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 50%, rgba(255,255,255,0.02) 100%)',
                pointerEvents: 'none',
                zIndex: 2,
              }} />
            )}

            {/* The actual trailer or "curtain" */}
            {showTrailer ? (
              <object
                data="trailer.svg"
                type="image/svg+xml"
                style={{
                  width: '100%',
                  display: 'block',
                  aspectRatio: '1200 / 675',
                  background: '#000',
                }}
              >
                <img src="trailer.svg" alt="Snowpeak Resort Trailer" style={{ width: '100%' }} />
              </object>
            ) : (
              <div style={{
                width: '100%',
                aspectRatio: '1200 / 675',
                background: 'linear-gradient(180deg, #1a0a0a 0%, #0a0505 50%, #1a0a0a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  color: '#FFD700',
                  fontSize: 'clamp(14px, 2.5vw, 28px)',
                  letterSpacing: '8px',
                  opacity: 0.7,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}>
                  LIGHTS DIMMING...
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Screen support posts */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
          <div style={{ width: '8px', height: '30px', background: '#2a2015', borderRadius: '0 0 2px 2px' }} />
          <div style={{ width: '8px', height: '30px', background: '#2a2015', borderRadius: '0 0 2px 2px' }} />
        </div>
      </div>

      {/* ===== AUDIENCE / CAR SILHOUETTES ===== */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '18%',
        pointerEvents: 'none',
      }}>
        {/* Ground */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
          background: 'linear-gradient(180deg, transparent, #080812 30%, #0a0a15)',
        }} />

        {/* Car silhouettes */}
        <svg viewBox="0 0 1200 140" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%' }} preserveAspectRatio="xMidYMax meet">
          {/* Car 1 (left) */}
          <g transform="translate(100,60)" opacity="0.35">
            <rect x="-50" y="10" width="100" height="30" rx="4" fill="#111"/>
            <rect x="-35" y="-5" width="70" height="20" rx="8" fill="#111"/>
            <rect x="-25" y="-2" width="20" height="12" rx="2" fill="#1a1a2a" opacity="0.6"/>
            <rect x="5" y="-2" width="20" height="12" rx="2" fill="#1a1a2a" opacity="0.6"/>
            <circle cx="-30" cy="42" r="10" fill="#0a0a12"/>
            <circle cx="30" cy="42" r="10" fill="#0a0a12"/>
            {/* Taillight glow */}
            <circle cx="-48" cy="22" r="3" fill="#ff2222" opacity="0.3"/>
          </g>

          {/* Car 2 (center-left) */}
          <g transform="translate(350,50)" opacity="0.3">
            <rect x="-55" y="10" width="110" height="34" rx="5" fill="#0e0e18"/>
            <rect x="-40" y="-8" width="80" height="24" rx="10" fill="#0e0e18"/>
            <rect x="-30" y="-4" width="22" height="14" rx="3" fill="#181828" opacity="0.5"/>
            <rect x="8" y="-4" width="22" height="14" rx="3" fill="#181828" opacity="0.5"/>
            <circle cx="-34" cy="46" r="11" fill="#080812"/>
            <circle cx="34" cy="46" r="11" fill="#080812"/>
          </g>

          {/* Pickup truck (center) */}
          <g transform="translate(600,55)" opacity="0.25">
            <rect x="-60" y="8" width="120" height="36" rx="4" fill="#101018"/>
            <rect x="-55" y="-12" width="50" height="26" rx="6" fill="#101018"/>
            <rect x="-45" y="-8" width="16" height="14" rx="2" fill="#1a1a28" opacity="0.5"/>
            <rect x="-25" y="-8" width="16" height="14" rx="2" fill="#1a1a28" opacity="0.5"/>
            <rect x="0" y="-2" width="56" height="16" rx="2" fill="#0c0c16"/>
            <circle cx="-38" cy="46" r="12" fill="#080810"/>
            <circle cx="40" cy="46" r="12" fill="#080810"/>
          </g>

          {/* Car 3 (center-right) */}
          <g transform="translate(830,50)" opacity="0.3">
            <rect x="-50" y="10" width="100" height="30" rx="4" fill="#0f0f1a"/>
            <rect x="-35" y="-5" width="70" height="20" rx="8" fill="#0f0f1a"/>
            <rect x="-25" y="-2" width="20" height="12" rx="2" fill="#191928" opacity="0.6"/>
            <rect x="5" y="-2" width="20" height="12" rx="2" fill="#191928" opacity="0.6"/>
            <circle cx="-30" cy="42" r="10" fill="#080812"/>
            <circle cx="30" cy="42" r="10" fill="#080812"/>
          </g>

          {/* SUV (right) */}
          <g transform="translate(1060,48)" opacity="0.35">
            <rect x="-55" y="8" width="110" height="38" rx="5" fill="#111"/>
            <rect x="-45" y="-14" width="90" height="28" rx="6" fill="#111"/>
            <rect x="-35" y="-10" width="18" height="16" rx="2" fill="#1a1a2a" opacity="0.5"/>
            <rect x="-12" y="-10" width="18" height="16" rx="2" fill="#1a1a2a" opacity="0.5"/>
            <rect x="12" y="-10" width="18" height="16" rx="2" fill="#1a1a2a" opacity="0.5"/>
            <circle cx="-34" cy="48" r="12" fill="#0a0a14"/>
            <circle cx="34" cy="48" r="12" fill="#0a0a14"/>
            <circle cx="53" cy="20" r="3" fill="#ff2222" opacity="0.2"/>
          </g>

          {/* Speaker posts between cars */}
          <g opacity="0.2" fill="#222">
            <rect x="228" y="20" width="4" height="70"/>
            <rect x="226" y="16" width="8" height="12" rx="2"/>
            <rect x="490" y="25" width="4" height="65"/>
            <rect x="488" y="21" width="8" height="12" rx="2"/>
            <rect x="720" y="22" width="4" height="68"/>
            <rect x="718" y="18" width="8" height="12" rx="2"/>
            <rect x="950" y="24" width="4" height="66"/>
            <rect x="948" y="20" width="8" height="12" rx="2"/>
          </g>
        </svg>
      </div>

      {/* ===== CONTROL BUTTONS (bottom overlay) ===== */}
      <div style={{
        position: 'absolute',
        bottom: '22%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 'clamp(8px, 2vw, 20px)',
        zIndex: 10,
      }}>
        <button
          onClick={() => window.open(GITHUB_PAGES_URL, '_blank')}
          style={{
            background: 'linear-gradient(180deg, #FFD700, #E6A800)',
            color: '#1a2a4a',
            border: 'none',
            padding: 'clamp(6px, 1vw, 12px) clamp(12px, 2vw, 28px)',
            borderRadius: '24px',
            fontSize: 'clamp(10px, 1.4vw, 16px)',
            fontWeight: 'bold',
            letterSpacing: '2px',
            cursor: 'pointer',
            fontFamily: "'Georgia', serif",
            boxShadow: '0 0 20px rgba(255,215,0,0.3), 0 4px 12px rgba(0,0,0,0.4)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; e.target.style.boxShadow = '0 0 30px rgba(255,215,0,0.5), 0 4px 15px rgba(0,0,0,0.5)' }}
          onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = '0 0 20px rgba(255,215,0,0.3), 0 4px 12px rgba(0,0,0,0.4)' }}
        >
          PLAY THE GAME
        </button>

        <button
          onClick={() => {
            const url = GITHUB_PAGES_URL + '#trailer'
            navigator.clipboard.writeText(url).catch(() => {})
            alert('Link copied!\n' + url)
          }}
          style={{
            background: 'rgba(100,150,200,0.2)',
            color: '#8AACCC',
            border: '1.5px solid #8AACCC',
            padding: 'clamp(6px, 1vw, 12px) clamp(12px, 2vw, 28px)',
            borderRadius: '24px',
            fontSize: 'clamp(10px, 1.4vw, 16px)',
            fontWeight: 'bold',
            letterSpacing: '2px',
            cursor: 'pointer',
            fontFamily: "'Georgia', serif",
            transition: 'transform 0.2s, background 0.2s',
          }}
          onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; e.target.style.background = 'rgba(100,150,200,0.35)' }}
          onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.background = 'rgba(100,150,200,0.2)' }}
        >
          SHARE LINK
        </button>

        <button
          onClick={handleBack}
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: '#aaa',
            border: '1.5px solid #555',
            padding: 'clamp(6px, 1vw, 12px) clamp(12px, 2vw, 28px)',
            borderRadius: '24px',
            fontSize: 'clamp(10px, 1.4vw, 16px)',
            fontWeight: 'bold',
            letterSpacing: '2px',
            cursor: 'pointer',
            fontFamily: "'Georgia', serif",
            transition: 'transform 0.2s, background 0.2s',
          }}
          onMouseEnter={e => { e.target.style.transform = 'scale(1.05)'; e.target.style.background = 'rgba(255,255,255,0.15)' }}
          onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.background = 'rgba(255,255,255,0.08)' }}
        >
          EXIT
        </button>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default DriveInTrailer
