export function padRight(s, n) {
  s = String(s);
  return s + ' '.repeat(Math.max(0, n - s.length));
}

export function formatTable(freqs) {
  if (!freqs || freqs.length === 0) return '(пусто)';

  const chW = Math.max(...freqs.map(f => String(f.ch).length), 6);
  const cntW = Math.max(...freqs.map(f => String(f.count).length), 5);
  const pW = 10;

  const lines = [];
  lines.push(padRight('symbol', chW) + '  ' + padRight('count', cntW) + '  ' + padRight('p', pW));
  lines.push('-'.repeat(chW) + '  ' + '-'.repeat(cntW) + '  ' + '-'.repeat(pW));
  for (const f of freqs) {
    lines.push(padRight(escapeForPrint(f.ch), chW) + '  ' + padRight(f.count, cntW) + '  ' + padRight(f.p.toFixed(6), pW));
  }
  return lines.join('\n');
}

function escapeForPrint(ch) {
  if (ch === ' ') return "' '";
  if (ch === '\t') return "'\\t'";
  if (ch === '\n') return "'\\n'";
  return ch;
}
