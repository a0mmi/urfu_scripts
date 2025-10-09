import fs from "fs";

export function nowMs() {
  return Number(process.hrtime.bigint() / 1000000n);
}

export function substrEquals(s, i, t) {
  for (let j = 0; j < t.length; j++) {
    if (s.charCodeAt(i + j) !== t.charCodeAt(j)) return false;
  }
  return true;
}

export function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
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

