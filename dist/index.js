#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
const fs_1 = __importDefault(require("fs"));
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
async function* iterateFiles(p) {
    const stat = fs_1.default.statSync(p);
    if (stat.isFile()) {
        if (unWantedFilesExt.includes(path_1.default.extname(p)))
            return;
        if (unWantedFiles.includes(path_1.default.basename(p).toLocaleLowerCase()))
            return;
        yield p; // already absolute
    }
    else if (stat.isDirectory()) {
        if (unWantedFolders.includes(path_1.default.basename(p).toLocaleLowerCase()))
            return;
        const entries = fs_1.default.readdirSync(p);
        for (const entry of entries) {
            const fullPath = path_1.default.join(p, entry);
            if (fs_1.default.statSync(fullPath).isDirectory() &&
                unWantedFolders.includes(entry.toLocaleLowerCase()))
                continue;
            yield* iterateFiles(path_1.default.join(p, entry)); // recursive
        }
    }
}
async function counterLines(filePath) {
    try {
        const readSteam = fs_1.default.createReadStream(filePath);
        const lines = readline_1.default.createInterface({
            crlfDelay: Infinity,
            input: readSteam,
        });
        let totaLines = 0;
        for await (const _ of lines)
            totaLines++;
        return totaLines;
    }
    catch (error) {
        console.error(error.message);
        return 0;
    }
}
async function getLines(files) {
    let total = 0;
    const st = Date.now();
    for (const fl of files) {
        try {
            for await (const ls of iterateFiles(fl)) {
                const length = await counterLines(ls);
                total += length;
                console.log(`${ls} → ${length} lines`);
            }
        }
        catch (error) {
            console.log("❌ Error:", error.message);
        }
        console.log("\n total: ", total);
        console.log("\n DurationMs: ", Date.now() - st);
    }
}
// Resolve relative to where user ran CLI
const files = file.map((fl) => path_1.default.resolve(process.cwd(), fl));
getLines(files);
//# sourceMappingURL=index.js.map