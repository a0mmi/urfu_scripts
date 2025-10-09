export function bruteSearch(s, t, opts = {}) {
  const base = opts.base === 1 ? 1 : 0;
  const n = s.length;
  const m = t.length;
  const res = [];

  if (m === 0) {
    return res;
  }
  if (m > n) return res;
  for (let i = 0; i <= n - m; i++) {
    let j = 0;
    for (; j < m; j++) {
      if (s.charCodeAt(i + j) !== t.charCodeAt(j)) break;
    }
    if (j === m) res.push(i + base);
  }
  return res;
}
