import fs from 'fs';
import { CaesarCipher } from './caesar.js';
import { INPUT, ENCODE_OUT, DECODE_OUT, DEFAULT_FREQ } from './config.js';

function readTextSync(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}
function writeTextSync(filePath, text) {
  fs.writeFileSync(filePath, text, 'utf8');
}

function doEncrypt(cipher, plainText, shift, outFile) {
  const cipherText = cipher.encrypt(plainText, shift);
  writeTextSync(outFile, cipherText);
  return cipherText;
}

function doAnalyze(cipher, cipherText, outFile) {
  const best = cipher.analyze(cipherText, { returnAll: false });
  writeTextSync(outFile, best.plaintext);
  return best;
}

function main(argv) {
  const args = argv.slice(2);
  const shiftArg = args[0];

  // parse shift
  let shift = 3;
  if (typeof shiftArg !== 'undefined') {
    const n = Number(shiftArg);
    if (Number.isInteger(n)) shift = ((n % 26) + 26) % 26;
    else console.warn(`Первый аргумент не целое число: ${shiftArg}. Использую shift = ${shift}`);
  }

  // Чтение входного
  let inputText;
  try {
    inputText = readTextSync(INPUT);
  } catch (e) {
    console.error(`Не удалось прочитать ${INPUT}: ${e.message}`);
    process.exit(2);
  }

  // Конструктор с деф частотами
  const cipher = new CaesarCipher({ targetFreqs: DEFAULT_FREQ });

  // шифруем
  try {
    doEncrypt(cipher, inputText, shift, ENCODE_OUT);
    console.log(`Записан ${ENCODE_OUT} (shift=${shift}).`);
  } catch (e) {
    console.error("Ошибка при шифровании:", e.message);
    process.exit(3);
  }

  // Читка зашифрованного
  let encodedFromFile;
  try {
    encodedFromFile = readTextSync(ENCODE_OUT);
  } catch (e) {
    console.error(`Не удалось прочитать ${ENCODE_OUT}: ${e.message}`);
    process.exit(4);
  }

  // анализ/расшифровка
  try {
    const best = doAnalyze(cipher, encodedFromFile, DECODE_OUT);
    console.log(`Расшифровка записана в ${DECODE_OUT}. Лучший shift = ${best.shift}, score = ${best.score.toExponential(6)}`);
  } catch (e) {
    console.error("Ошибка при анализе/расшифровке:", e.message);
    process.exit(5);
  }
}

main(process.argv);
export { main };
