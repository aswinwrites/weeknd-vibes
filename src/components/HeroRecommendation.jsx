import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import VideoPlayer from './VideoPlayer';

function getHeroThumb(youtubeId) {
  if (!youtubeId) return null;
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
}

export default function HeroRecommendation({ song }) {
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [thumbSrc, setThumbSrc] = useState(() => getHeroThumb(song?.youtubeId));

  const handleThumbError = useCallback(() => {
    if (thumbSrc && thumbSrc.includes('maxresdefault')) {
      // Downgrade to hqdefault
      setThumbSrc(`https://img.youtube.com/vi/${song.youtubeId}/hqdefault.jpg`);
    } else {
      setThumbSrc(null);
    }
  }, [thumbSrc, song?.youtubeId]);

  if (!song) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          position: 'relative',
          borderRadius: 24,
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,0,77,0.2)',
          boxShadow: '0 0 60px rgba(255,0,77,0.12), 0 40px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Background image with overlay */}
        <div style={{ position: 'relative' }}>
          {thumbSrc ? (
            <img
              src={thumbSrc}
              alt={song.title}
              style={{
                width: '100%',
                height: 360,
                objectFit: 'cover',
                display: 'block',
              }}
              onError={handleThumbError}
            />
          ) : (
            <div style={{
              width: '100%',
              height: 360,
              background: 'linear-gradient(135deg, #1a0520 0%, #0a0a1a 50%, #1a0a05 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{ fontSize: '4rem', opacity: 0.15 }}>🎵</div>
            </div>
          )}

          {/* Gradient overlays */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(5,5,5,1) 0%, rgba(5,5,5,0.7) 40%, rgba(5,5,5,0.1) 100%)',
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,0,77,0.08) 0%, transparent 60%)',
          }} />

          {/* #1 Pick badge */}
          <div style={{
            position: 'absolute',
            top: 20,
            left: 20,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: 99,
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            border: '1px solid rgba(255,0,77,0.3)',
          }}>
            <span style={{ fontSize: '0.75rem' }}>🎯</span>
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#FF004D',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              #1 Match
            </span>
          </div>

          {/* Match score badge */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(12px)',
              borderRadius: 12,
              padding: '10px 14px',
              border: '1px solid rgba(0,245,212,0.3)',
              textAlign: 'center',
            }}
          >
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#00F5D4',
              lineHeight: 1,
            }}>
              {song.matchPercent}%
            </div>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.4)',
              marginTop: 2,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}>
              match
            </div>
          </motion.div>
        </div>

        {/* Content area */}
        <div style={{ padding: '0 24px 24px', marginTop: -40, position: 'relative' }}>
          {/* Album + era */}
          <div style={{ marginBottom: 8 }}>
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.8125rem',
              color: 'rgba(255,255,255,0.45)',
              letterSpacing: '0.03em',
            }}>
              {song.album} · {song.era}
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            marginBottom: 12,
          }}>
            {song.title}
          </h1>

          {/* Why it was recommended */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 12,
            padding: '12px 16px',
            marginBottom: 16,
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#FF004D',
              marginBottom: 8,
            }}>
              Why this song
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {song.matchReasons.map((reason, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.875rem',
                    color: 'rgba(255,255,255,0.7)',
                  }}
                >
                  <span style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: '#FF004D',
                    flexShrink: 0,
                  }} />
                  {reason}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
            {song.tags.map(tag => (
              <span key={tag} style={{
                padding: '4px 10px',
                borderRadius: 99,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.09)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
              }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(255,0,77,0.5)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPlaying(true)}
              style={{
                flex: 1,
                padding: '14px 20px',
                borderRadius: 12,
                background: 'linear-gradient(135deg, #FF004D, #FF2E63)',
                border: 'none',
                color: 'white',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '0.9375rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 0 24px rgba(255,0,77,0.3), 0 4px 16px rgba(0,0,0,0.4)',
                transition: 'box-shadow 0.2s',
              }}
            >
              ▶ Play Now
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setSaved(s => !s)}
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: saved ? 'rgba(255,0,77,0.15)' : 'rgba(255,255,255,0.06)',
                border: saved ? '1px solid rgba(255,0,77,0.4)' : '1px solid rgba(255,255,255,0.1)',
                fontSize: '1.25rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              {saved ? '❤️' : '🤍'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Video player modal */}
      {playing && (
        <VideoPlayer
          youtubeId={song.youtubeId}
          title={song.title}
          onClose={() => setPlaying(false)}
        />
      )}
    </>
  );
}
