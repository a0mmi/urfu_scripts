import { die } from './app.js';

export function preprocessText(rawText) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) die('No content in file');
  lines[0] = lines[0].replace(/['"]/g, '');
  return lines;
}

export function parseAssignments(lines) {
  const vars = {};
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].replace(/['"]/g, '');
    const parts = line.split(/\s+/).filter(Boolean);
    if (parts.length < 2) die('Invalid assignment line: ' + lines[i]);
    
    const name = parts[0];
    const valueStr = parts.slice(1).join(' ');
    const val = Number(valueStr);
    if (Number.isNaN(val)) die('Invalid number for variable ' + name + ' -> ' + valueStr);
    vars[name] = val;
  }
  return vars;
}

export function tokenize(s) {
  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) { i++; continue; }

    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      if (j < s.length && /[eE]/.test(s[j])) {
        j++;
        if (j < s.length && (s[j] === '+' || s[j] === '-')) j++;
        while (j < s.length && /[0-9]/.test(s[j])) j++;
      }
      const tok = s.slice(i, j);
      if ((tok.match(/\./g) || []).length > 1) die('Invalid number: ' + tok);
      tokens.push({ type: 'number', value: tok });
      i = j;
      continue;
    }

    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < s.length && /[A-Za-z0-9_]/.test(s[j])) j++;
      tokens.push({ type: 'ident', value: s.slice(i, j) });
      i = j;
      continue;
    }

    if ('+-*/^()'.includes(ch)) {
      tokens.push({ type: 'op', value: ch });
      i++;
      continue;
    }

    die('Invalid character in expression: ' + ch);
  }
  return tokens;
}