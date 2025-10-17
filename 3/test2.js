import { readFile } from "./utils.js";
import { bruteSearch } from "./brute.js";
import { nowMs } from "./utils.js";
import fs from "fs";
import { files, pattern1, pattern2, pattern3 } from "./config.js";

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function stddev(arr) {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, x) => s + (x - m)**2, 0) / (arr.length - 1));
}

const text = readFile(files[4]); // all.txt
const runs = 5;
const patterns = [pattern1, pattern2, pattern3];
const csv = ["pattern, len, run1_s, run2_s, run3_s, run4_s, run5_s, mean_s, stddev_s"];

for (const p of patterns) {
  const times = [];
  for (let r = 0; r < runs; r++) {
    const t0 = nowMs();
    bruteSearch(text, p);
    const t1 = nowMs();
    times.push((t1 - t0) / 1000);
  }
  csv.push(`${p.replace(/,/g," ")} , ${p.length}, ${times.map(x => x.toFixed(6)).join(",")}, ${mean(times).toFixed(6)}, ${stddev(times).toFixed(6)}`);
}

fs.writeFileSync("3/results/test2_results.csv", csv.join("\n"));
console.log("Wrote test2_results.csv");
