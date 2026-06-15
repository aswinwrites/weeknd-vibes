import { motion } from 'framer-motion';

export default function ContextCard({ context, selected, onSelect }) {
  const isSelected = selected === context.id;

  return (
    <motion.button
      onClick={() => onSelect(context.id)}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 6,
        padding: '16px',
        borderRadius: 14,
        border: isSelected
          ? '1.5px solid rgba(255, 0, 77, 0.6)'
          : '1.5px solid rgba(255,255,255,0.07)',
        background: isSelected
          ? 'rgba(255, 0, 77, 0.1)'
          : 'rgba(255,255,255,0.03)',
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: isSelected
          ? '0 0 24px rgba(255,0,77,0.25), inset 0 1px 0 rgba(255,0,77,0.12)'
          : 'inset 0 1px 0 rgba(255,255,255,0.04)',
        transition: 'background 0.2s, border-color 0.2s, box-shadow 0.3s',
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        textAlign: 'left',
        minHeight: 80,
      }}
    >
      {/* Emoji + label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>{context.emoji}</span>
        <span style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '0.875rem',
          fontWeight: 600,
          color: isSelected ? '#FF2E63' : 'rgba(255,255,255,0.85)',
          transition: 'color 0.2s',
        }}>
          {context.label}
        </span>
      </div>

      {/* Description */}
      <span style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.4)',
        lineHeight: 1.4,
      }}>
        {context.desc}
      </span>

      {/* Selection dot */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#FF004D',
            boxShadow: '0 0 6px rgba(255,0,77,0.8)',
          }}
        />
      )}
    </motion.button>
  );
}
