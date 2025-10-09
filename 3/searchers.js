import {
  RabinKarpSum,
  RabinKarpSumSquare,
  RabinKarpPolynomial
} from "./hashFunctions.js";
import { substrEquals } from "./utils.js";

export function buildHasher(s, kind = "poly", opts = {}) {
  if (kind === "sum") return RabinKarpSum(s);
  if (kind === "sumsq") return RabinKarpSumSquare(s);
  return RabinKarpPolynomial(s, opts);
}

export function searchByHash(s, t, kind = "poly", opts = {}, prebuiltHs = null) {
  const n = s.length;
  const m = t.length;
  const res = [];
  if (m === 0 || m > n) return res;

  const Hs = prebuiltHs === null ? buildHasher(s, kind, opts) : prebuiltHs;
  const Ht = buildHasher(t, kind, opts);

  const patternHash = (typeof Ht.hash === "function") ? Ht.hash(0, m - 1) : null;

  for (let i = 0; i <= n - m; i++) {
    const h = Hs.hash(i, i + m - 1);
    if (h === patternHash) {
      if (substrEquals(s, i, t)) res.push(i);
    }
  }
  return res;
}

export function searchByHashWithCollisions(s, t, kind = "poly", opts = {}, prebuiltHs = null) {
  const n = s.length;
  const m = t.length;
  const positions = [];
  if (m === 0 || m > n) {
    return { total_hash_hits: 0, true_matches: 0, collisions: 0, positions };
  }

  const Hs = prebuiltHs === null ? buildHasher(s, kind, opts) : prebuiltHs;
  const Ht = buildHasher(t, kind, opts);

  if (typeof Ht.hash !== "function" || typeof Hs.hash !== "function") {
    return { total_hash_hits: 0, true_matches: 0, collisions: 0, positions };
  }

  const patternHash = Ht.hash(0, m - 1);

  let total_hash_hits = 0;
  let true_matches = 0;
  let collisions = 0;

  for (let i = 0; i <= n - m; i++) {
    const h = Hs.hash(i, i + m - 1);
    if (h === patternHash) {
      total_hash_hits++;
      if (substrEquals(s, i, t)) {
        true_matches++;
        positions.push(i);
      } else {
        collisions++;
      }
    }
  }
  return { total_hash_hits, true_matches, collisions, positions };
}
