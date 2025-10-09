export function RabinKarpSum(s) {
  const n = s.length;
  const prefix = new Array(n + 1).fill(0n);
  for (let i = 0; i < n; i++) {
    prefix[i + 1] = prefix[i] + BigInt(s.charCodeAt(i));
  }

  function hash(l, r) { 
    if (l < 0) l = 0;
    if (r >= n) r = n - 1;
    return prefix[r + 1] - prefix[l];
  }

  function roll(prevHash, leftIndex, newIndex) {
    
    const lval = BigInt(s.charCodeAt(leftIndex));
    const nval = BigInt(s.charCodeAt(newIndex));
    return prevHash - lval + nval;
  }

  function removeLeft(prevHash, leftIndex) {
    return prevHash - BigInt(s.charCodeAt(leftIndex));
  }

  return {
    hash,
    roll,
    removeLeft,
    prefix,
    n
  };
}

export function RabinKarpSumSquare(s) {
  const n = s.length;
  const prefix = new Array(n + 1).fill(0n);
  for (let i = 0; i < n; i++) {
    const v = BigInt(s.charCodeAt(i));
    prefix[i + 1] = prefix[i] + v * v;
  }

  function hash(l, r) {
    if (l < 0) l = 0;
    if (r >= n) r = n - 1;
    return prefix[r + 1] - prefix[l];
  }

  function roll(prevHash, leftIndex, newIndex) {
    const lval = BigInt(s.charCodeAt(leftIndex));
    const nval = BigInt(s.charCodeAt(newIndex));
    return prevHash - lval * lval + nval * nval;
  }

  function removeLeft(prevHash, leftIndex) {
    const lval = BigInt(s.charCodeAt(leftIndex));
    return prevHash - lval * lval;
  }

  return {
    hash,
    roll,
    removeLeft,
    prefix,
    n
  };
}

export function RabinKarpPolynomial(s, opts = {}) {
  
  const n = s.length;
  const p = opts.p !== undefined ? BigInt(opts.p) : 131n;
  const M = opts.M !== undefined ? BigInt(opts.M) : 1000000007n;

  
  const pow = new Array(n + 1).fill(0n);
  pow[0] = 1n;
  for (let i = 1; i <= n; i++) pow[i] = (pow[i - 1] * p) % M;

  
  
  const pref = new Array(n + 1).fill(0n);
  for (let i = 0; i < n; i++) {
    pref[i + 1] = (pref[i] * p + BigInt(s.charCodeAt(i))) % M;
  }

  function hash(l, r) { 
    if (l < 0) l = 0;
    if (r >= n) r = n - 1;
    const len = r - l + 1;
    let res = pref[r + 1] - (pref[l] * pow[len] % M);
    res %= M;
    if (res < 0) res += M;
    return res;
  }

  function initWindow(l, len) {
    const r = l + len - 1;
    return hash(l, r);
  }

  function roll(prevHash, leftIndex, newIndex, len) {
    
    
    const lval = BigInt(s.charCodeAt(leftIndex));
    const nval = BigInt(s.charCodeAt(newIndex));
    
    let res = prevHash - (lval * pow[len - 1]) % M;
    res %= M;
    if (res < 0) res += M;
    
    res = (res * p + nval) % M;
    return res;
  }

  function removeLeft(prevHash, leftIndex, len) {
    
    const lval = BigInt(s.charCodeAt(leftIndex));
    let res = prevHash - (lval * pow[len - 1]) % M;
    res %= M;
    if (res < 0) res += M;
    return res; 
  }

  return {
    p,
    M,
    pow,
    pref,
    hash,
    initWindow,
    roll,
    removeLeft,
    n
  };
}
