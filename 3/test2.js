import { files, pattern1, pattern2, pattern3, test2path } from './config.js';
import { readFile, nowMs, median, saveResults } from './utils.js';
import { search } from './search.js';

console.log('Running Test 2...');

const patterns = [
{ name: 'pattern1', value: pattern1 },
{ name: 'pattern2', value: pattern2 },
{ name: 'pattern3', value: pattern3 }
];

const results = [];
const methods = ['brute', 'sum', 'sumsq', 'poly'];

// Отдельные тома
for (const file of files) {
    const text = readFile(file);
    const fileSource = file.split('/').pop();

    for (const { name, value } of patterns) {
        for (const method of methods) {
        const times = [];
        let finalResult = null;
        
        for (let j = 0; j < 5; j++) {
            const start = nowMs();
            finalResult = search(text, value, method);
            times.push(nowMs() - start);
        }
        
        results.push({
            test: 'test2',
            file_source: fileSource,
            pattern_name: name,
            pattern: `"${value}"`,
            method,
            time_ms: median(times).toFixed(3),
            matches_count: finalResult.matches_count,
            false_positive_collisions: finalResult.falsePositives,
            text_length: text.length,
            pattern_length: value.length
        });
        }
    }
}

// Все тома вместе
const fullText = files.map(readFile).join('');
for (const { name, value } of patterns) {
    for (const method of methods) {
        const times = [];
        let finalResult = null;
        
        for (let j = 0; j < 5; j++) {
        const start = nowMs();
        finalResult = search(fullText, value, method);
        times.push(nowMs() - start);
        }
        
        results.push({
        test: 'test2',
        file_source: 'tome1-4',
        pattern_name: name,
        pattern: `"${value}"`,
        method,
        time_ms: median(times).toFixed(3),
        matches_count: finalResult.matches_count,
        false_positive_collisions: finalResult.falsePositives,
        text_length: fullText.length,
        pattern_length: value.length
        });
    }
}

saveResults(test2path, results);