// ─── WEEKND VIBES — RECOMMENDATION ENGINE ────────────────────────────────────
// Weighted scoring formula:
//   Mood Match         40%
//   Context Match      25%
//   Intensity Delta    15%
//   Darkness Delta     15%
//   Popularity Bonus    5%
//
// Relationship maps expand matches to semantically related moods/contexts
// so the engine degrades gracefully (partial credit vs. zero).

const MOOD_RELATIONSHIPS = {
  'lonely':      ['heartbroken', 'melancholic', 'reflective', 'dark'],
  'heartbroken': ['lonely', 'melancholic', 'reflective'],
  'toxic':       ['dark', 'confident', 'party'],
  'in-love':     ['confident', 'melancholic', 'reflective'],
  'confident':   ['motivated', 'party', 'dark'],
  'night-drive': ['melancholic', 'reflective', 'dark', 'lonely'],
  'party':       ['confident', 'toxic'],
  'reflective':  ['melancholic', 'lonely', 'dark'],
  'motivated':   ['confident', 'dark'],
  'melancholic': ['lonely', 'reflective', 'heartbroken', 'dark'],
  'dark':        ['toxic', 'lonely', 'reflective', 'melancholic'],
};

const CONTEXT_RELATIONSHIPS = {
  'late-night-drive': ['self-reflection', 'missing-someone'],
  'gym':              ['work', 'party'],
  'breakup':          ['missing-someone', 'situationship', 'self-reflection'],
  'situationship':    ['breakup', 'missing-someone', 'late-night-drive'],
  'missing-someone':  ['breakup', 'rainy-evening', 'situationship'],
  'party':            ['late-night-drive', 'gym'],
  'work':             ['self-reflection', 'gym'],
  'self-reflection':  ['late-night-drive', 'rainy-evening', 'missing-someone'],
  'vacation':         ['party', 'rainy-evening'],
  'rainy-evening':    ['self-reflection', 'missing-someone', 'late-night-drive'],
};

// Why this song was chosen — human-readable explanations
function buildMatchReasons(song, { mood, context, intensity, darkness }) {
  const reasons = [];

  if (song.moods.includes(mood)) {
    reasons.push(`Perfect ${mood.replace('-', ' ')} energy`);
  } else {
    const related = MOOD_RELATIONSHIPS[mood] || [];
    if (song.moods.some(m => related.includes(m))) {
      reasons.push(`Closely mirrors your current headspace`);
    }
  }

  if (song.contexts.includes(context)) {
    const ctx = context.replace(/-/g, ' ');
    reasons.push(`Made for ${ctx}`);
  } else {
    const related = CONTEXT_RELATIONSHIPS[context] || [];
    if (song.contexts.some(c => related.includes(c))) {
      reasons.push(`Fits your situation`);
    }
  }

  const intensityDiff = Math.abs(song.intensity - intensity);
  if (intensityDiff <= 1) {
    reasons.push(`Intensity level is spot-on`);
  } else if (intensityDiff <= 3) {
    reasons.push(`Close intensity match`);
  }

  const darknessDiff = Math.abs(song.darkness - darkness);
  if (darknessDiff <= 1) {
    reasons.push(`Darkness level aligns`);
  }

  if (song.popularity >= 90) {
    reasons.push(`Fan favourite`);
  } else if (song.popularity >= 80) {
    reasons.push(`Certified Weeknd classic`);
  } else if (song.popularity < 70) {
    reasons.push(`Hidden gem`);
  }

  if (reasons.length === 0) {
    reasons.push(`From The Weeknd's ${song.era} era — ${song.album}`);
  }

  return reasons.slice(0, 3);
}

function scoreTrack(song, userInput) {
  const { mood, context, intensity, darkness } = userInput;
  let score = 0;

  // ── Mood Match (40%) ───────────────────────────────────────────────────────
  if (song.moods.includes(mood)) {
    score += 40;
  } else {
    const related = MOOD_RELATIONSHIPS[mood] || [];
    const overlap = song.moods.filter(m => related.includes(m)).length;
    score += Math.min(overlap * 14, 22); // partial credit, capped at 22
  }

  // ── Context Match (25%) ───────────────────────────────────────────────────
  if (song.contexts.includes(context)) {
    score += 25;
  } else {
    const related = CONTEXT_RELATIONSHIPS[context] || [];
    const overlap = song.contexts.filter(c => related.includes(c)).length;
    score += Math.min(overlap * 10, 13); // partial credit, capped at 13
  }

  // ── Intensity Similarity (15%) ────────────────────────────────────────────
  // Uses exponential decay so nearby values score much higher
  const intensityDiff = Math.abs(song.intensity - intensity);
  score += 15 * Math.exp(-intensityDiff * 0.35);

  // ── Darkness Similarity (15%) ─────────────────────────────────────────────
  const darknessDiff = Math.abs(song.darkness - darkness);
  score += 15 * Math.exp(-darknessDiff * 0.35);

  // ── Popularity Bonus (5%) ────────────────────────────────────────────────
  score += (song.popularity / 100) * 5;

  return Math.min(100, Math.round(score));
}

/**
 * Returns top N recommended songs, each augmented with:
 *   - score        : 0–100 numeric match score
 *   - matchPercent : same, formatted
 *   - matchReasons : string[] explaining the recommendation
 */
export function getRecommendations(songs, userInput, topN = 10) {
  if (!userInput.mood || !userInput.context) return [];

  const scored = songs.map(song => {
    const score = scoreTrack(song, userInput);
    return {
      ...song,
      score,
      matchPercent: score,
      matchReasons: buildMatchReasons(song, userInput),
    };
  });

  // Sort descending; break ties by popularity
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.popularity - a.popularity;
  });

  return scored.slice(0, topN);
}
