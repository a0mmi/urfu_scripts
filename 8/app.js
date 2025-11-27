var fso = new ActiveXObject("Scripting.FileSystemObject");

// Чтение строка || путь
function readInputArg() {
    var args = WScript.Arguments;
    if (args.length === 0) {
        WScript.Echo("Пустая строка ввода. Либо строка, либо путь.");
        WScript.Quit(2);
    }
    var raw = args.Item(0);
    try {
        if (fso.FileExists(raw)) {
            var ts = fso.OpenTextFile(raw, 1);
            var txt = ts.ReadAll();
            ts.Close();
            txt = txt.replace(/[\r\n]+$/, "");
            return txt;
        }
    } catch(e) {
    }
    return raw;
}

// Узел дерева
function makeNode(str, freq) {
    return {
        str: str,
        freq: freq,
        code: "",
        parent: null,
        child: []
    };
}

// Сборка листиков
function buildLeafNodes(s) {
    var freq = {};
    for (var i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        if (!freq.hasOwnProperty(c)) freq[c] = 0;
        freq[c]++;
    }
    var nodes = [];
    for (var ch in freq) {
        if (freq.hasOwnProperty(ch)) {
            nodes.push(makeNode(ch, freq[ch]));
        }
    }
    return nodes;
}

function popTwoLowest(nodes) {
    // Сортировка по частоте, длине строки, лексикографически
    nodes.sort(function(a, b) {
        if (a.freq !== b.freq) return a.freq - b.freq;
        if (a.str.length !== b.str.length) return a.str.length - b.str.length;
        return (a.str < b.str) ? -1 : ((a.str > b.str) ? 1 : 0);
    });
    var a = nodes.shift();
    var b = nodes.shift();
    return [a,b];
}

// Сборка дерева Хафмана
function buildHuffmanTree(s) {
    if (s.length === 0) return null;
    var nodes = buildLeafNodes(s);
    if (nodes.length === 1) {
        var leaf = nodes[0];
        var root = makeNode(leaf.str, leaf.freq);
        root.child.push(leaf);
        root.child.push(makeNode("", 0));
        leaf.parent = root;
        root.child[1].parent = root;
        return root;
    }
    while (nodes.length > 1) {
        var pair = popTwoLowest(nodes);
        var left = pair[0];
        var right = pair[1];
        var parent = makeNode(left.str + right.str, left.freq + right.freq);
        parent.child.push(left);
        parent.child.push(right);
        left.parent = parent;
        right.parent = parent;
        nodes.push(parent);
    }
    return nodes[0];
}

// Назначение кодов дереву при помощи DFS
function assignCodes(root) {
    if (!root) return;
    function dfs(node, prefix) {
        node.code = prefix;
        if (!node.child || node.child.length === 0) {
            return;
        }
        if (node.child.length >= 1) dfs(node.child[0], prefix + "0");
        if (node.child.length >= 2) dfs(node.child[1], prefix + "1");
    }
    dfs(root, "");
}

// Сборка всех узлов
function gatherLeaves(root) {
    var leaves = [];
    function dfs(node) {
        if (!node) return;
        if (!node.child || node.child.length === 0) {
            leaves.push(node);
            return;
        }
        for (var i = 0; i < node.child.length; i++) dfs(node.child[i]);
    }
    dfs(root);
    return leaves;
}

// Сборка карты кодов
function buildCodeMap(leaves) {
    var map = {};
    for (var i = 0; i < leaves.length; i++) {
        var leaf = leaves[i];
        map[leaf.str] = leaf.code;
    }
    return map;
}

function encodeString(s, codeMap) {
    var out = [];
    for (var i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        var code = codeMap[c];
        if (typeof code === 'undefined') {
            throw new Error('Нет кода для символа: ' + c);
        }
        out.push(code);
    }
    return out.join('');
}

// Декодирование битовой строки
function decodeBits(bits, root) {
    if (!root) return "";
    var out = [];
    var node = root;
    for (var i = 0; i < bits.length; i++) {
        var b = bits.charAt(i);
        if (b !== '0' && b !== '1') throw new Error('Невалидный бит: ' + b);
        var idx = (b === '0') ? 0 : 1;
        if (!node.child || !node.child[idx]) throw new Error('Декодирование сдохло на позиции: ' + i);
        node = node.child[idx];
        if (!node.child || node.child.length === 0) {
            out.push(node.str);
            node = root;
        }
    }
    return out.join('');
}

// Создание code.csv
function writeCodeCSV(leaves, outPath) {
    var csv = 'char,code\r\n';
    for (var i = 0; i < leaves.length; i++) {
        var ch = leaves[i].str;
        var code = leaves[i].code;
        var chDisplay = '"' + ch.replace(/"/g, '""') + '"';
        csv += chDisplay + ',' + code + '\r\n';
    }
    var ts = fso.CreateTextFile(outPath, true);
    ts.Write(csv);
    ts.Close();
}

// Типа залёт на C++ (Есть main, который не нужен)
(function main() {
    var input = readInputArg();
    if (input.length === 0) {
        WScript.Echo('Входная строка пуста. Чемодан, вокзал, поезд.');
        WScript.Quit(0);
    }

    // Сборка дерева Хафмана
    var root = buildHuffmanTree(input);
    assignCodes(root);

    // Сборка листиков и карты кодов
    var leaves = gatherLeaves(root);
    var codeMap = buildCodeMap(leaves);

    // Кодирование
    var encoded = encodeString(input, codeMap);

    // Создание code.csv    
    var scriptPath = WScript.ScriptFullName;
    var scriptFolder = scriptPath.substring(0, scriptPath.lastIndexOf('\\') + 1);
    var csvPath = scriptFolder + 'code.csv';
    writeCodeCSV(leaves, csvPath);

    // Декодирование
    var decoded = decodeBits(encoded, root);

    // Вывод результатов
    WScript.Echo('--- Huffman encoding result ---');
    WScript.Echo('Input: ' + input);
    WScript.Echo('Encoded (01): ' + encoded);
    WScript.Echo('Decoded: ' + decoded);
    WScript.Echo('code.csv written to: ' + csvPath);
})();