import { motion } from 'framer-motion';

// Hand-picked official music videos — all verified to have real thumbnails
const COVERS = [
  { youtubeId: 'ygTZZpVkmKg', label: 'Blinding Lights' },
  { youtubeId: '34Na4j8AVgA', label: 'Starboy' },
  { youtubeId: 'yzTuBuRdAyA', label: 'The Hills' },
  { youtubeId: 'XXYlFuWEuKI', label: 'Save Your Tears' },
  { youtubeId: 'KEI4qSrkPAs', label: "Can't Feel My Face" },
  { youtubeId: 'v5PZw1Wr-l0', label: 'After Hours' },
  { youtubeId: 'Cvemnd3p_00', label: 'Sacrifice' },
  { youtubeId: 'uPD0QOGTmMI', label: 'Die For You' },
];

// Duplicate for seamless infinite loop
const ITEMS = [...COVERS, ...COVERS];

export default function AlbumCarousel() {
  return (
    <div style={{
      width: '100%',
      overflow: 'hidden',
      maskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 15%, black 85%, transparent 100%)',
    }}>
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'flex', gap: 14, width: 'max-content', padding: '4px 0' }}
      >
        {ITEMS.map((item, i) => (
          <div
            key={i}
            style={{
              width: 180,
              height: 102,
              borderRadius: 12,
              overflow: 'hidden',
              flexShrink: 0,
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}
          >
            <img
              src={`https://img.youtube.com/vi/${item.youtubeId}/maxresdefault.jpg`}
              alt={item.label}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                filter: 'brightness(0.8) saturate(1.15)',
              }}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
