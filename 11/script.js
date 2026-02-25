(function() {
    // Пусть будет проверка на двоичку
    function isBinaryString(s) {
        return /^[01]+$/.test(s);
    }

    // 2^r >= k + r + 1
    function calcParityCount(k) {
        var r = 0;
        while (Math.pow(2, r) < k + r + 1) r++;
        return r;
    }

    // Проверка степени 2
    function isPowerOfTwo(x) {
        return (x & (x - 1)) === 0 && x !== 0;
    }

    function encode(dataStr) {
        if (!isBinaryString(dataStr)) throw "Input must be binary (only 0 and 1).";
        var k = dataStr.length;
        var r = calcParityCount(k);
        var n = k + r;

        // 1-based pos: 1..n
        var bits = new Array(n + 1);
        for (var i = 0; i <= n; i++) bits[i] = 0;

        var di = k - 1;
        for (var pos = 1; pos <= n; pos++) {
            if (!isPowerOfTwo(pos)) {
                bits[pos] = parseInt(dataStr.charAt(di), 10);
                di--;
            } else {
                bits[pos] = 0; // контр. биты = 0
            }
        }

        // Заполнение контр. битов
        for (var p = 0; p < r; p++) {
            var parityPos = 1 << p;
            var parity = 0;
            for (var pos = 1; pos <= n; pos++) {
                if ((pos & parityPos) !== 0) parity ^= bits[pos]; // Сумма по модулю 2
            }
            bits[parityPos] = parity;
        }

        var out = "";
        for (var pos = n; pos >= 1; pos--) out += bits[pos].toString();
        return {
            encoded: out,
            n: n,
            r: r,
            bitsArray: bits // 1-based
        };
    }

    function decode(encodedStr) {
        if (!isBinaryString(encodedStr)) return {
            success: false,
            message: "Encoded input must be binary (only 0 and 1).",
            data: null
        };
        var n = encodedStr.length;
        var r = 0;
        while ((1 << r) <= n) r++;

        // bits 1-based
        var bits = new Array(n + 1);
        var idx = encodedStr.length - 1;
        for (var pos = 1; pos <= n; pos++) {
            bits[pos] = parseInt(encodedStr.charAt(idx), 10);
            idx--;
        }

        // pos ошибки 
        var syndrome = 0;
        for (var p = 0; p < r; p++) {
            var parityPos = 1 << p;
            var parity = 0;
            for (var pos = 1; pos <= n; pos++) {
                if ((pos & parityPos) !== 0) parity ^= bits[pos]; // Сумма по модулю 2
            }
            if (parity !== 0) syndrome |= parityPos;
        }

        var corrected = false;
        var correctedPos = 0;
        if (syndrome !== 0) {
            if (syndrome <= n) {
                // Фокус с переворотом
                bits[syndrome] = bits[syndrome] ^ 1; // XOR
                corrected = true;
                correctedPos = syndrome;
            } else {
                // Слишком большая позиция = несколько ошибок
                return {
                    success: false,
                    message: "Error position (" + syndrome + ") outside length; possibly multiple errors.",
                    data: null,
                    syndrome: syndrome
                };
            }
        }

        // Собираю
        var dataBits = [];
        for (var pos = n; pos >= 1; pos--) {
            if (!isPowerOfTwo(pos)) dataBits.push(bits[pos].toString());
        }
        var dataStr = dataBits.join('');

        var message = corrected ? ("1 error corrected at position " + correctedPos) : "no errors";
        return {
            success: true,
            data: dataStr,
            corrected: corrected,
            message: message,
            correctedPos: correctedPos,
            syndrome: syndrome,
            bitsArray: bits,
            n: n,
            r: r
        };
    }

    // Кнопочки, короч UI
    var runBtn = document.getElementById('runBtn');
    var bitsInput = document.getElementById('bitsInput');
    var outputPre = document.getElementById('outputPre');
    var radioMode = function() {
        return document.querySelector('input[name="mode"]:checked').value;
    };

    // Вывод в блок
    function show(text) {
        outputPre.textContent = text;
    }

    // Загонка под формат строки и биты
    function formatBitsRow(bitsArray, n, highlightPos) {
        var posLine = '';
        var bitsLine = '';
        for (var pos = n; pos >= 1; pos--) {
            var posStr = pos.toString();
            posLine += posStr + (pos > 9 ? ' ' : '  ');
            bitsLine += bitsArray[pos].toString() + '  ';
        }
        return posLine.trim() + '\n' + bitsLine.trim();
    }

    // тест encode
    function presentEncodeResult(res) {
        var out = [];
        out.push("Encoded output:");
        out.push(res.encoded);
        out.push("");
        out.push("Details:");
        out.push("n (total bits) = " + res.n + ", r (parity bits) = " + res.r);
        out.push("");
        out.push("Bits layout (pos n ... 1):");
        out.push(formatBitsRow(res.bitsArray, res.n, -1));
        return out.join('\n');
    }

    // тест decode
    function presentDecodeResult(encodedStr, resObj) {
        if (!resObj.success) {
            return "Error: " + resObj.message;
        }
        var out = [];
        out.push("Decoded data: " + resObj.data + " (" + resObj.message + ")");
        out.push("");
        out.push("Syndrome: " + resObj.syndrome);
        out.push("Corrected: " + (resObj.corrected ? "yes, at position " + resObj.correctedPos : "no"));
        out.push("");
        out.push("Bits layout after (possible) correction (pos n ... 1):");
        out.push(formatBitsRow(resObj.bitsArray, resObj.n, resObj.correctedPos));
        return out.join('\n');
    }

    // Start
    runBtn.addEventListener('click', function() {
        var mode = radioMode();
        var bits = bitsInput.value.replace(/\s+/g, '');
        if (!bits) {
            show("Введите битовую строку (0 и 1).");
            return;
        }

        try {
            if (mode === 'encode') {
                var enc = encode(bits);
                show(presentEncodeResult(enc));
            } else {
                var dec = decode(bits);
                show(presentDecodeResult(bits, dec));
            }
        } catch (e) {
            show("Exception: " + e);
        }
    });

    // Enter в поле
    bitsInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            runBtn.click();
        }
    });
})();