// app.js
// Usage:
//   cscript //nologo app.js <input_file> [ -v ] <pattern1> [pattern2 ...]
// Examples:
//   cscript //nologo app.js input.txt ana ban na
//   cscript //nologo app.js input.txt -v ana ban na

function AhoCorasick(patterns, verbose) {
    this.patterns = patterns.slice(0);
    this.patLen = [];
    for (var i = 0; i < this.patterns.length; i++) this.patLen[i] = this.patterns[i].length;

    this.nodes = [];

    this._newNode = function () {
        var node = { next: {}, link: 0, out: [] };
        this.nodes.push(node);
        return this.nodes.length - 1;
    };

    this._newNode();

    this.buildTrie = function () {
        for (var pid = 0; pid < this.patterns.length; pid++) {
            var p = this.patterns[pid];
            var cur = 0;
            for (var j = 0; j < p.length; j++) {
                var ch = p.charAt(j);
                if (this.nodes[cur].next[ch] === undefined) {
                    var idx = this._newNode();
                    this.nodes[cur].next[ch] = idx;
                }
                cur = this.nodes[cur].next[ch];
            }
            this.nodes[cur].out.push(pid);
        }
    };

    this.buildLinks = function () {
        var queue = [];
        // init: children of root
        for (var ch in this.nodes[0].next) {
            var v = this.nodes[0].next[ch];
            this.nodes[v].link = 0;
            queue.push(v);
        }

        while (queue.length > 0) {
            var v = queue.shift();
            var nodeV = this.nodes[v];
            for (var chKey in nodeV.next) {
                var u = nodeV.next[chKey];
                var f = nodeV.link;
                while (f !== 0 && this.nodes[f].next[chKey] === undefined) {
                    f = this.nodes[f].link;
                }
                if (this.nodes[f].next[chKey] !== undefined) {
                    this.nodes[u].link = this.nodes[f].next[chKey];
                } else {
                    this.nodes[u].link = 0;
                }
                // inherit outputs
                var linkOut = this.nodes[this.nodes[u].link].out;
                for (var t = 0; t < linkOut.length; t++) {
                    this.nodes[u].out.push(linkOut[t]);
                }
                queue.push(u);
            }
        }
    };

    this.build = function () {
        this.buildTrie();
        this.buildLinks();
    };

    // pretty print automaton
    this.printAutomaton = function () {
        WScript.Echo("Automaton: (nodes = " + this.nodes.length + ")");
        for (var i = 0; i < this.nodes.length; i++) {
            var n = this.nodes[i];
            var outNames = [];
            for (var oi = 0; oi < n.out.length; oi++) {
                var pid = n.out[oi];
                outNames.push('"' + this.patterns[pid] + '"');
            }
            var nxt = [];
            for (var c in n.next) {
                nxt.push("'" + c + "':" + n.next[c]);
            }
            WScript.Echo("node " + i + "  next={" + nxt.join(", ") + "}  link=" + n.link + "  out=[" + outNames.join(", ") + "]");
        }
    };

    this.search = function (text, verboseSteps) {
        var results = [];
        for (var i = 0; i < this.patterns.length; i++) results[i] = [];

        var cur = 0;
        for (var pos = 0; pos < text.length; pos++) {
            var ch = text.charAt(pos);
            var before = cur;
            while (cur !== 0 && this.nodes[cur].next[ch] === undefined) {
                cur = this.nodes[cur].link;
                if (verboseSteps) WScript.Echo("  fallback -> state " + cur);
            }
            if (this.nodes[cur].next[ch] !== undefined) {
                cur = this.nodes[cur].next[ch];
            } else {
                cur = 0;
            }
            if (verboseSteps) WScript.Echo("pos " + (pos + 1) + " char '" + ch + "': " + before + " -> " + cur);
            if (this.nodes[cur].out.length > 0) {
                for (var k = 0; k < this.nodes[cur].out.length; k++) {
                    var pid = this.nodes[cur].out[k];
                    var startPos = pos - this.patLen[pid] + 2; // 1-based
                    results[pid].push(startPos);
                    if (verboseSteps) {
                        WScript.Echo(
                            "   MATCH pattern[" + pid + "]='" +
                            this.patterns[pid] + "' at pos " + startPos
                        );
                    }
                }
            }
        }
        return results;
    };
}

(function main() {
    var rawArgs = [];
    var verbose = false;
    var args = WScript.Arguments;

    if (args.length === 0) {
        WScript.Echo("Usage:");
        WScript.Echo("  cscript //nologo app.js <input_file> [ -v ] <pattern1> [pattern2 ...]");
        WScript.Echo("Example:");
        WScript.Echo("  cscript //nologo app.js input.txt -v ana ban na");
        WScript.Quit(1);
    }

    for (var i = 0; i < args.length; i++) {
        var a = args.Item(i);
        if (a === "-v" || a === "/v") {
            verbose = true;
        } else {
            rawArgs.push(a);
        }
    }

    if (rawArgs.length < 2) {
        WScript.Echo("Error: input file and at least one pattern are required.");
        WScript.Echo("Usage: cscript //nologo app.js <input_file> [ -v ] <pattern1> [pattern2 ...]");
        WScript.Quit(1);
    }

    var filePath = rawArgs[0];
    var patterns = [];
    for (var j = 1; j < rawArgs.length; j++) patterns.push(rawArgs[j]);

    var fso = new ActiveXObject("Scripting.FileSystemObject");
    if (!fso.FileExists(filePath)) {
        WScript.Echo("File not found: " + filePath);
        WScript.Quit(1);
    }

    var file = fso.OpenTextFile(filePath, 1);
    var text = file.ReadAll();
    file.Close();

    if (text.length === 0) {
        WScript.Echo("File is empty.");
        WScript.Quit(0);
    }

    WScript.Echo("Patterns: " + patterns.join(", "));
    var ac = new AhoCorasick(patterns, verbose);
    ac.build();

    if (verbose) {
        WScript.Echo("=== Automaton table ===");
        ac.printAutomaton();
        WScript.Echo("=== Search (step by step) ===");
    }

    var results = ac.search(text, verbose);

    WScript.Echo("=== Results ===");
    var totalMatches = 0;
    for (var pid = 0; pid < patterns.length; pid++) {
        var arr = results[pid];
        totalMatches += arr.length;
        if (arr.length === 0) {
            WScript.Echo('Pattern "' + patterns[pid] + '": no matches');
        } else {
            WScript.Echo(
                'Pattern "' + patterns[pid] +
                '": ' + arr.length +
                ' matches; positions: ' + arr.join(", ")
            );
        }
    }
    WScript.Echo("Total matches: " + totalMatches);
})();
