export function bruteSearch(text, pattern) {
  const positions = [];
  for (let i = 0; i + pattern.length <= text.length; i++) {
    let match = true;
    for (let j = 0; j < pattern.length; j++) {
      if (text[i+j] !== pattern[j]) { match = false; break; }
    }
    if (match) positions.push(i);
  }
  return positions;
}
