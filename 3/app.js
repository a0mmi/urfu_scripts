import { readFileSync } from 'node:fs';
import { Program } from './program.js';


function readFile(path) {
    try {
        const data = readFileSync(path, 'utf-8');
        return data;
    } catch (err) {
        console.error(`ERROR: ${err.message}`);
        process.exit(1);
    }
}

const path = process.argv[2];

console.log(`Выполнение программы: "${path}"`);
const programCode = readFile(path);
const prg = new Program(programCode);

if (prg.programProcessing()) {
    try {
        prg.programExecution();
    } catch (e) {
        console.error("ERROR:", e.message);
        process.exit(1);
    }
}
