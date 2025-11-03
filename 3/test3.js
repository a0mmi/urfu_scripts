import { test3path } from './config.js';
import { readFile, nowUs, median, saveResults } from './utils.js';
import { search } from './search.js';


console.log('Running Test 3...');

const text1 = 'a'.repeat(100) + 'b';
const text2 = 'b' + 'a'.repeat(100);
const pattern1 = 'a'.repeat(100) + 'b';
const pattern2 = 'b' + 'a'.repeat(100);

const tests = [
{ text: text1, pattern: pattern1, name: 'a^100b' },
{ text: text2, pattern: pattern2, name: 'ba^100' }
];

const results = [];
const methods = ['brute', 'sum', 'sumsq', 'poly'];

for (const { text, pattern, name } of tests) {
    for (const method of methods) {
        const times = [];
        let finalResult = null;
        
        for (let j = 0; j < 100; j++) {
            const start = nowUs(); // Микросекунды (поменял с миллисекунд)
            finalResult = search(text, pattern, method);
            times.push(nowUs() - start);
        }
        
        results.push({
        test: 'test3',
        file_source: name,
        pattern_name: name,
        pattern: `"${pattern}"`,
        method,
        time_us: median(times).toFixed(2),
        matches_count: finalResult.matches_count,
        false_positive_collisions: finalResult.falsePositives,
        text_length: text.length,
        pattern_length: pattern.length,
        });
    }
}

saveResults(test3path, results);