// ─── WEEKND VIBES — FIREBASE CONFIG ──────────────────────────────────────────
//
// To enable Firebase:
// 1. Create a project at https://console.firebase.google.com
// 2. Enable Firestore + Authentication (Google provider)
// 3. Copy your firebaseConfig object from Project Settings
// 4. Replace the placeholder below with your actual config
// 5. Add your admin emails to Admin.jsx ADMIN_EMAILS array
//
// Collections used:
//   songs               — the full song database
//   admins              — whitelisted admin emails
//   playlists           — user-saved playlists
//   recommendation_logs — audit log of all recommendations
//   user_feedback       — thumbs up / down on songs

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// ── Replace with your Firebase config ─────────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY      || 'YOUR_API_KEY',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN  || 'YOUR_PROJECT.firebaseapp.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID   || 'YOUR_PROJECT_ID',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE      || 'YOUR_PROJECT.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID    || 'YOUR_SENDER_ID',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID       || 'YOUR_APP_ID',
};

const app        = initializeApp(firebaseConfig);
export const db  = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// ── YouTube Data API ───────────────────────────────────────────────────────
// Used by the admin enrichment panel.
export const YT_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY || '';

export async function searchYouTube(songTitle) {
  if (!YT_API_KEY) {
    console.warn('VITE_YOUTUBE_API_KEY not set. YouTube enrichment is disabled.');
    return null;
  }

  const q = encodeURIComponent(`The Weeknd ${songTitle} official`);
  const url = `https://www.googleapis.com/youtube/v3/search?q=${q}&type=video&key=${YT_API_KEY}&maxResults=1&part=snippet`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.items?.length) return null;

  const item = data.items[0];
  return {
    videoId:   item.id.videoId,
    title:     item.snippet.title,
    thumbnail: item.snippet.thumbnails.high.url,
    channelId: item.snippet.channelId,
  };
}

// ── Firestore helpers ──────────────────────────────────────────────────────
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, limit, serverTimestamp,
} from 'firebase/firestore';

export const songsRef   = () => collection(db, 'songs');
export const logsRef    = () => collection(db, 'recommendation_logs');
export const feedbackRef = () => collection(db, 'user_feedback');

export async function fetchSongsFromFirestore() {
  const snap = await getDocs(query(songsRef(), orderBy('popularity', 'desc')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function logRecommendation(userInput, topSongId) {
  try {
    await addDoc(logsRef(), {
      ...userInput,
      topSongId,
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    // Silently fail — logging is non-critical
  }
}
