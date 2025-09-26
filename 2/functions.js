import readlineSync from 'readline-sync';


export function set(ip, mem, address, value) {
    mem[address] = value;
    return true;
}

export function add(ip, mem, dest, src) {
    mem[dest] = (mem[dest] || 0) + (mem[src] || 0);
    return true;
}

export function sub(ip, mem, dest, src) {
    mem[dest] = (mem[dest] || 0) - (mem[src] || 0);
    return true;
}

export function mov(ip, mem, dest, src) {
    mem[dest] = mem[src];
    return true;
}

export function mul(ip, mem, dest, src) {
    mem[dest] = (mem[dest] || 0) * (mem[src] || 0);
    return true;
}

export function mod(ip, mem, a, b, out) {
    const aval = mem[a] || 0;
    const bval = mem[b] || 0;
    if (bval === 0) throw new Error(`Division by zero in mod at ip=${ip}`);
    mem[out] = aval % bval;
    return true;
}

export function output(ip, mem, address) {
    console.log(mem[address]);
    return true;
}

export function input(ip, mem, address) {
    let num;
    while (true) {
        const userInput = readlineSync.question('input: ');
        const trimmed = userInput.trim();
        if (trimmed === '') continue;
        num = parseFloat(trimmed);
        if (!isNaN(num)) break;
    }
    mem[address] = num;
    return true;
}

export function jmp(ip, mem, target) {
    return target;
}

export function jnz(ip, mem, addr, target) {
    const v = mem[addr] || 0;
    if (v !== 0) return target;
    return true;
}

export function jz(ip, mem, addr, target) {
    const v = mem[addr] || 0;
    if (v === 0) return target;
    return true;
}

export const functions = {
    set, add, sub, mov, mul, mod, output, input, jmp, jnz, jz
};

export const ARITY = {
    "set": 2,
    "add": 2,
    "sub": 2,
    "mov": 2,
    "mul": 2,
    "mod": 3,
    "output": 1,
    "input": 1,
    "jmp": 1,
    "jnz": 2,
    "jz": 2
};
