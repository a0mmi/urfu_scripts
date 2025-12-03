import { computeLetterFreqs, scoreFreqs } from './utils.js';
import { ALPHABET, DEFAULT_FREQ } from './config.js';

export class CaesarCipher {
  constructor({ alphabet = ALPHABET, targetFreqs = DEFAULT_FREQ } = {}) {
    this.alphabet = alphabet;
    this.alphaLen = alphabet.length;
    this.indexOf = {};
    for (let i = 0; i < this.alphaLen; i++) this.indexOf[alphabet[i]] = i;
    this.targetFreqs = targetFreqs;
  }

  shiftChar(ch, shift) {
    const lower = ch.toLowerCase();
    if (lower in this.indexOf) {
      const baseIndex = this.indexOf[lower];
      const newIndex = ((baseIndex + shift) % this.alphaLen + this.alphaLen) % this.alphaLen;
      const out = this.alphabet[newIndex];
      return (ch === lower) ? out : out.toUpperCase();
    }
    return ch;
  }

  encrypt(text, shift) {
    return Array.from(text).map(ch => this.shiftChar(ch, shift)).join('');
  }

  decrypt(text, shift) {
    return this.encrypt(text, -shift);
  }

  analyze(ciphertext, { returnAll = false } = {}) {
    if (!this.targetFreqs) throw new Error("targetFreqs not set on CaesarCipher instance");
    let best = { shift: 0, score: Infinity, plaintext: "" };
    const all = [];
    for (let s = 0; s < this.alphaLen; s++) {
      const cand = this.decrypt(ciphertext, s);
      const { freqs } = computeLetterFreqs(cand, this.alphabet);
      const score = scoreFreqs(freqs, this.targetFreqs, this.alphabet);
      all.push({ shift: s, score });
      if (score < best.score) best = { shift: s, score, plaintext: cand };
    }
    return returnAll ? { ...best, all } : best;
  }
}
