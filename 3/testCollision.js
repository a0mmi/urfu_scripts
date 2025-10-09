// test5.js
import fs from "fs";
import { readFile, nowMs } from "./utils.js";
import { files, pattern1, pattern2, pattern3, kinds } from "./config.js";
import { searchByHashWithCollisions } from "./searchers.js";

const resultsDir = "3/results";

const patterns = [
  { name: pattern1, str: pattern1 },
  { name: pattern2, str: pattern2 },
  { name: pattern3, str: pattern3 }
];

const header = "file,pattern,kind,m,total_hash_hits,true_matches,collisions,time_s";
const lines = [header];

for (const file of files) {
  const s = readFile(file);
  console.log(`Processing file: ${file} (length ${s.length})`);
  for (const p of patterns) {
    for (const kind of kinds) {
      const t0 = nowMs();
      const stat = searchByHashWithCollisions(s, p.str, kind);
      const t1 = nowMs();
      const time_s = ((t1 - t0) / 1000).toFixed(6);

      const m = p.str.length;
      const { total_hash_hits, true_matches, collisions } = stat;

      const patternSafe = p.name.replace(/,/g, " ");
      const line = `${file},${patternSafe},${kind},${m},${total_hash_hits},${true_matches},${collisions},${time_s}`;
      lines.push(line);

      console.log(`  pattern="${patternSafe}" kind=${kind} hits=${total_hash_hits} true=${true_matches} coll=${collisions} time=${time_s}s`);
    }
  }
}

const outPath = `${resultsDir}/testCollisions_results.csv`;
fs.writeFileSync(outPath, lines.join("\n"));
console.log(`Wrote ${outPath}`);
