import fs from 'node:fs';

export function writeJsonReport(summary, outPath) {
  fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
  return outPath;
}
