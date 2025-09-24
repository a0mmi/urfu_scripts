export function isDouble(s) {
    if (typeof s !== 'string') return false;
    const regex = /^[-+]?\d+(\.\d+)?$/;
    return regex.test(s);
}