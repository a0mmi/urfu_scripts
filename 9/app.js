import fs from 'fs';
import { infixToRPN, evalRPN, rpnToString } from './rpn.js';
import { preprocessText, parseAssignments, tokenize } from './utils.js';

export function die(msg, code = 1) {
  console.error('Error:', msg);
  process.exit(code);
}

function parseArg(argv) {
  if (argv.length < 3) die('Usage: node rpn.js @file:input.txt   (or node rpn.js input.txt)');
  const raw = argv[2];
  return raw.startsWith('@file:') ? raw.slice(6) : raw;
}

function readInputFile(filename) {
  if (!filename) die('Empty filename provided');
  if (!fs.existsSync(filename)) die('File not found: ' + filename);
  const txt = fs.readFileSync(filename, 'utf8');
  if (!txt) die('Empty input file');
  return txt;
}

function main(argv) {
  const filename = parseArg(argv);
  const raw = readInputFile(filename);
  const lines = preprocessText(raw);
  const exprLine = lines[0];
  const vars = parseAssignments(lines);

  const tokens = tokenize(exprLine);
  const rpn = infixToRPN(tokens);
  const result = evalRPN(rpn, vars);

  console.log('Infix:   ', exprLine);
  console.log('Postfix: ', rpnToString(rpn));
  console.log('Result:  ', result);
}

main(process.argv);