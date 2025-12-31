#!/usr/bin/env node
import path from "path";
import readline from "readline";
import fs from "fs";

let file = process.argv.slice(2);

if (!file) {
  console.log("❌ Please provide a file path");
  process.exit(1);
}

console.log(process.argv, process.cwd());
const unWantedFilesExt = [
  ".svg",
  ".lock",
  ".env",
  ".bin",
  ".ico",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".env",
  ".lock",
  ".bin",
  ".ico",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".mp3",
  ".mp4",
  ".webm",
  ".zip",
  ".pdf",
  ".avif",
  ".webp",
];

const unWantedFiles = [
  "package-lock.json",
  ".env",
  "yarn.lock",
  "pnpm-lock.yaml",
  ".DS_Store",
  ".gitignore",
  ".npmrc",
  "README.md",
];

const unWantedFolders = [
  "node_modules",
  "cache",
  ".git",
  ".github",
  "dist",
  "build",
  "out",
  ".vscode",
  "coverage",
  ".idea",
  "log",
  "logs",
];

async function* iterateFiles(p: string): AsyncGenerator<string> {
  const stat = fs.statSync(p);
  if (stat.isFile()) {
    if (unWantedFilesExt.includes(path.extname(p))) return;
    if (unWantedFiles.includes(path.basename(p).toLocaleLowerCase())) return;
    yield p; // already absolute
  } else if (stat.isDirectory()) {
    if (unWantedFolders.includes(path.basename(p).toLocaleLowerCase())) return;

    const entries = fs.readdirSync(p);

    for (const entry of entries) {
      const fullPath = path.join(p, entry);
      if (
        fs.statSync(fullPath).isDirectory() &&
        unWantedFolders.includes(entry.toLocaleLowerCase())
      )
        continue;

      yield* iterateFiles(path.join(p, entry)); // recursive
    }
  }
}

async function counterLines(filePath: string): Promise<number> {
  try {
    const readSteam = fs.createReadStream(filePath);
    const lines = readline.createInterface({
      crlfDelay: Infinity,
      input: readSteam,
    });
    let totaLines = 0;
    for await (const _ of lines) totaLines++;

    return totaLines;
  } catch (error: any) {
    console.error(error.message);
    return 0;
  }
}
async function getLines(files: string[]) {
  let total = 0;
  const st = Date.now();
  for (const fl of files) {
    try {
      for await (const ls of iterateFiles(fl)) {
        const length = await counterLines(ls);
        total += length;
        console.log(`${ls} → ${length} lines`);
      }
    } catch (error: any) {
      console.log("❌ Error:", error.message);
    }
  }

  console.log("\n total: ", total);
  console.log("\n DurationMs: ", Date.now() - st);
}

// Resolve relative to where user ran CLI
const files = file.map((fl) => path.resolve(process.cwd(), fl));
getLines(files);
