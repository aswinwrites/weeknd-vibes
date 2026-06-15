import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

function getThumb(youtubeId) {
  return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null;
}

export default function PlaylistRow({ song, rank, isPlaying, onPlay, delay = 0 }) {
  const [thumbError, setThumbError] = useState(false);
  const [hovered, setHovered] = useState(false);

  const thumb = getThumb(song.youtubeId);

  const scoreColor =
    song.matchPercent >= 80 ? '#00F5D4' :
    song.matchPercent >= 60 ? '#FF004D' :
    '#9D4EDD';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onPlay(song)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '10px 14px',
        borderRadius: 12,
        cursor: 'pointer',
        background: isPlaying
          ? 'rgba(255,0,77,0.08)'
          : hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        border: isPlaying
          ? '1px solid rgba(255,0,77,0.2)'
          : '1px solid transparent',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      {/* Rank / Playing indicator */}
      <div style={{
        width: 28,
        textAlign: 'center',
        flexShrink: 0,
      }}>
        {isPlaying ? (
          <motion.div
            style={{ display: 'flex', gap: 2, alignItems: 'flex-end', justifyContent: 'center', height: 16 }}
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ height: ['4px', '14px', '4px'] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
                style={{ width: 3, background: '#FF004D', borderRadius: 2 }}
              />
            ))}
          </motion.div>
        ) : (
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: hovered ? 'white' : 'rgba(255,255,255,0.25)',
          }}>
            {hovered ? '▶' : rank}
          </span>
        )}
      </div>

      {/* Thumbnail */}
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 8,
        overflow: 'hidden',
        flexShrink: 0,
        background: 'linear-gradient(135deg, #1a0a1a, #0d0d1a)',
        position: 'relative',
      }}>
        {thumb && !thumbError ? (
          <img
            src={thumb}
            alt={song.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setThumbError(true)}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', opacity: 0.3,
          }}>🎵</div>
        )}
        {isPlaying && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(255,0,77,0.25)',
            border: '1.5px solid rgba(255,0,77,0.5)',
            borderRadius: 8,
          }} />
        )}
      </div>

      {/* Song info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '0.9rem',
          fontWeight: isPlaying ? 700 : 600,
          color: isPlaying ? '#FF004D' : 'white',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: 1.3,
        }}>
          {song.title}
        </div>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.35)',
          marginTop: 2,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {song.album} · {song.era}
        </div>
      </div>

      {/* Tags (desktop only) */}
      <div style={{
        display: 'flex',
        gap: 4,
        flexShrink: 0,
      }}
        className="hide-mobile"
      >
        {song.tags.slice(0, 2).map(tag => (
          <span key={tag} style={{
            padding: '2px 7px',
            borderRadius: 99,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Match % */}
      <div style={{
        flexShrink: 0,
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '0.8rem',
        fontWeight: 700,
        color: scoreColor,
        minWidth: 40,
        textAlign: 'right',
      }}>
        {song.matchPercent}%
      </div>
    </motion.div>
  );
}
