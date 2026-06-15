import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MoodCard from '../components/MoodCard';
import ContextCard from '../components/ContextCard';
import GlowSlider from '../components/GlowSlider';
import AlbumCarousel from '../components/AlbumCarousel';
import { MOODS, CONTEXTS } from '../data/songs';

const TOTAL_STEPS = 3;

const pageVariants = {
  enter: dir => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: dir => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const pageTransition = { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] };

export default function Home() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [mood, setMood] = useState(null);
  const [context, setContext] = useState(null);
  const [intensity, setIntensity] = useState(5);

  const canProceed =
    (step === 1 && mood) ||
    (step === 2 && context) ||
    step === 3;

  const goTo = (nextStep) => {
    setDir(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      goTo(step + 1);
    } else {
      navigate('/results', { state: { mood, context, intensity, darkness: 5 } });
    }
  };

  const handleBack = () => {
    if (step > 1) goTo(step - 1);
  };

  return (
    <div className="page" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Ambient background */}
      <div className="ambient-bg">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>

      {/* Main content */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* XO Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            textAlign: 'center',
            paddingTop: 36,
            paddingBottom: 20,
            position: 'relative',
          }}
        >
          {/* XO wordmark */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 6,
          }}>
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.25em',
              color: '#FF004D',
              textTransform: 'uppercase',
            }}>XO</span>
            <div style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.15)' }} />
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '1rem',
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-0.01em',
            }}>Weeknd Vibes</span>
          </div>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.04em',
          }}>
            Find your next song · {'★'} xotwod {'★'}
          </div>
        </motion.div>

        {/* Album carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{ marginBottom: 32 }}
        >
          <AlbumCarousel />
        </motion.div>

        {/* Step flow */}
        <div style={{
          maxWidth: 680,
          margin: '0 auto',
          padding: '0 20px 120px',
        }}>
          {/* Step indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginBottom: 28,
          }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i + 1 === step ? 28 : 8,
                  background: i + 1 < step
                    ? 'rgba(255,0,77,0.5)'
                    : i + 1 === step
                    ? '#FF004D'
                    : 'rgba(255,255,255,0.15)',
                }}
                transition={{ duration: 0.3 }}
                style={{
                  height: 6,
                  borderRadius: 99,
                  boxShadow: i + 1 === step ? '0 0 8px rgba(255,0,77,0.5)' : 'none',
                }}
              />
            ))}
          </div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`heading-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              style={{ textAlign: 'center', marginBottom: 28 }}
            >
              <h1 style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 'clamp(1.5rem, 4.5vw, 2.2rem)',
                fontWeight: 800,
                color: 'white',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                marginBottom: 8,
              }}>
                {step === 1 && 'How are you feeling right now?'}
                {step === 2 && "What's the situation?"}
                {step === 3 && 'Turn it up or keep it chill?'}
              </h1>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.38)',
                lineHeight: 1.5,
              }}>
                {step === 1 && 'Pick the vibe closest to your current headspace.'}
                {step === 2 && "We'll match the song to your moment."}
                {step === 3 && 'Set the energy level for tonight.'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Step content */}
          <AnimatePresence custom={dir} mode="wait">
            <motion.div
              key={step}
              custom={dir}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={pageTransition}
            >
              {/* Step 1 — Mood */}
              {step === 1 && (
                <div className="mood-grid">
                  {MOODS.map(m => (
                    <MoodCard key={m.id} mood={m} selected={mood} onSelect={setMood} />
                  ))}
                </div>
              )}

              {/* Step 2 — Context */}
              {step === 2 && (
                <div className="context-grid">
                  {CONTEXTS.map(c => (
                    <ContextCard key={c.id} context={c} selected={context} onSelect={setContext} />
                  ))}
                </div>
              )}

              {/* Step 3 — Intensity */}
              {step === 3 && (
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 20,
                  padding: '32px 24px',
                  backdropFilter: 'blur(12px)',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 32,
                  }}>
                    <div>
                      <div style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'white',
                        marginBottom: 4,
                      }}>Intensity Level</div>
                      <div style={{
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.85rem',
                        color: 'rgba(255,255,255,0.4)',
                      }}>Energy of the song</div>
                    </div>
                    <motion.div
                      key={intensity}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: '3rem',
                        fontWeight: 800,
                        color: '#FF004D',
                        lineHeight: 1,
                        textShadow: '0 0 24px rgba(255,0,77,0.5)',
                      }}
                    >
                      {intensity}
                    </motion.div>
                  </div>

                  <GlowSlider
                    value={intensity}
                    onChange={setIntensity}
                    leftLabel="🧘 Chill"
                    rightLabel="💥 Chaos"
                    color="#FF004D"
                  />

                  <div style={{
                    marginTop: 24,
                    padding: '14px',
                    borderRadius: 12,
                    background: 'rgba(255,0,77,0.06)',
                    border: '1px solid rgba(255,0,77,0.12)',
                  }}>
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.875rem',
                      color: 'rgba(255,255,255,0.6)',
                      lineHeight: 1.5,
                      margin: 0,
                    }}>
                      {intensity <= 2 && '🌙 Something quiet and ambient — no rush, no chaos.'}
                      {intensity >= 3 && intensity <= 4 && '😌 Smooth and laid-back. Nighttime cruise energy.'}
                      {intensity === 5 && '🎵 Right in the middle. Balanced, cinematic.'}
                      {intensity >= 6 && intensity <= 7 && '🔥 Building tension. Gets you deep in your feelings.'}
                      {intensity >= 8 && intensity <= 9 && '⚡ High-energy. You can feel it in your chest.'}
                      {intensity === 10 && '💥 Maximum chaos. False Alarm territory.'}
                    </p>
                  </div>

                  {/* Vibe summary */}
                  {mood && context && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      style={{
                        marginTop: 16,
                        padding: '12px 14px',
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <span style={{ fontSize: '1.25rem' }}>
                        {MOODS.find(m => m.id === mood)?.emoji}
                      </span>
                      <div>
                        <div style={{
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '0.7rem',
                          color: 'rgba(255,255,255,0.3)',
                          marginBottom: 2,
                        }}>Your vibe</div>
                        <div style={{
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: 'rgba(255,255,255,0.7)',
                        }}>
                          {MOODS.find(m => m.id === mood)?.label} · {CONTEXTS.find(c => c.id === context)?.label} · {intensity}/10 energy
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Desktop nav */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="hide-mobile"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 28,
              gap: 12,
            }}
          >
            {step > 1 ? (
              <button onClick={handleBack} className="btn btn-secondary">← Back</button>
            ) : (
              <div />
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className="btn btn-primary btn-lg"
              style={{ opacity: canProceed ? 1 : 0.4, cursor: canProceed ? 'pointer' : 'not-allowed' }}
            >
              {step === TOTAL_STEPS ? '✦ Build My Playlist' : 'Continue →'}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="mobile-cta">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {step > 1 && (
            <button
              onClick={handleBack}
              className="btn btn-secondary"
              style={{ flexShrink: 0, padding: '14px 16px' }}
            >←</button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="btn btn-primary"
            style={{
              flex: 1,
              padding: '16px',
              opacity: canProceed ? 1 : 0.4,
              cursor: canProceed ? 'pointer' : 'not-allowed',
              fontSize: '1rem',
            }}
          >
            {step === TOTAL_STEPS ? '✦ Build My Playlist' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}
