import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SONGS as LOCAL_SONGS, MOODS, CONTEXTS } from '../data/songs';

// ─── AUTH GATE ────────────────────────────────────────────────────────────────
// Replace with your Firebase Auth + Firestore integration.
// The ADMIN_EMAILS set gates who can access this panel.
const ADMIN_EMAILS = [
  'aswinwrites@gmail.com',
  // add more admin emails here
];

const MOCK_ADMIN_EMAIL = 'aswinwrites@gmail.com';

// ─── SONG FORM DEFAULTS ───────────────────────────────────────────────────────
const EMPTY_SONG = {
  title: '',
  album: '',
  era: '',
  youtubeId: '',
  coverUrl: '',
  moods: [],
  contexts: [],
  intensity: 5,
  darkness: 5,
  energy: 5,
  popularity: 70,
  tags: '',
};

// ─── NAV ITEMS ────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'dashboard', label: 'Dashboard',    icon: '📊' },
  { id: 'songs',     label: 'Songs',        icon: '🎵' },
  { id: 'add',       label: 'Add Song',     icon: '➕' },
  { id: 'import',    label: 'Bulk Import',  icon: '📥' },
  { id: 'enrich',    label: 'YT Enrichment',icon: '▶️' },
];

export default function Admin() {
  const [authed, setAuthed] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [songs, setSongs] = useState(LOCAL_SONGS);
  const [form, setForm] = useState(EMPTY_SONG);
  const [editId, setEditId] = useState(null);
  const [searchQ, setSearchQ] = useState('');
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState(null);
  const [enrichQuery, setEnrichQuery] = useState('');
  const [enrichResult, setEnrichResult] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef(null);

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = (e) => {
    e.preventDefault();
    if (ADMIN_EMAILS.includes(loginEmail.trim().toLowerCase())) {
      setAuthed(true);
      setLoginError('');
    } else {
      setLoginError('Access denied. This email is not whitelisted.');
    }
  };

  // ── Song CRUD ─────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!form.title.trim()) { showToast('Song title is required.', 'error'); return; }

    const newSong = {
      ...form,
      id: editId || `s${Date.now()}`,
      tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags,
    };

    if (editId) {
      setSongs(prev => prev.map(s => s.id === editId ? newSong : s));
      showToast(`"${newSong.title}" updated.`);
    } else {
      setSongs(prev => [newSong, ...prev]);
      showToast(`"${newSong.title}" added to the database.`);
    }

    setForm(EMPTY_SONG);
    setEditId(null);
    setActiveNav('songs');
  };

  const handleEdit = (song) => {
    setForm({
      ...song,
      tags: Array.isArray(song.tags) ? song.tags.join(', ') : song.tags,
    });
    setEditId(song.id);
    setActiveNav('add');
  };

  const handleDelete = (id) => {
    setSongs(prev => prev.filter(s => s.id !== id));
    setDeleteConfirm(null);
    showToast('Song deleted.', 'error');
  };

  const toggleMood = (id) => {
    setForm(f => ({
      ...f,
      moods: f.moods.includes(id) ? f.moods.filter(m => m !== id) : [...f.moods, id],
    }));
  };

  const toggleContext = (id) => {
    setForm(f => ({
      ...f,
      contexts: f.contexts.includes(id) ? f.contexts.filter(c => c !== id) : [...f.contexts, id],
    }));
  };

  // ── Bulk Import ───────────────────────────────────────────────────────────
  const handleImport = () => {
    try {
      let parsed;
      const text = importText.trim();

      if (text.startsWith('[') || text.startsWith('{')) {
        // JSON
        parsed = JSON.parse(text.startsWith('[') ? text : `[${text}]`);
      } else {
        // CSV: expect header row: title,album,era,youtubeId,moods,intensity,darkness,popularity
        const lines = text.split('\n').filter(Boolean);
        const headers = lines[0].split(',').map(h => h.trim());
        parsed = lines.slice(1).map(line => {
          const vals = line.split(',');
          const obj = {};
          headers.forEach((h, i) => { obj[h] = vals[i]?.trim() || ''; });
          if (typeof obj.moods === 'string') obj.moods = obj.moods.split('|').filter(Boolean);
          if (typeof obj.contexts === 'string') obj.contexts = obj.contexts.split('|').filter(Boolean);
          if (typeof obj.tags === 'string') obj.tags = obj.tags.split('|').filter(Boolean);
          obj.intensity = Number(obj.intensity) || 5;
          obj.darkness = Number(obj.darkness) || 5;
          obj.energy = Number(obj.energy) || 5;
          obj.popularity = Number(obj.popularity) || 70;
          obj.id = `import_${Date.now()}_${Math.random().toString(36).slice(2)}`;
          return obj;
        });
      }

      setSongs(prev => [...parsed, ...prev]);
      setImportResult({ count: parsed.length, error: null });
      showToast(`${parsed.length} songs imported.`);
    } catch (err) {
      setImportResult({ count: 0, error: err.message });
    }
  };

  // ── YouTube Enrichment (mock — wire up YouTube Data API) ──────────────────
  const handleEnrich = () => {
    if (!enrichQuery.trim()) return;
    // In production: call YouTube Data API v3 search.list endpoint
    // GET https://www.googleapis.com/youtube/v3/search?q=The+Weeknd+{query}&type=video&key={YT_API_KEY}
    setEnrichResult({
      mock: true,
      query: enrichQuery,
      note: 'Connect YouTube Data API v3 in firebase.js to enable auto-enrichment. Set VITE_YOUTUBE_API_KEY in .env',
    });
  };

  const filteredSongs = songs.filter(s =>
    !searchQ || s.title.toLowerCase().includes(searchQ.toLowerCase()) ||
    s.album.toLowerCase().includes(searchQ.toLowerCase())
  );

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    total: songs.length,
    byAlbum: songs.reduce((acc, s) => {
      acc[s.album] = (acc[s.album] || 0) + 1;
      return acc;
    }, {}),
    avgPopularity: Math.round(songs.reduce((a, s) => a + (s.popularity || 0), 0) / songs.length),
    darkSongs: songs.filter(s => s.darkness >= 8).length,
  };

  // ─── LOGIN SCREEN ─────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#050505',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
      }}>
        <div className="ambient-bg">
          <div className="ambient-orb ambient-orb-2" style={{ opacity: 0.08 }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            width: '100%',
            maxWidth: 420,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: '36px 32px',
            backdropFilter: 'blur(20px)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 28,
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF004D, #7B2CBF)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
            }}>🌙</div>
            <div>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, color: 'white', fontSize: '1rem' }}>
                Admin Panel
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
                Weeknd Vibes
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="admin-label">Email Address</label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="admin@example.com"
                className="admin-input"
                required
                autoFocus
              />
            </div>

            {loginError && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(255,0,77,0.08)',
                border: '1px solid rgba(255,0,77,0.2)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.8rem',
                color: '#FF004D',
              }}>
                {loginError}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: 4 }}>
              Access Admin →
            </button>
          </form>

          <p style={{
            marginTop: 16,
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.2)',
            textAlign: 'center',
          }}>
            Connect Firebase Auth for Google sign-in
          </p>
        </motion.div>
      </div>
    );
  }

  // ─── ADMIN PANEL ──────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#050505', display: 'flex' }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: 'fixed',
              top: 20,
              right: 20,
              zIndex: 9999,
              background: toast.type === 'error' ? 'rgba(255,0,77,0.12)' : 'rgba(0,245,212,0.1)',
              border: `1px solid ${toast.type === 'error' ? 'rgba(255,0,77,0.3)' : 'rgba(0,245,212,0.25)'}`,
              borderRadius: 12,
              padding: '12px 18px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.875rem',
              color: toast.type === 'error' ? '#FF004D' : '#00F5D4',
              backdropFilter: 'blur(12px)',
            }}
          >
            {toast.type === 'error' ? '❌' : '✅'} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div style={{
        width: 220,
        flexShrink: 0,
        background: '#080808',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px',
        minHeight: '100vh',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px 20px' }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FF004D, #7B2CBF)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
          }}>🌙</div>
          <span style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'white',
          }}>Admin</span>
        </div>

        {/* Nav items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`admin-nav-item ${activeNav === item.id ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* User */}
        <div style={{
          padding: '12px 8px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          marginTop: 12,
        }}>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.75rem',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: 4,
          }}>
            Logged in as
          </div>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.8125rem',
            color: 'rgba(255,255,255,0.6)',
            wordBreak: 'break-all',
          }}>
            {MOCK_ADMIN_EMAIL}
          </div>
          <button
            onClick={() => setAuthed(false)}
            style={{
              marginTop: 8,
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.75rem',
              color: 'rgba(255,0,77,0.7)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Sign out →
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>

        {/* ── DASHBOARD ──────────────────────────────────────────────────── */}
        {activeNav === 'dashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'white',
              marginBottom: 24,
            }}>Dashboard</h1>

            {/* Stat cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 16,
              marginBottom: 32,
            }}>
              {[
                { label: 'Total Songs', value: stats.total, icon: '🎵', color: '#FF004D' },
                { label: 'Avg Popularity', value: `${stats.avgPopularity}/100`, icon: '📈', color: '#00F5D4' },
                { label: 'Dark Songs (≥8)', value: stats.darkSongs, icon: '🖤', color: '#9D4EDD' },
                { label: 'Albums', value: Object.keys(stats.byAlbum).length, icon: '💿', color: '#FF9F1C' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 14,
                  padding: '20px',
                }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    color: stat.color,
                    lineHeight: 1,
                    marginBottom: 4,
                  }}>{stat.value}</div>
                  <div style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.4)',
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Album breakdown */}
            <div style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14,
              padding: '20px 24px',
            }}>
              <h3 style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: 'white',
                marginBottom: 16,
              }}>Songs by Album</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(stats.byAlbum).sort((a, b) => b[1] - a[1]).map(([album, count]) => (
                  <div key={album} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.8125rem',
                      color: 'rgba(255,255,255,0.5)',
                      width: 200,
                      flexShrink: 0,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>{album}</div>
                    <div style={{
                      flex: 1,
                      height: 6,
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: 99,
                      overflow: 'hidden',
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / stats.total) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #FF004D, #7B2CBF)',
                          borderRadius: 99,
                        }}
                      />
                    </div>
                    <div style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.4)',
                      width: 24,
                      textAlign: 'right',
                    }}>{count}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── SONGS LIST ─────────────────────────────────────────────────── */}
        {activeNav === 'songs' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>
                Songs ({songs.length})
              </h1>
              <button
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '0.875rem' }}
                onClick={() => { setForm(EMPTY_SONG); setEditId(null); setActiveNav('add'); }}
              >
                + Add Song
              </button>
            </div>

            <input
              type="search"
              placeholder="Search by title or album…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              className="admin-input"
              style={{ marginBottom: 16 }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {filteredSongs.map(song => (
                <div key={song.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12,
                }}>
                  {/* Cover thumbnail */}
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    background: '#111',
                    flexShrink: 0,
                    overflow: 'hidden',
                  }}>
                    {song.coverUrl && (
                      <img src={song.coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: 'white',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {song.title}
                    </div>
                    <div style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.35)',
                    }}>
                      {song.album} · {song.era} · I:{song.intensity} D:{song.darkness}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => handleEdit(song)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 6,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.6)',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      Edit
                    </button>
                    {deleteConfirm === song.id ? (
                      <>
                        <button
                          onClick={() => handleDelete(song.id)}
                          style={{
                            padding: '5px 12px',
                            borderRadius: 6,
                            background: 'rgba(255,0,77,0.15)',
                            border: '1px solid rgba(255,0,77,0.3)',
                            color: '#FF004D',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          style={{
                            padding: '5px 10px',
                            borderRadius: 6,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            color: 'rgba(255,255,255,0.4)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(song.id)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: 6,
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.06)',
                          color: 'rgba(255,255,255,0.2)',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                        }}
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── ADD / EDIT SONG ────────────────────────────────────────────── */}
        {activeNav === 'add' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 640 }}>
            <h1 style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'white',
              marginBottom: 24,
            }}>
              {editId ? 'Edit Song' : 'Add Song'}
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Basic fields */}
              {[
                { key: 'title',     label: 'Song Title *', placeholder: 'Blinding Lights' },
                { key: 'album',     label: 'Album',        placeholder: 'After Hours' },
                { key: 'era',       label: 'Year / Era',   placeholder: '2020' },
                { key: 'youtubeId', label: 'YouTube Video ID', placeholder: '4NRXx6U8ABQ' },
                { key: 'coverUrl',  label: 'Cover Image URL', placeholder: 'https://...' },
              ].map(field => (
                <div key={field.key}>
                  <label className="admin-label">{field.label}</label>
                  <input
                    type="text"
                    className="admin-input"
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  />
                </div>
              ))}

              {/* Numeric fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { key: 'intensity',  label: 'Intensity' },
                  { key: 'darkness',   label: 'Darkness' },
                  { key: 'energy',     label: 'Energy' },
                  { key: 'popularity', label: 'Popularity', max: 100 },
                ].map(f => (
                  <div key={f.key}>
                    <label className="admin-label">{f.label} (1–{f.max || 10})</label>
                    <input
                      type="number"
                      min={1}
                      max={f.max || 10}
                      className="admin-input"
                      value={form[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: Number(e.target.value) }))}
                    />
                  </div>
                ))}
              </div>

              {/* Moods */}
              <div>
                <label className="admin-label">Moods</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {MOODS.map(m => (
                    <button
                      key={m.id}
                      onClick={() => toggleMood(m.id)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 99,
                        background: form.moods.includes(m.id) ? `${m.color}22` : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${form.moods.includes(m.id) ? m.color + '66' : 'rgba(255,255,255,0.1)'}`,
                        color: form.moods.includes(m.id) ? m.color : 'rgba(255,255,255,0.4)',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {m.emoji} {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contexts */}
              <div>
                <label className="admin-label">Contexts</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {CONTEXTS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => toggleContext(c.id)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: 99,
                        background: form.contexts.includes(c.id) ? 'rgba(255,0,77,0.12)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${form.contexts.includes(c.id) ? 'rgba(255,0,77,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        color: form.contexts.includes(c.id) ? '#FF2E63' : 'rgba(255,255,255,0.4)',
                        fontFamily: 'Inter, sans-serif',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {c.emoji} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="admin-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="synthwave, iconic, night-drive, dark"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                />
              </div>

              {/* Save / Cancel */}
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSave}>
                  {editId ? '💾 Update Song' : '➕ Add Song'}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => { setForm(EMPTY_SONG); setEditId(null); setActiveNav('songs'); }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── BULK IMPORT ────────────────────────────────────────────────── */}
        {activeNav === 'import' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 640 }}>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: 8 }}>
              Bulk Import
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>
              Paste a JSON array or CSV (with header row) to import multiple songs at once.
            </p>

            <div style={{ marginBottom: 12 }}>
              <label className="admin-label">JSON or CSV Payload</label>
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder={`JSON example:\n[\n  {\n    "title": "Blinding Lights",\n    "album": "After Hours",\n    "era": "2020",\n    "youtubeId": "4NRXx6U8ABQ",\n    "moods": ["confident","motivated"],\n    "contexts": ["late-night-drive","party"],\n    "intensity": 8, "darkness": 4, "energy": 9, "popularity": 100,\n    "tags": ["synthwave","iconic"]\n  }\n]\n\nCSV example:\ntitle,album,era,youtubeId,moods,contexts,intensity,darkness,energy,popularity,tags\nBlinding Lights,After Hours,2020,4NRXx6U8ABQ,confident|motivated,late-night-drive|party,8,4,9,100,synthwave|iconic`}
                style={{
                  width: '100%',
                  height: 280,
                  resize: 'vertical',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  lineHeight: 1.5,
                  background: '#0A0A0A',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  padding: '14px',
                  color: 'rgba(255,255,255,0.7)',
                  outline: 'none',
                }}
              />
            </div>

            <button className="btn btn-primary" onClick={handleImport} style={{ width: '100%', padding: '13px' }}>
              📥 Import Songs
            </button>

            {importResult && (
              <div style={{
                marginTop: 14,
                padding: '14px',
                borderRadius: 10,
                background: importResult.error ? 'rgba(255,0,77,0.08)' : 'rgba(0,245,212,0.08)',
                border: `1px solid ${importResult.error ? 'rgba(255,0,77,0.2)' : 'rgba(0,245,212,0.2)'}`,
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                color: importResult.error ? '#FF004D' : '#00F5D4',
              }}>
                {importResult.error ? `❌ Error: ${importResult.error}` : `✅ ${importResult.count} songs imported successfully.`}
              </div>
            )}
          </motion.div>
        )}

        {/* ── YOUTUBE ENRICHMENT ─────────────────────────────────────────── */}
        {activeNav === 'enrich' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 640 }}>
            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: 8 }}>
              YouTube Enrichment
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>
              Auto-fetch YouTube video ID, thumbnail, view count, and duration for any Weeknd track.
            </p>

            {/* API key notice */}
            <div style={{
              padding: '14px 16px',
              borderRadius: 12,
              background: 'rgba(157,78,221,0.08)',
              border: '1px solid rgba(157,78,221,0.2)',
              marginBottom: 20,
            }}>
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: '#9D4EDD',
                marginBottom: 6,
              }}>
                Setup Required
              </div>
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, margin: 0 }}>
                Add <code style={{ color: '#00F5D4' }}>VITE_YOUTUBE_API_KEY=your_key</code> to your <code style={{ color: '#00F5D4' }}>.env</code> file.<br/>
                Get a key from <strong>Google Cloud Console → YouTube Data API v3</strong>.<br/>
                The enrichment button below will then auto-call the search API.
              </p>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="admin-label">Song Name</label>
              <input
                type="text"
                value={enrichQuery}
                onChange={e => setEnrichQuery(e.target.value)}
                placeholder="e.g. Blinding Lights"
                className="admin-input"
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleEnrich}
              style={{ width: '100%', padding: '13px' }}
            >
              ▶️ Enrich via YouTube API
            </button>

            {enrichResult && (
              <div style={{
                marginTop: 14,
                padding: '16px',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.5)',
              }}>
                <div style={{ color: '#9D4EDD', fontWeight: 600, marginBottom: 6 }}>ℹ️ Integration Note</div>
                <p>{enrichResult.note}</p>
                <code style={{
                  display: 'block',
                  marginTop: 10,
                  padding: '10px',
                  background: '#0A0A0A',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  color: '#00F5D4',
                  lineHeight: 1.6,
                }}>
                  {`GET https://www.googleapis.com/youtube/v3/search\n?q=The+Weeknd+${encodeURIComponent(enrichResult.query)}\n&type=video\n&key=VITE_YOUTUBE_API_KEY\n&maxResults=1`}
                </code>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
