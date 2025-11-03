import { files, pattern2, test1path } from './config.js';
import { readFile, nowMs, median, saveResults } from './utils.js';
import { search } from './search.js';


console.log('Running Test 1...');

let text = '';
const results = [];
const methods = ['brute', 'sum', 'sumsq', 'poly'];

for (let i = 0; i < files.length; i++) {
    text += readFile(files[i]);
    const fileSource = `tome1-${i + 1}`;

    for (const method of methods) {
        const times = [];
        let finalResult = null;
        
        for (let j = 0; j < 5; j++) {
        const start = nowMs();
        finalResult = search(text, pattern2, method);
        times.push(nowMs() - start);
        }
        
        results.push({
        test: 'test1',
        file_source: fileSource,
        pattern_name: 'pattern2',
        pattern: `"${pattern2}"`,
        method,
        time_ms: median(times).toFixed(3),
        matches_count: finalResult.matches_count,
        false_positive_collisions: finalResult.falsePositives,
        text_length: text.length,
        pattern_length: pattern2.length
        });
    }
}

saveResults(test1path, results);
