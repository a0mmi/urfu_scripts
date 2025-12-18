
// Utilities
function pad(str, len) {
  while (str.length < len) str = '0' + str;
  return str;
}

function intToBin(n) {
  if (n === 0) return '0';
  var s = '';
  while (n > 0) {
    s = (n & 1) + s;
    n = Math.floor(n / 2);
  }
  return s;
}

// Convert fractional part in [0,1) to binary string of length `limit`.
function fracToBin(frac, limit) {
  var bits = '';
  var f = frac;
  for (var i = 0; i < limit; i++) {
    f *= 2;
    if (f >= 1) { bits += '1'; f -= 1; } else { bits += '0'; }
  }
  return { bits: bits, sticky: (f > 0) ? 1 : 0 };
}

// Round fraction string (no implicit bit) using round-to-nearest-even.
function roundToNearestEven(fracBits, guard, sticky) {
  var last = parseInt(fracBits.charAt(fracBits.length - 1), 10);
  if (guard === 1 && (sticky === 1 || last === 1)) {
    var carry = 1;
    var arr = fracBits.split('').map(function (b) { return parseInt(b, 10); });
    for (var i = arr.length - 1; i >= 0 && carry; i--) {
      var s = arr[i] + carry;
      arr[i] = s & 1;
      carry = s >> 1;
    }
    return { frac: arr.join(''), carry: carry };
  }
  return { frac: fracBits, carry: 0 };
}

// Encoder: decimal -> IEEE-754 single
function toIEEE754Single(x) {
  var sign = (1 / x === -Infinity || x < 0) ? 1 : 0;
  var absx = Math.abs(x);

  // Special cases
  if (isNaN(x)) {
    return { bits: '0' + '11111111' + '10000000000000000000000' };
  }
  if (!isFinite(x)) {
    return { bits: (sign ? '1' : '0') + '11111111' + '00000000000000000000000' };
  }
  if (absx === 0) {
    return { bits: (sign ? '1' : '0') + '00000000' + '00000000000000000000000' };
  }

  var intPart = Math.floor(absx);
  var fracPart = absx - intPart;
  var intBin = intToBin(intPart);

  var needed = 23; // fraction bits
  var extra = 3; // guard + round + small margin
  var fracLimit = needed + extra + 8;
  var fracObj = fracToBin(fracPart, fracLimit);

  var mantissaBits = '';
  var exponent = 0;

  if (intPart !== 0) {
    exponent = intBin.length - 1; // position of leading 1
    mantissaBits = intBin.slice(1) + fracObj.bits;
  } else {
    var firstOne = fracObj.bits.indexOf('1');
    if (firstOne === -1) firstOne = fracObj.bits.length;
    exponent = -(firstOne + 1);
    mantissaBits = fracObj.bits.slice(firstOne + 1);
  }

  var bias = 127;
  var E_biased = exponent + bias;

  // Denormal handling (E_biased <= 0)
  if (E_biased <= 0) {
    var scaled = absx * Math.pow(2, 126);
    var scaledInt = Math.floor(scaled);
    var scaledBin = intToBin(scaledInt);
    var fracField = pad(scaledBin, 23).slice(0, 23);
    return { bits: (sign ? '1' : '0') + pad('0', 8) + fracField };
  }

  // Overflow to Infinity
  if (E_biased >= 255) {
    return { bits: (sign ? '1' : '0') + '11111111' + '00000000000000000000000' };
  }

  // Prepare fraction field and rounding bits
  var after = mantissaBits.slice(needed);
  var guard = (after.length > 0) ? parseInt(after.charAt(0), 10) : 0;
  var rest = after.slice(1);
  var sticky = (rest.indexOf('1') !== -1 || fracObj.sticky) ? 1 : 0;
  var fracField = pad(mantissaBits, needed + 5).slice(0, needed);

  var rnd = roundToNearestEven(fracField, guard, sticky);
  var finalFrac = rnd.frac;
  if (rnd.carry) {
    E_biased += 1;
    if (E_biased >= 255) {
      return { bits: (sign ? '1' : '0') + '11111111' + '00000000000000000000000' };
    }
    finalFrac = pad('', 23).replace(/./g, '0');
  }

  var bits = (sign ? '1' : '0') + pad(E_biased.toString(2), 8) + finalFrac;
  return { bits: bits };
}

// Adder: simulate IEEE-754 single addition
function simulateAdd(A, B) {
  WScript.Echo('--- A + B (IEEE-754 single simulation) ---');
  WScript.Echo('A = ' + A + ', B = ' + B);

  var aEnc = toIEEE754Single(A);
  var bEnc = toIEEE754Single(B);
  WScript.Echo('A bits: ' + aEnc.bits);
  WScript.Echo('B bits: ' + bEnc.bits);

  // Quick special-case checks (NaN/Inf)
  if (aEnc.bits.slice(1, 9) === '11111111' || bEnc.bits.slice(1, 9) === '11111111') {
    WScript.Echo('Special operand (Inf/NaN) detected — handle separately.');
    return;
  }

  function decode(bits) {
    var sign = bits.charAt(0) === '1' ? 1 : 0;
    var exp = parseInt(bits.slice(1, 9), 2);
    var fracStr = bits.slice(9);
    if (exp === 0) { // zero or denormal
      return { sign: sign, exp: exp, mantissaInt: parseInt(fracStr, 2), denormal: true };
    }
    var mant = (1 << 23) + parseInt(fracStr, 2); // 24-bit mantissa
    return { sign: sign, exp: exp, mantissaInt: mant, denormal: false };
  }

  var Acomp = decode(aEnc.bits);
  var Bcomp = decode(bEnc.bits);

  // Prepare for alignment (add extra bits for guard/round/sticky)
  var extra = 4;
  var A_m = Acomp.mantissaInt << extra;
  var B_m = Bcomp.mantissaInt << extra;
  var Aexp = Acomp.exp;
  var Bexp = Bcomp.exp;
  var Asign = Acomp.sign;
  var Bsign = Bcomp.sign;

  // Ensure Aexp >= Bexp
  if (Bexp > Aexp) {
    var tmp; tmp = Aexp; Aexp = Bexp; Bexp = tmp;
    tmp = A_m; A_m = B_m; B_m = tmp;
    tmp = Asign; Asign = Bsign; Bsign = tmp;
  }

  var delta = Aexp - Bexp;
  var sticky = 0;
  if (delta >= 64) {
    if (B_m !== 0) sticky = 1;
    B_m = 0;
  } else {
    for (var i = 0; i < delta; i++) { sticky = sticky | (B_m & 1); B_m = B_m >>> 1; }
  }

  // Add or subtract mantissas
  var resultSign = Asign;
  var resMant = 0;
  if (Asign === Bsign) {
    resMant = A_m + B_m;
  } else {
    if (A_m >= B_m) { resMant = A_m - B_m; resultSign = Asign; }
    else { resMant = B_m - A_m; resultSign = Bsign; }
  }

  if (resMant === 0) { WScript.Echo('Result is exact zero'); return; }

  // Normalize
  var Mbits = 24 + extra;
  var topPos = Math.floor(Math.log(resMant) / Math.LN2);
  var resExp = Aexp;

  if (topPos > Mbits - 1) {
    var shift = topPos - (Mbits - 1);
    var lost = 0;
    for (var s = 0; s < shift; s++) { lost |= (resMant & 1); resMant = resMant >>> 1; }
    resExp += shift;
    sticky |= (lost ? 1 : 0);
  } else if (topPos < (Mbits - 1)) {
    var shiftL = (Mbits - 1) - topPos;
    resMant = resMant << shiftL;
    resExp -= shiftL;
  }

  // Rounding
  var guardPos = extra - 1;
  var guard = (resMant >>> guardPos) & 1;
  var lowMask = (1 << guardPos) - 1;
  var low = resMant & lowMask;
  var stickyNow = (low !== 0) ? 1 : 0;
  stickyNow |= sticky;

  var fracInt = (resMant >>> extra) & ((1 << 23) - 1);
  var lsb = fracInt & 1;
  if (guard === 1 && (stickyNow === 1 || lsb === 1)) {
    fracInt += 1;
    if (fracInt === (1 << 23)) { fracInt = 0; resExp += 1; }
  }

  if (resExp >= 255) { WScript.Echo('Overflow -> ' + (resultSign ? '-Inf' : '+Inf')); return; }
  if (resExp <= 0) { WScript.Echo('Underflow/denormal result'); return; }

  var resultBits = (resultSign ? '1' : '0') + pad(resExp.toString(2), 8) + pad(fracInt.toString(2), 23);
  WScript.Echo('Result bits: ' + resultBits + '  hex: 0x' + (parseInt(resultBits, 2) >>> 0).toString(16));
}

(function main() {
  var A = parseFloat(WScript.Arguments(0) || '1.5');
  var B = parseFloat(WScript.Arguments(1) || '2.25');

  WScript.Echo('Converting A:'); WScript.Echo(toIEEE754Single(A).bits);
  WScript.Echo('Converting B:'); WScript.Echo(toIEEE754Single(B).bits);
  simulateAdd(A, B);
})();
