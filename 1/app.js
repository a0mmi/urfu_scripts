import {readFileSync, writeFileSync} from 'node:fs';
import {RLE} from './RLE.js'


// laatin1 - 8битная ASCII иль расширеная
function readFile(path) {
    try {
        const data = readFileSync(path, 'latin1');
        return data;
    } catch (err) {
        return err;
    }
}

function writeFile(path, content) {
    try {
        writeFileSync(path, content, 'latin1');
        return true;
    } catch (err) {
        return err;
    }
}


let path = "1\\Cn.txt"
let pathEnESC = "1\\out.txt"
let pathDeESC = "1\\out1.txt"
let pathEnJump = "1\\out2.txt"
let pathDeJump = "1\\out3.txt"

let s = readFile(path)
const rle = new RLE(s, '#')

let seens = rle.encodeESC()
console.log(writeFile(pathEnESC, seens))
console.log(writeFile(pathDeESC, rle.decodeESC(seens)))

let sejump = rle.encodeJump(s)
console.log(writeFile(pathEnJump, sejump))
console.log(writeFile(pathDeJump, rle.decodeJump(sejump)))
 