import { useState } from 'react';
import { motion } from 'framer-motion';

function getThumbUrl(youtubeId) {
  if (!youtubeId) return null;
  return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
}

export default function SongCard({ song, rank, onPlay, onSimilar, delay = 0 }) {
  const [saved, setSaved] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [thumbError, setThumbError] = useState(false);

  const thumbUrl = getThumbUrl(song.youtubeId);

  const scoreColor =
    song.matchPercent >= 80 ? '#00F5D4' :
    song.matchPercent >= 60 ? '#FF004D' :
    song.matchPercent >= 40 ? '#9D4EDD' :
    'rgba(255,255,255,0.4)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        background: hovered
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(255,255,255,0.03)',
        border: hovered
          ? '1px solid rgba(255,0,77,0.25)'
          : '1px solid rgba(255,255,255,0.07)',
        transition: 'background 0.25s, border-color 0.25s, box-shadow 0.3s',
        boxShadow: hovered
          ? '0 8px 40px rgba(0,0,0,0.5), 0 0 20px rgba(255,0,77,0.08)'
          : '0 2px 12px rgba(0,0,0,0.3)',
        cursor: 'default',
      }}
    >
      {/* Rank badge */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 2,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        borderRadius: 6,
        padding: '2px 8px',
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '0.7rem',
        fontWeight: 700,
        color: 'rgba(255,255,255,0.5)',
      }}>
        #{rank}
      </div>

      {/* Match score badge */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 2,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        borderRadius: 99,
        padding: '3px 10px',
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '0.75rem',
        fontWeight: 700,
        color: scoreColor,
        border: `1px solid ${scoreColor}40`,
        boxShadow: `0 0 8px ${scoreColor}30`,
      }}>
        {song.matchPercent}%
      </div>

      {/* Cover image */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingBottom: '75%',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1a0a1a 0%, #0d0d1a 100%)',
      }}>
        {thumbUrl && !thumbError ? (
          <img
            src={thumbUrl}
            alt={song.title}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
            }}
            onError={() => setThumbError(true)}
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}>
            <div style={{ fontSize: '2rem', opacity: 0.3 }}>🎵</div>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.2)',
              textAlign: 'center',
              padding: '0 12px',
            }}>{song.title}</div>
          </div>
        )}

        {/* Play overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)',
          }}
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onPlay(song)}
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#FF004D',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px rgba(255,0,77,0.5)',
              fontSize: '1.25rem',
            }}
          >
            ▶
          </motion.button>
        </motion.div>
      </div>

      {/* Song info */}
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontWeight: 600,
          fontSize: '0.9375rem',
          color: 'white',
          lineHeight: 1.2,
          marginBottom: 4,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {song.title}
        </div>
        <div style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.45)',
          marginBottom: 10,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {song.album} · {song.era}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {song.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{
              padding: '2px 8px',
              borderRadius: 99,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.09)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
            }}>
              {tag}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPlay(song)}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: 8,
              background: 'rgba(255,0,77,0.12)',
              border: '1px solid rgba(255,0,77,0.25)',
              color: '#FF004D',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            ▶ Play
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSaved(s => !s)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: saved ? 'rgba(255,0,77,0.15)' : 'rgba(255,255,255,0.05)',
              border: saved ? '1px solid rgba(255,0,77,0.4)' : '1px solid rgba(255,255,255,0.09)',
              color: saved ? '#FF004D' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {saved ? '❤️' : '🤍'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSimilar && onSimilar(song)}
            title="Find similar"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            🔁
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
