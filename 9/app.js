
// (числа, идентификаторы, операторы)
function tokenize(str) {
    var tokens = [];
    var i = 0;
    while (i < str.length) {
        var ch = str.charAt(i);
        if (/\s/.test(ch)) { i++; continue; }
        // число+десятые
        if (/[0-9.]/.test(ch)) {
            var j = i;
            while (j < str.length && /[0-9.]/.test(str.charAt(j))) j++;
            var num = str.substring(i, j);
            tokens.push({type: "number", value: num});
            i = j;
            continue;
        }
        // переменные
        if (/[A-Za-z_]/.test(ch)) {
            var j = i;
            while (j < str.length && /[A-Za-z0-9_]/.test(str.charAt(j))) j++;
            tokens.push({type: "ident", value: str.substring(i, j)});
            i = j;
            continue;
        }
        // оператор или скобка
        if ("+-*/^()".indexOf(ch) >= 0) {
            tokens.push({type: "op", value: ch});
            i++;
            continue;
        }
        i++;
    }
    return tokens;
}
// [
//   {type:"op", value:"("},
//   {type:"ident", value:"a"},
//   {type:"op", value:"+"},
//   {type:"ident", value:"b"},
//   {type:"op", value:")"},
//   {type:"op", value:"*"},
//   {type:"number", value:"2"}
// ]

// Shunting yard
function infixToRPN(tokens) {
    var prec = {'^':4,'*':3,'/':3,'+':2,'-':2};
    var assoc = {'^':"right",'+' :"left",'-':"left",'*':"left",'/' :"left"};
    var out = [];
    var ops = [];
    for (var i = 0; i < tokens.length; i++) {
        var t = tokens[i];
        if (t.type === "number" || t.type === "ident") {
            out.push(t);
            continue;
        }
        if (t.value === "(") {
            ops.push(t.value);
            continue;
        }
        if (t.value === ")") {
            while (ops.length && ops[ops.length-1] !== "(") {
                out.push({type: "op", value: ops.pop()});
            }
            if (!ops.length) {
                throw new Error("Unmatched closing parenthesis at position " + t.pos); // Не нашли закрывающеюся скобку
            }
            ops.pop(); // del "("
            continue;
        }
        // оператор + - * / ^
        while (ops.length) {
            var top = ops[ops.length - 1];
            if (top === "(") break;
            var topPrec = prec[top] || 0;
            var currPrec = prec[t.value] || 0;
            if ((assoc[t.value] === "left"  && currPrec <= topPrec) ||
                (assoc[t.value] === "right" && currPrec <  topPrec)) {
                out.push({type: "op", value: ops.pop()});
                // Для лево-ассоциативных операторов (например -, *): 
                // если текущий оператор имеет приоритет меньше или равный
                // приоритету верхнего оператора в стеке — то верхний должен быть сначала
                // вынесен в выход (поскольку у него не меньше приоритет и он должен выполняться раньше).

                // Для право-ассоциативных операторов (^): если текущий оператор имеет
                // приоритет строго меньше приоритета верхнего, то верхний вытесняется;
                // если равен — не вытесняется.
            } else {
                break;
            }
        }
        ops.push(t.value);
    }
    // выталкиваем оставшиеся операторы
    while (ops.length) {
        var top = ops.pop();
        if (top === "(") throw new Error("Unmatched opening parenthesis"); // Ошибка на скобках
        out.push({type: "op", value: top});
    }
    return out;
}

// Вычисление RPN-выражения с учётом значений переменных
function evalRPN(rpn, vars) {
    var st = [];
    for (var i = 0; i < rpn.length; i++) {
        var tok = rpn[i];
        if (tok.type === "number") {
            st.push(parseFloat(tok.value));
        }
        else if (tok.type === "ident") {
            st.push(vars[tok.value]);
        }
        else { // оператор
            var b = st.pop();
            var a = st.pop();
            /* Сначала берётся b, потом a. Это нужно для правильной семантики бинарных операторов:
            в RPN выражение a b - означает a - b.
            */
            switch (tok.value) {
                case "+": st.push(a + b); break;
                case "-": st.push(a - b); break;
                case "*": st.push(a * b); break;
                case "/": 
                    if (b === 0) {
                        throw new Error("Division by zero");
                    }
                    st.push(a / b);
                    break;
                case "^": st.push(Math.pow(a, b)); break;
            }
        }
    }
    return st[0];
}

// Помощь для печати RPN-массива как строки
function rpnToString(rpn) {
    var parts = [];
    for (var i = 0; i < rpn.length; i++) {
        parts.push(rpn[i].value);
    }
    return parts.join(" ");
}

// main
(function main() {
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var args = WScript.Arguments;
    if (args.Length < 1) {
        WScript.Echo("Использование: cscript script.js <имя_файла>");
        WScript.Quit(1);
    }
    var file = fso.OpenTextFile(args(0), 1);
    var content = file.ReadAll();
    file.Close();

    var rawLines = content.split("\n");
    var lines = [];
    for (var i = 0; i < rawLines.length; i++) {
        var line = rawLines[i].replace(/^\s+|\s+$/g, "");
        if (line !== "") lines.push(line);
    }

    var expr = lines[0];

    var vars = {};
    for (var i = 1; i < lines.length; i++) {
        var parts = lines[i].replace(/['"]/g, "").split(/\s+/);
        var name = parts[0];
        var value = parseFloat(parts.slice(1).join(" "));
        vars[name] = value;
    }

    var tokens = tokenize(expr);
    var rpn = infixToRPN(tokens);
    var result = evalRPN(rpn, vars);

    WScript.Echo("Infix:   " + expr);
    WScript.Echo("Postfix: " + rpnToString(rpn));
    WScript.Echo("Result:  " + result);
})();