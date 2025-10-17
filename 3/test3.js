import { bruteSearch } from "./brute.js";
import { searchByHash } from "./searchers.js";
import { nowMs } from "./utils.js";
import fs from "fs";
import { kinds } from "./config.js";

function mean(arr) {
  return arr.reduce((a,b)=>a+b,0)/arr.length;
}
function stddev(arr) {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s,x)=>s+(x-m)**2,0)/(arr.length-1));
}

const n = 1_000_000;
const text = "a".repeat(n);
const patterns = [
  {name: "a^100", s: "a".repeat(100)},
  {name: "a^50+b+a^49", s: "a".repeat(50) + "b" + "a".repeat(49)},
  {name: "(ab)^50", s: ("ab").repeat(50)}
];

const runs = 5;
const rows = [];
for (const pat of patterns) {
  // brute
  const timesBrute = [];
  for (let r=0;r<runs;r++) {
    const t0 = nowMs();
    bruteSearch(text, pat.s);
    const t1 = nowMs();
    timesBrute.push((t1-t0)/1000);
  }
  rows.push({
    method: "brute",
    pattern: pat.name,
    m: pat.s.length,
    times: timesBrute,
    mean: mean(timesBrute),
    stddev: stddev(timesBrute)
  });

  for (const kind of kinds) {
    const timesH = [];
    for (let r=0;r<runs;r++) {
      const t0 = nowMs();
      searchByHash(text, pat.s, kind);
      const t1 = nowMs();
      timesH.push((t1 - t0) / 1000);
    }
    rows.push({
      method: `hash(${kind})`,
      pattern: pat.name,
      m: pat.s.length,
      times: timesH,
      mean: mean(timesH),
      stddev: stddev(timesH)
    });
  }
}

const header = "method, pattern, m, run1_s, run2_s, run3_s, run4_s, run5_s, mean_s, stddev_s";
const lines = [header];
for (const r of rows) {
  lines.push(`${r.method},${r.pattern},${r.m},${r.times.map(x => x.toFixed(6)).join(",")},${r.mean.toFixed(6)},${r.stddev.toFixed(6)}`);
}
fs.writeFileSync("3/results/test3_results.csv", lines.join("\n"));
console.log("Wrote test3_results.csv");
