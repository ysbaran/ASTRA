#!/usr/bin/env node
/**
 * Tests the deployable build (node build.js --site): the files exist, the page links to
 * them, and nothing needs inline script, which is what lets the server send a strict CSP.
 */
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const { execFileSync } = require("child_process");

const root = path.join(__dirname, "..");
execFileSync(process.execPath, [path.join(root, "build.js"), "--site"], { cwd: root, stdio: "pipe" });

const site = path.join(root, "dist", "site");
const html = fs.readFileSync(path.join(site, "index.html"), "utf8");
const tests = [];
const test = (name, body) => tests.push([name, body]);

const localRefs = () => [...html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)].map((m) => m[1]);

test("index.html links to one script and one stylesheet, both with content hashes", () => {
  const refs = localRefs();
  assert(refs.some((r) => /^assets\/app\.[0-9a-f]{10}\.js$/.test(r)), "hashed script link missing");
  assert(refs.some((r) => /^assets\/styles\.[0-9a-f]{10}\.css$/.test(r)), "hashed stylesheet link missing");
});

test("every linked asset exists and is not empty", () => {
  localRefs().forEach((ref) => assert(fs.statSync(path.join(site, ref)).size > 1000, `${ref} is missing or tiny`));
});

test("the page has no inline script and no inline event handlers", () => {
  assert(!/<script(?![^>]*\ssrc=)[^>]*>/i.test(html), "found an inline <script>");
  assert(!/\son[a-z]+\s*=/i.test(html), "found an inline event handler");
});

test("the script file contains the whole app and is wrapped in a closure", () => {
  const file = localRefs().find((r) => r.endsWith(".js"));
  const js = fs.readFileSync(path.join(site, file), "utf8");
  assert(js.startsWith("(() => {") && js.includes("const startApp") && js.includes("const POEMS"), "bundle looks wrong");
});

test("the page keeps its essential structure", () => {
  ["screen-map", "screen-poem", "solar-map", "poem-stage", "keepsakes"].forEach((id) => assert(html.includes(`id="${id}"`), `#${id} missing`));
  assert(html.includes('lang="en"') && html.includes("viewport-fit=cover"));
});

let failed = 0;
tests.forEach(([name, body]) => {
  try { body(); } catch (error) { failed += 1; console.error(` x ${name}\n    ${error.message}`); }
});
if (failed) { console.error(`\n${failed} of ${tests.length} site tests failed`); process.exit(1); }
console.log(`All ${tests.length} site tests passed.`);
