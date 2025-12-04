import { die } from './utils.js'

const prec = { '^': 4, '*': 3, '/': 3, '+': 2, '-': 2 };
const assoc = { '^': 'right', '*': 'left', '/': 'left', '+': 'left', '-': 'left' };

export function infixToRPN(tokens) {
  const out = [];
  const ops = [];

  for (let idx = 0; idx < tokens.length; idx++) {
    const t = tokens[idx];
    if (t.type === 'number' || t.type === 'ident') {
      out.push(t);
      continue;
    }

    if (t.type === 'op') {
      const v = t.value;
      if (v === '(') {
        ops.push(v);
        continue;
      }
      
      if (v === ')') {
        while (ops.length && ops[ops.length - 1] !== '(') {
          out.push({ type: 'op', value: ops.pop() });
        }
        if (!ops.length) die('Mismatched parentheses');
        ops.pop(); // remove '('
        continue;
      }

      // Handle operator
      while (ops.length) {
        const top = ops[ops.length - 1];
        if (top === '(') break;
        
        const topPrec = prec[top] || 0;
        const currPrec = prec[v] || 0;

        if (
          (assoc[v] === 'left' && currPrec <= topPrec) ||
          (assoc[v] === 'right' && currPrec < topPrec)
        ) {
          out.push({ type: 'op', value: ops.pop() });
        } else {
          break;
        }
      }
      ops.push(v);
    }
  }

  while (ops.length) {
    const t = ops.pop();
    if (t === '(' || t === ')') die('Mismatched parentheses');
    out.push({ type: 'op', value: t });
  }

  return out;
}

export function evalRPN(rpn, vars) {
  const st = [];
  for (const tok of rpn) {
    if (tok.type === 'number') {
      st.push(Number(tok.value));
      continue;
    }
    
    if (tok.type === 'ident') {
      if (!(tok.value in vars)) die(`Variable "${tok.value}" not provided`);
      st.push(Number(vars[tok.value]));
      continue;
    }
    
    if (tok.type === 'op') {
      if (st.length < 2) die(`Not enough operands for operator ${tok.value}`);
      const b = st.pop();
      const a = st.pop();
      
      switch (tok.value) {
        case '+': st.push(a + b); break;
        case '-': st.push(a - b); break;
        case '*': st.push(a * b); break;
        case '/': 
          if (Math.abs(b) < 1e-12) die('Division by zero');
          st.push(a / b);
          break;
        case '^':
          if (a === 0 && b < 0) die('Cannot raise zero to a negative power');
          if (a < 0 && !Number.isInteger(b)) die('Cannot raise negative number to a non-integer power');
          st.push(Math.pow(a, b));
          break;
        default: die('Unknown operator: ' + tok.value);
      }
    }
  }
  
  if (st.length !== 1) die('Invalid expression evaluation (stack size != 1)');
  return st[0];
}

export function rpnToString(rpn) {
  return rpn.map(t => t.value).join(' ');
}