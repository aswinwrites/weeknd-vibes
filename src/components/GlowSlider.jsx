import { useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function GlowSlider({
  value,
  onChange,
  min = 1,
  max = 10,
  leftLabel,
  rightLabel,
  color = '#FF004D',
  glowColor,
}) {
  const glow = glowColor || `${color}55`;
  const pct = ((value - min) / (max - min)) * 100;
  const trackRef = useRef(null);

  const trackStyle = {
    background: `linear-gradient(to right, ${color} ${pct}%, rgba(255,255,255,0.08) ${pct}%)`,
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Track */}
      <div style={{ position: 'relative', padding: '12px 0' }}>
        <input
          ref={trackRef}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="glow-slider"
          style={{
            ...trackStyle,
            '--thumb-color': color,
            '--thumb-glow': glow,
          }}
        />
      </div>

      {/* Labels + value */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
      }}>
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.35)',
          fontWeight: 500,
        }}>
          {leftLabel}
        </span>

        {/* Live value badge */}
        <motion.div
          key={value}
          initial={{ scale: 0.8, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            background: `${color}22`,
            border: `1px solid ${color}55`,
            borderRadius: 99,
            padding: '2px 12px',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: color,
            boxShadow: `0 0 10px ${glow}`,
          }}
        >
          {value}
        </motion.div>

        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.75rem',
          color: 'rgba(255,255,255,0.35)',
          fontWeight: 500,
        }}>
          {rightLabel}
        </span>
      </div>
    </div>
  );
}
