import fs from 'fs';
import { fromString } from './entropy.js';
import { formatTable } from './utils.js';

function printUsage() {
  console.log('Использование:');
  console.log('node src/index.js "abrakadabra"');
  console.log('node src/index.js @file:input.txt');
  console.log('Опции: --lower   --no-spaces');
}

const rawArg = process.argv[2];
if (!rawArg) {
  printUsage();
  process.exit(0);
}

const flags = new Set(process.argv.slice(3));
let input = '';

if (rawArg.startsWith('@file:')) {
  const p = rawArg.slice(6);
  if (!fs.existsSync(p)) {
    console.error('Файл не найден:', p);
    process.exit(2);
  }
  input = fs.readFileSync(p, 'utf8');
} else {
  input = rawArg;
}

if (flags.has('--lower')) input = input.toLowerCase();
if (flags.has('--no-spaces')) input = input.replace(/\s+/g, '');
input = input.replace(/\r?\n/g, '');

const result = fromString(input);

console.log('\n--- Результат расчёта энтропии Шеннона ---\n');
console.log('Длина строки (L):', result.L);
console.log('Размер алфавита (n):', result.n);
console.log('\nТаблица символов:');
console.log(formatTable(result.freqs));
console.log('\nЭнтропия (основание log = n):', result.H.toFixed(9));
console.log('\n(Если n=1 — энтропия равна 0)\n');
