export function sumHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h += s.charCodeAt(i);
  }
  return h;
}

export function squareHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    h += code * code;
  }
  return h;
}

export function polyHash(s, p = 31, mod = 1e9 + 7) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * p + s.charCodeAt(i)) % mod;
  }
  return h;
}