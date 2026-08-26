#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

const [inputPath, outputPath] = process.argv.slice(2);

if (!inputPath || !outputPath) {
  console.error("用法: node scripts/sanitize-canvas-export.mjs <输入.json> <输出.safe.json>");
  process.exit(2);
}

const blockedKey = /(api[-_ ]?key|access[-_ ]?token|refresh[-_ ]?token|connect[-_ ]?token|authorization|password|passwd|secret|credential|cookie|session)/i;
const blockedValue = /bearer\s+[a-z0-9._~+/=-]+/i;
let removed = [];
let suspicious = [];

function sanitize(value, path = "$", key = "") {
  if (Array.isArray(value)) return value.map((item, index) => sanitize(item, `${path}[${index}]`));
  if (value && typeof value === "object") {
    const result = {};
    for (const [childKey, childValue] of Object.entries(value)) {
      const childPath = `${path}.${childKey}`;
      if (blockedKey.test(childKey)) {
        removed.push(childPath);
        continue;
      }
      result[childKey] = sanitize(childValue, childPath, childKey);
    }
    return result;
  }
  if (typeof value === "string" && blockedValue.test(value)) {
    suspicious.push(path);
    return "[REMOVED_BEARER_TOKEN]";
  }
  return value;
}

const source = JSON.parse(await readFile(inputPath, "utf8"));
const clean = sanitize(source);
await writeFile(outputPath, `${JSON.stringify(clean, null, 2)}\n`, "utf8");

console.log(`已写入: ${outputPath}`);
console.log(`移除敏感字段: ${removed.length}`);
if (removed.length) console.log(removed.join("\n"));
if (suspicious.length) {
  console.warn(`发现并替换 Bearer token: ${suspicious.length}`);
  console.warn(suspicious.join("\n"));
}
console.warn("请人工检查图片、私人提示词和其他个人信息后再提交。");
