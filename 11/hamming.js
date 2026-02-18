// cscript hamming.js encode 1011001
// cscript hamming.js decode 10011010101

function isBinaryString(s) { // По сути ненужная проверка на то, что бинарная строка или нет
    return /^[01]+$/.test(s);
}

function calcParityCount(k) {
    // 2^r >= k + r + 1
    var r = 0;
    while (Math.pow(2, r) < k + r + 1) r++;
    return r;
}

// Степень двойки или нет
function isPowerOfTwo(x) {
    return (x & (x - 1)) === 0;
}

function encode(dataStr) {
    if (!isBinaryString(dataStr)) throw "Input must be binary (only 0 and 1).";
    var k = dataStr.length;
    var r = calcParityCount(k); // сколько контрольных битиков
    var n = k + r; // Сколько вообще битов получается

    var bits = new Array(n + 1);
    for (var i = 0; i <= n; i++) bits[i] = 0; // нулями заполняем

    var di = k - 1;
    for (var pos = 1; pos <= n; pos++) {
        if (!isPowerOfTwo(pos)) {
            bits[pos] = parseInt(dataStr.charAt(di), 10); // просто беру значения бит-а со строки
            di--;
        } else {
            bits[pos] = 0; // оставляю и заполняю потом
        }
    }

    for (var p = 0; p < r; p++) {
        var parityPos = 1 << p; // 2^p -- позиция контрольного бита
        var parity = 0;
        for (var pos = 1; pos <= n; pos++) {
            if ((pos & parityPos) !== 0) {
                parity ^= bits[pos]; // Суммирование по модулю 2, короче просто чередование чётности - нечётности
            }
        }
        bits[parityPos] = parity;
    }

    var out = "";
    for (var pos = n; pos >= 1; pos--) out += bits[pos].toString(); // Возвращение закодированной строки в порядке слева-направо
    return out;
}

function decode(encodedStr) {
    if (!isBinaryString(encodedStr)) throw "Encoded input must be binary (only 0 and 1)."; // Эстетическая проверка
    var n = encodedStr.length;
    var r = 0;
    while ((1 << r) <= n) r++; // Нахожу r, которое должно быть

    var bits = new Array(n + 1);
    var idx = encodedStr.length - 1;
    for (var pos = 1; pos <= n; pos++) {
        bits[pos] = parseInt(encodedStr.charAt(idx), 10); // Фокус с переворотом
        idx--;
    }

    // syndrome -- pos неправильного бита (pos начинается с pos1, елси syndrome == 0, то ошибки нет)
    var syndrome = 0;
    for (var p = 0; p < r; p++) {
        var parityPos = 1 << p;
        var parity = 0;
        for (var pos = 1; pos <= n; pos++) {
            // (pos & parityPos) !== 0) проверяет: `имеет ли pos единичный бит в том месте, где у parityPos единица?`
            if ((pos & parityPos) !== 0) parity ^= bits[pos]; // Подсчёт чётности - нечётности, сумма по модулю 2
        }
        if (parity !== 0) syndrome |= parityPos; // добавляю эту позицию в двоичную `маску` синдрома
    }

    var corrected = false;
    var correctedPos = 0;
    if (syndrome !== 0) {
        if (syndrome <= n) {
            // Фокус с переворотом одного бита
            bits[syndrome] = bits[syndrome] ^ 1;
            corrected = true;
            correctedPos = syndrome;
        } else {
            // Ошибок больше одной
            return {
                success: false,
                message: "Error position (" + syndrome + ") outside length; possibly multiple errors.",
                data: null
            };
        }
    }
    // Выводы
    var dataBits = [];
    for (var pos = n; pos >= 1; pos--) {
        if (!isPowerOfTwo(pos)) dataBits.push(bits[pos].toString());
    }
    var dataStr = dataBits.join('');

    var message = corrected ? ("1 error corrected at position " + correctedPos) : "no errors";
    return { success: true, data: dataStr, corrected: corrected, message: message, correctedPos: correctedPos, syndrome: syndrome };
}

function printUsage() {
    WScript.Echo("Hamming (single-error-correcting) kodirovanie/decodirovanie RU na Inglishe");
    WScript.Echo("cscript hamming.js encode <binary-string>");
    WScript.Echo("cscript hamming.js decode <binary-string>");
}

try {
    var args = WScript.Arguments;
    if (args.Length < 2) {
        printUsage();
        WScript.Quit(1);
    }
    var cmd = args.Item(0).toLowerCase(); // Команда encode/decode
    var bits = args.Item(1).replace(/\s+/g, ''); // Битики

    if (cmd === "encode") {
        var enc = encode(bits);
        WScript.Echo(enc);
    } else if (cmd === "decode") {
        var res = decode(bits);
        if (!res.success) {
            WScript.Echo("Error: " + res.message);
            WScript.Quit(2);
        } else {
            var out = "Decoded data: " + res.data + " (" + res.message + ")";
            WScript.Echo(out);
        }
    } else {
        printUsage();
        WScript.Quit(1);
    }
} catch (e) {
    WScript.Echo("Exception: " + e);
    WScript.Quit(99);
}

// orig:   1 0 1 1
// pos:    7 6 5 4 3 2 1   (←)
// bits:   1 0 1 0 1 0 1
// pos(cc-2): 111 110 101 100 011 010 001