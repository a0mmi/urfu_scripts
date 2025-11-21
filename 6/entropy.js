export function buildCounts(s) {
  const counts = new Map();
  for (const ch of s) {
    counts.set(ch, (counts.get(ch) || 0) + 1);
  }
  return counts;
}

export function fromString(s) {
  const counts = buildCounts(s);
  const L = Array.from(counts.values()).reduce((a, b) => a + b, 0);
  const alphabet = Array.from(counts.keys());
  const n = alphabet.length;

  const freqs = alphabet.map(ch => ({
    ch,
    count: counts.get(ch),
    p: L === 0 ? 0 : counts.get(ch) / L
  }));

  let H = 0;
  if (L === 0 || n === 0 || n === 1) {
    H = 0;
  } else {
    for (const f of freqs) {
      const p = f.p;
      if (p > 0) {
        H -= p * (Math.log(p) / Math.log(n));
      }
    }
  }

  return { L, n, freqs, H };
}
