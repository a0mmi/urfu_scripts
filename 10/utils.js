export function isLower(ch) { return ch >= 'a' && ch <= 'z'; }
export function isUpper(ch) { return ch >= 'A' && ch <= 'Z'; }

export function computeLetterFreqs(text, alphabet = "abcdefghijklmnopqrstuvwxyz") {
  const counts = {};
  for (const c of alphabet) counts[c] = 0;
  let total = 0;
  for (const ch of text) {
    const lc = ch.toLowerCase();
    if (lc in counts) {
      counts[lc] += 1;
      total += 1;
    }
  }
  const freqs = {};
  for (const k of Object.keys(counts)) {
    freqs[k] = total === 0 ? 0 : counts[k] / total;
  }
  return { counts, freqs, total };
}

export function scoreFreqs(candidateFreqs, targetFreqs, alphabet = "abcdefghijklmnopqrstuvwxyz") {
  let s = 0;
  for (const k of alphabet) {
    const a = candidateFreqs[k] ?? 0;
    const b = targetFreqs[k] ?? 0;
    const d = a - b;
    s += d * d;
  }
  return s;
}
