import { sumHash, squareHash, polyHash } from './hash.js';
import { substrEquals } from './utils.js';

const METHOD_CONFIG = {
  sum: {
    initWindow: (text, m) => {
      let h = 0;
      for (let i = 0; i < m; i++) {
        h += text.charCodeAt(i);
      }
      return h;
    },
    updateWindow: (current, text, i, m) => {
      return current - text.charCodeAt(i - 1) + text.charCodeAt(i + m - 1);
    }
  },
  sumsq: {
    initWindow: (text, m) => {
      let h = 0;
      for (let i = 0; i < m; i++) {
        const code = text.charCodeAt(i);
        h += code * code;
      }
      return h;
    },
    updateWindow: (current, text, i, m) => {
      const oldCode = text.charCodeAt(i - 1);
      const newCode = text.charCodeAt(i + m - 1);
      return current - (oldCode * oldCode) + (newCode * newCode);
    }
  },
  poly: {
    initWindow: (text, m, p, mod) => {
      let h = 0;
      for (let i = 0; i < m; i++) {
        h = (h * p + text.charCodeAt(i)) % mod;
      }
      return h;
    },
    updateWindow: (current, text, i, m, prevChar, power, p, mod) => {
      current = (current - (prevChar * power) % mod + mod) % mod;
      return (current * p + text.charCodeAt(i + m - 1)) % mod;
    },
    precompute: (m, p, mod) => {
      let h = 1;
      for (let i = 0; i < m - 1; i++) {
        h = (h * p) % mod;
      }
      return h;
    }
  }
};

export function search(text, pattern, method, options = {}) {
  const m = pattern.length;
  const n = text.length;
  
  if (m === 0 || n === 0 || m > n) {
    return { matches_count: 0, falsePositives: 0 };
  }

  // брут метод
  if (method === 'brute') {
    let count = 0;
    for (let i = 0; i <= n - m; i++) {
      if (substrEquals(text, i, pattern)) {
        count++;
      }
    }
    return { matches_count: count, falsePositives: 0 };
  }

  // Настройки по умолчанию для полиномиального хеша
  const p = options.p || 31;
  const mod = options.mod || 1000000007;
  
  // Вычисляем хеш паттерна
  const patternHash = 
    method === 'poly' ? polyHash(pattern, p, mod) : 
    method === 'sum' ? sumHash(pattern) : 
    squareHash(pattern);
  
  // Предварительные вычисления для метода
  let power = null;
  if (method === 'poly') {
    power = config.precompute(m, p, mod);
  }
  
  // Инициализация первого окна
  let windowHash = config.initWindow(text, m, p, mod);
  
  // Счетчики
  let matches_count = 0;
  let falsePositives = 0;
  
  // Проверка первого окна
  if (windowHash === patternHash && substrEquals(text, 0, pattern)) {
    matches_count++;
  } else if (windowHash === patternHash) {
    falsePositives++;
  }
  
  // Скользящее окно
  for (let i = 1; i <= n - m; i++) {
    // Обновление хеша
    windowHash = method === 'poly'
      ? config.updateWindow(windowHash, text, i, m, text.charCodeAt(i - 1), power, p, mod)
      : config.updateWindow(windowHash, text, i, m);
    
    // Проверка хеша
    if (windowHash === patternHash) {
      if (substrEquals(text, i, pattern)) {
        matches_count++;
      } else {
        falsePositives++;
      }
    }
  }
  
  return { matches_count, falsePositives };
}