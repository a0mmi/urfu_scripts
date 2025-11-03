import fs from 'fs';
import path from 'path';

export function nowMs() {
  return Number(process.hrtime.bigint() / 1000000n);
}

export function nowUs() {
  return Number(process.hrtime.bigint() / 1000n);
}

export function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 
    ? (sorted[mid - 1] + sorted[mid]) / 2 
    : sorted[mid];
}

export function substrEquals(s, i, t) {
  for (let j = 0; j < t.length; j++) {
    if (s.charCodeAt(i + j) !== t.charCodeAt(j)) return false;
  }
  return true;
}

export function readFile(path) {
  try {
    return fs.readFileSync(path, "utf-8");
  } catch (err) {
    console.error(`ERROR: ${err.message}`);
    process.exit(1);
  }
}

export function saveResults(filename, results) {
  const dir = path.dirname(filename);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const headers = Object.keys(results[0]);
  const rows = [
    headers.join(','),
    ...results.map(r => headers.map(h => {
      let val = r[h];
      if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(','))
  ];

  fs.writeFileSync(filename, rows.join('\n'), 'utf-8');
  console.log(`Results saved to ${filename}`);
}