import { motion } from 'framer-motion';

export default function MoodCard({ mood, selected, onSelect }) {
  const isSelected = selected === mood.id;

  return (
    <motion.button
      onClick={() => onSelect(mood.id)}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.96 }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        padding: '20px 12px',
        borderRadius: 16,
        border: isSelected
          ? `1.5px solid ${mood.color}`
          : '1.5px solid rgba(255,255,255,0.07)',
        background: isSelected
          ? `${mood.color}18`
          : 'rgba(255,255,255,0.03)',
        cursor: 'pointer',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: isSelected
          ? `0 0 24px ${mood.color}40, 0 0 60px ${mood.color}15, inset 0 1px 0 ${mood.color}20`
          : '0 1px 0 rgba(255,255,255,0.04) inset',
        transition: 'background 0.2s, border-color 0.2s, box-shadow 0.3s',
        minHeight: 100,
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* Selection glow ring */}
      {isSelected && (
        <motion.div
          layoutId="mood-selection-ring"
          style={{
            position: 'absolute',
            inset: -1,
            borderRadius: 17,
            border: `1.5px solid ${mood.color}`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Emoji */}
      <span style={{ fontSize: 28, lineHeight: 1 }}>{mood.emoji}</span>

      {/* Label */}
      <span style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: isSelected ? mood.color : 'rgba(255,255,255,0.7)',
        transition: 'color 0.2s',
        textAlign: 'center',
        lineHeight: 1.2,
      }}>
        {mood.label}
      </span>

      {/* Selected indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: mood.color,
            boxShadow: `0 0 6px ${mood.color}`,
          }}
        />
      )}
    </motion.button>
  );
}
