import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PlaylistRow from '../components/PlaylistRow';
import VideoPlayer from '../components/VideoPlayer';
import { SONGS, MOODS, CONTEXTS } from '../data/songs';
import { getRecommendations } from '../engine/recommendation';

function getThumb(youtubeId) {
  return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null;
}

export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const userInput = location.state;

  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingSong, setPlayingSong] = useState(null);
  const [heroThumbError, setHeroThumbError] = useState(false);

  useEffect(() => {
    if (!userInput) { navigate('/'); return; }
    const timer = setTimeout(() => {
      // Pick 8 songs so the playlist feels like a real queue
      const results = getRecommendations(SONGS, userInput, 8);
      setPlaylist(results);
      setLoading(false);
    }, 1600);
    return () => clearTimeout(timer);
  }, [userInput, navigate]);

  if (!userInput) return null;

  const selectedMood = MOODS.find(m => m.id === userInput.mood);
  const selectedContext = CONTEXTS.find(c => c.id === userInput.context);
  const hero = playlist[0];
  const heroThumb = hero ? getThumb(hero.youtubeId) : null;

  const handleHeroThumbError = () => {
    if (heroThumb && heroThumb.includes('maxresdefault') && hero?.youtubeId) {
      setHeroThumbError('hq');
    } else {
      setHeroThumbError('none');
    }
  };

  const resolvedHeroThumb =
    heroThumbError === 'none' ? null
    : heroThumbError === 'hq' ? `https://img.youtube.com/vi/${hero?.youtubeId}/hqdefault.jpg`
    : heroThumb;

  return (
    <div className="page" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Ambient background — tinted with hero thumb */}
      <div className="ambient-bg">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
      </div>

      {/* Loading screen */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.45 }}
            style={{
              position: 'fixed', inset: 0,
              background: '#050505',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              zIndex: 100, gap: 24,
            }}
          >
            {/* Spinning vinyl */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              style={{
                width: 88, height: 88, borderRadius: '50%',
                background: 'conic-gradient(from 0deg, #FF004D 0deg, #7B2CBF 120deg, #050505 240deg, #FF004D 360deg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 50px rgba(255,0,77,0.35)',
              }}
            >
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#050505' }} />
            </motion.div>

            <div style={{ textAlign: 'center' }}>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: 6,
                }}
              >
                Building your XO playlist…
              </motion.div>
              <div style={{
                fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.3)',
              }}>
                {selectedMood?.emoji} {selectedMood?.label} · {selectedContext?.emoji} {selectedContext?.label}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {[0,1,2].map(i => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.2,1,0.2], scale: [0.8,1.2,0.8] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF004D' }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {!loading && (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 0 80px', position: 'relative', zIndex: 1 }}>

          {/* Hero banner */}
          {hero && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{ position: 'relative', height: 280, overflow: 'hidden' }}
            >
              {/* Background image */}
              {resolvedHeroThumb ? (
                <img
                  src={resolvedHeroThumb}
                  alt={hero.title}
                  onError={handleHeroThumbError}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  background: 'linear-gradient(135deg, #1a0520 0%, #0a0a1a 50%, #200a05 100%)',
                }} />
              )}

              {/* Gradient overlays */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, #050505 0%, rgba(5,5,5,0.7) 50%, rgba(5,5,5,0.2) 100%)',
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to right, rgba(5,5,5,0.8) 0%, transparent 60%)',
              }} />

              {/* XO nav bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.75rem',
                    fontWeight: 800, letterSpacing: '0.2em', color: '#FF004D',
                  }}>XO</span>
                  <span style={{
                    fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.875rem',
                    fontWeight: 700, color: 'white',
                  }}>Weeknd Vibes</span>
                </div>
                <button
                  onClick={() => navigate('/')}
                  style={{
                    background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 99, padding: '6px 14px', color: 'rgba(255,255,255,0.7)',
                    fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.8rem', fontWeight: 600,
                    cursor: 'pointer', backdropFilter: 'blur(12px)',
                  }}
                >↺ Redo</button>
              </div>

              {/* Hero song info */}
              <div style={{ position: 'absolute', bottom: 24, left: 20, right: 20 }}>
                {/* Vibe chips */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                  {selectedMood && (
                    <span style={{
                      background: `${selectedMood.color}20`, border: `1px solid ${selectedMood.color}50`,
                      borderRadius: 99, padding: '3px 10px',
                      fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600,
                      color: selectedMood.color,
                    }}>
                      {selectedMood.emoji} {selectedMood.label}
                    </span>
                  )}
                  {selectedContext && (
                    <span style={{
                      background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 99, padding: '3px 10px',
                      fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600,
                      color: 'rgba(255,255,255,0.6)',
                    }}>
                      {selectedContext.emoji} {selectedContext.label}
                    </span>
                  )}
                  <span style={{
                    background: 'rgba(255,0,77,0.1)', border: '1px solid rgba(255,0,77,0.25)',
                    borderRadius: 99, padding: '3px 10px',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 600,
                    color: '#FF004D',
                  }}>
                    ⚡ {userInput.intensity}/10
                  </span>
                </div>

                <div style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.72rem',
                  color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
                  letterSpacing: '0.1em', marginBottom: 4,
                }}>
                  🎯 Top Pick
                </div>
                <h1 style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: 'clamp(1.4rem, 4vw, 2rem)',
                  fontWeight: 800, color: 'white',
                  letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 4,
                }}>
                  {hero.title}
                </h1>
                <div style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.45)',
                }}>
                  {hero.album} · {hero.era} · {hero.matchPercent}% match
                </div>
              </div>
            </motion.div>
          )}

          {/* Play hero button */}
          {hero && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ padding: '16px 20px 8px', display: 'flex', gap: 10 }}
            >
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 0 32px rgba(255,0,77,0.45)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setPlayingSong(hero)}
                style={{
                  flex: 1, padding: '13px 20px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #FF004D, #FF2E63)',
                  border: 'none', color: 'white',
                  fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.9rem', fontWeight: 700,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 0 20px rgba(255,0,77,0.25)',
                }}
              >
                ▶ Play Top Pick
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const newInput = {
                    mood: hero.moods[0] || userInput.mood,
                    context: hero.contexts[0] || userInput.context,
                    intensity: hero.intensity,
                    darkness: hero.darkness,
                  };
                  setLoading(true);
                  setTimeout(() => {
                    setPlaylist(getRecommendations(SONGS, newInput, 8));
                    setLoading(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 800);
                }}
                style={{
                  padding: '13px 14px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.85rem', fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Find similar"
              >🔁</motion.button>
            </motion.div>
          )}

          {/* Playlist */}
          <div style={{ padding: '8px 12px 0' }}>
            {/* Playlist header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 14px 8px',
            }}>
              <div>
                <div style={{
                  fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.95rem',
                  fontWeight: 700, color: 'white',
                }}>Your XO Playlist</div>
                <div style={{
                  fontFamily: 'Inter, sans-serif', fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.3)', marginTop: 2,
                }}>
                  {playlist.length} songs · sorted by vibe match
                </div>
              </div>
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif', fontSize: '0.7rem',
                fontWeight: 700, letterSpacing: '0.15em',
                color: 'rgba(255,0,77,0.6)', textTransform: 'uppercase',
              }}>XO</div>
            </div>

            {/* Divider */}
            <div style={{
              height: 1, background: 'rgba(255,255,255,0.06)',
              margin: '0 14px 8px',
            }} />

            {/* Track list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {playlist.map((song, i) => (
                <PlaylistRow
                  key={song.id}
                  song={song}
                  rank={i + 1}
                  isPlaying={playingSong?.id === song.id}
                  onPlay={setPlayingSong}
                  delay={0.05 + i * 0.06}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{
              margin: '40px 20px 0',
              padding: '28px 20px',
              borderRadius: 16,
              background: 'rgba(255,0,77,0.04)',
              border: '1px solid rgba(255,0,77,0.1)',
              textAlign: 'center',
            }}
          >
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.2em',
              color: '#FF004D', marginBottom: 8, textTransform: 'uppercase',
            }}>XO · XOTWOD</div>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: 6,
            }}>Feeling something different?</div>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.35)', marginBottom: 18,
            }}>Run the algorithm again with a new vibe.</p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
              style={{ padding: '11px 26px' }}
            >✦ Start Over</button>
          </motion.div>
        </div>
      )}

      {/* Video / audio player */}
      {playingSong && (
        <VideoPlayer
          youtubeId={playingSong.youtubeId}
          title={playingSong.title}
          onClose={() => setPlayingSong(null)}
        />
      )}
    </div>
  );
}
