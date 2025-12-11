
// config
var INPUT = "input.txt";
var ENCODE_OUT = "encode.txt";
var DECODE_OUT = "decode.txt";

var DEFAULT_FREQ = {
  a: 0.08167, b: 0.01492, c: 0.02782, d: 0.04253, e: 0.12702,
  f: 0.02228, g: 0.02015, h: 0.06094, i: 0.06966, j: 0.00153,
  k: 0.00772, l: 0.04025, m: 0.02406, n: 0.06749, o: 0.07507,
  p: 0.01929, q: 0.00095, r: 0.05987, s: 0.06327, t: 0.09056,
  u: 0.02758, v: 0.00978, w: 0.02360, x: 0.00150, y: 0.01974, z: 0.00074
};
// ヽ(*・ω・)ﾉ  ヽ(*・ω・)ﾉ ヽ(*・ω・)ﾉ ヽ(*・ω・)ﾉ ヽ(*・ω・)ﾉ 

var ALPHABET = "abcdefghijklmnopqrstuvwxyz";

// Для работы с файлами
function resolvePath(relPath) {
  var fso = new ActiveXObject("Scripting.FileSystemObject");
  relPath = relPath.replace(/\//g, "\\");
  var scriptFull = WScript.ScriptFullName;
  var scriptDir = scriptFull.substring(0, scriptFull.lastIndexOf("\\") + 1);
  return scriptDir + relPath;
}

function readTextUTF8(path) {
  var full = resolvePath(path);
  var s = new ActiveXObject("ADODB.Stream");
  s.Type = 2; // text
  s.Charset = "utf-8";
  s.Open();
  s.LoadFromFile(full);
  var txt = s.ReadText();
  s.Close();
  return txt;
}

function writeTextUTF8(path, text) {
  var full = resolvePath(path);
  var s = new ActiveXObject("ADODB.Stream");
  s.Type = 2; // text
  s.Charset = "utf-8";
  s.Open();
  s.WriteText(text);
  s.SaveToFile(full, 2); // overwrite
  s.Close();
}

// Утилиты
function buildIndexMap(alphabet) {
  var map = {};
  for (var i = 0; i < alphabet.length; i++) map[alphabet.charAt(i)] = i;
  return map;
}

var indexMap = buildIndexMap(ALPHABET);
var alphaLen = ALPHABET.length;

function mod(n, m) {
  return ((n % m) + m) % m;
}

function shiftChar(ch, shift) {
  var lower = String(ch).toLowerCase();
  if (indexMap.hasOwnProperty(lower)) {
    var base = indexMap[lower];
    var ni = mod(base + shift, alphaLen);
    var out = ALPHABET.charAt(ni);
    return (ch === lower) ? out : out.toUpperCase();
  }
  return ch;
}

function encrypt(text, shift) {
  shift = shift || 0;
  var out = [];
  for (var i = 0; i < text.length; i++) out.push(shiftChar(text.charAt(i), shift));
  return out.join('');
}

function decrypt(text, shift) {
  return encrypt(text, -shift);
}

// Частотный анализ
function computeLetterFreqs(text, alphabet) {
  alphabet = alphabet || ALPHABET;
  var counts = {};
  for (var i = 0; i < alphabet.length; i++) counts[alphabet.charAt(i)] = 0;
  var total = 0;
  for (var i = 0; i < text.length; i++) {
    var lc = String(text.charAt(i)).toLowerCase();
    if (counts.hasOwnProperty(lc)) { counts[lc] += 1; total++; }
  }
  var freqs = {};
  for (var k in counts) if (counts.hasOwnProperty(k)) freqs[k] = (total === 0) ? 0 : counts[k] / total;
  return { counts: counts, freqs: freqs, total: total };
}

function scoreFreqs(candidateFreqs, targetFreqs, alphabet) {
  alphabet = alphabet || ALPHABET;
  var s = 0;
  for (var i = 0; i < alphabet.length; i++) {
    var k = alphabet.charAt(i);
    var a = (candidateFreqs && candidateFreqs[k]) ? candidateFreqs[k] : 0;
    var b = (targetFreqs && targetFreqs[k]) ? targetFreqs[k] : 0;
    var d = a - b;
    s += d * d;
  }
  return s;
}

function analyzeByFreq(ciphertext, targetFreqs) {
  targetFreqs = targetFreqs || DEFAULT_FREQ;
  var best = { shift: 0, score: Number.POSITIVE_INFINITY, plaintext: "" };
  for (var s = 0; s < alphaLen; s++) {
    var cand = decrypt(ciphertext, s);
    var tf = computeLetterFreqs(cand, ALPHABET);
    var sc = scoreFreqs(tf.freqs, targetFreqs, ALPHABET);
    if (sc < best.score) best = { shift: s, score: sc, plaintext: cand };
  }
  return best;
}

// один аргумент: целое число shift
function parseShiftArg() {
  var args = WScript.Arguments;
  var shift = 3;
  if (args.length > 0) {
    var a0 = args.Item(0);
    var n = Number(a0);
    if (!isNaN(n) && isFinite(n) && Math.floor(n) === n) {
      shift = mod(n, alphaLen);
    }
  }
  return shift;
}

// main
(function main() {
  try {
    var shift = parseShiftArg();
    var inputText = readTextUTF8(INPUT);

    var cipherText = encrypt(inputText, shift);
    writeTextUTF8(ENCODE_OUT, cipherText);
    WScript.Echo("WRITE: " + resolvePath(ENCODE_OUT));

    var encodedFromFile = readTextUTF8(ENCODE_OUT);
    var best = analyzeByFreq(encodedFromFile, DEFAULT_FREQ);
    writeTextUTF8(DECODE_OUT, best.plaintext);

    var scoreStr = (isFinite(best.score)) ? best.score.toExponential(5) : String(best.score);

    WScript.Echo("OK: " + resolvePath(DECODE_OUT) + " (best shift=" + best.shift + ", score=" + scoreStr + ")");
  } catch (e) {
    WScript.Echo("ERROR: " + (e && e.message ? e.message : e));
    WScript.Quit(1);
  }
})();
