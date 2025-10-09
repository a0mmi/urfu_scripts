import { readFile } from "./utils.js";
import { bruteSearch } from "./brute.js";
import { files } from "./config.js";
import { nowMs } from "./utils.js";
import fs from "fs";

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stddev(arr) {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, x) => s + (x - m)**2, 0) / (arr.length - 1));
}

const pattern = "князь Андрей";
const runs = 5;
const out = [];
for (const file of files.slice(0,5)) {
  const s = readFile(file);
  const n = s.length;
  const times = [];
  for (let r = 0; r < runs; r++) {
    const t0 = nowMs();
    bruteSearch(s, pattern);
    const t1 = nowMs();
    times.push((t1 - t0) / 1000); // seconds
  }
  out.push({
    file,
    length: n,
    times,
    mean: mean(times),
    stddev: stddev(times)
  });
}

const csvLines = ["file, length, run1_s, run2_s, run3_s, run4_s, run5_s, mean_s, stddev_s"];
for (const row of out) {
  csvLines.push(
    `${row.file},${row.length},${row.times.map(x=>x.toFixed(6)).join(",")},${row.mean.toFixed(6)},${row.stddev.toFixed(6)}`
  );
}
fs.writeFileSync("3/results/test1_results.csv", csvLines.join("\n"));
console.log("Wrote test1_results.csv");
