import { isDouble } from "./utilities.js";
import { functions, ARITY } from './functions.js';


export class Program {
    mem = [];
    ip = 0;
    labels = {};

    constructor(s) {
        this.s = s;
    } 

    programProcessing() {
        const lines = this.s.split(/\r?\n/);
        for (const rawLine of lines) {
            const line = rawLine.split('#')[0].trim();
            if (line === '') continue;
            const tokens = line.split(/\s+/).filter(t => t !== '');
            for (const t of tokens) {
                if (t.endsWith(':')) {
                    const name = t.slice(0, -1);
                    if (name in this.labels) throw new Error(`Метка ${name} уже определена`);
                    this.labels[name] = this.mem.length;
                } else {
                    if (isDouble(t)) {
                        this.mem.push(parseFloat(t));
                    } else {
                        this.mem.push(t);
                    }
                }
            }
        }

        console.log("Метки:", this.labels);
        console.log("Память:", this.mem);
        return true;
    }

    _findStart() {
        if (this.labels["start"] !== undefined) return this.labels["start"];
        for (let i = 0; i < this.mem.length; i++) {
            if (typeof this.mem[i] === 'string') return i;
        }
        return -1;
    }

    _readRawArgs(count) {
        const args = [];
        for (let k = 1; k <= count; k++) {
            const pos = this.ip + k;
            if (pos >= this.mem.length) throw new Error(`Команда на ip=${this.ip} ожидает ${count} аргументов, но их нет`);
            args.push(this.mem[pos]);
        }
        return args;
    }

    _resolveArgs(args) {
        return args.map(a => {
            if (typeof a === 'string') {
                if (this.labels[a] !== undefined) return this.labels[a];
                throw new Error(`Неразрешимый аргумент '${a}' у команды на ip=${this.ip}`);
            }
            return a;
        });
    }

    programExecution() {
        const start = this._findStart();
        if (start === -1) throw new Error("В программе не найдено команд для выполнения (нет строковых токенов).");
        this.ip = start;

        while (this.ip < this.mem.length) {
            const cmd = this.mem[this.ip];
            if (typeof cmd !== 'string') {
                throw new Error(`IP указывает на операнд: ${this.mem[this.ip]} по адресу ${this.ip}.`);
            }

            if (!functions[cmd]) {
                throw new Error(`Неизвестная команда: ${cmd} на ip=${this.ip}`);
            }

            const arity = ARITY[cmd];
            if (arity === undefined) throw new Error(`Неизвестная arity для команды: ${cmd}`);

            const rawArgs = this._readRawArgs(arity);
            const args = this._resolveArgs(rawArgs);

            const result = functions[cmd](this.ip, this.mem, ...args);

            if (result === false) break;
            if (typeof result === 'number') {
                this.ip = result;
                continue;
            }

            this.ip = this.ip + 1 + arity;
        }
    }
}
