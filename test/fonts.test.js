#!/usr/bin/env node
/** Tests for the pure parts of scripts/self-host-fonts.js (no network). */
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const fonts = require("../scripts/self-host-fonts.js");

const template = fs.readFileSync(path.join(__dirname, "..", "src", "index.template.html"), "utf8");

// A stylesheet shaped like the one Google returns: several faces, one file shared by two weights.
const css = `/* arabic */
@font-face { font-family: 'Vazirmatn'; font-weight: 400; src: url(https://fonts.gstatic.com/s/vazirmatn/v1/aaa.woff2) format('woff2'); unicode-range: U+0600-06FF; }
@font-face { font-family: 'Vazirmatn'; font-weight: 700; src: url(https://fonts.gstatic.com/s/vazirmatn/v1/aaa.woff2) format('woff2'); unicode-range: U+0600-06FF; }
/* latin */
@font-face { font-family: 'Fredoka'; font-weight: 500; src: url(https://fonts.gstatic.com/s/fredoka/v2/bbb.woff2) format('woff2'); }`;

const tests = [];
const test = (name, body) => tests.push([name, body]);

test("finds the Google Fonts link in the real page template", () => {
  const url = fonts.findStylesheetUrl(template);
  assert(url && url.startsWith("https://fonts.googleapis.com/css2?"), `got ${url}`);
  assert(url.includes("Fredoka") && url.includes("Vazirmatn"));
});

test("returns null when there is no Google Fonts link", () => assert.strictEqual(fonts.findStylesheetUrl("<html></html>"), null));

test("lists each font file once, even when weights share it", () => {
  assert.deepStrictEqual(fonts.fontUrls(css), [
    "https://fonts.gstatic.com/s/vazirmatn/v1/aaa.woff2",
    "https://fonts.gstatic.com/s/fredoka/v2/bbb.woff2",
  ]);
});

test("rewrites every remote address to its local path", () => {
  const local = new Map(fonts.fontUrls(css).map((url, i) => [url, `fonts/f${i}.woff2`]));
  const out = fonts.rewriteCss(css, local);
  assert(!out.includes("gstatic.com"), "a remote address was left behind");
  assert.strictEqual((out.match(/url\(fonts\/f0\.woff2\)/g) || []).length, 2);
  assert(out.includes("unicode-range: U+0600-06FF"), "other rules must be untouched");
});

test("leaves addresses it was not given a replacement for", () => {
  const out = fonts.rewriteCss(css, new Map());
  assert.strictEqual(out, css);
});

test("points the page at the local stylesheet and drops the Google preconnects", () => {
  const out = fonts.useLocalStylesheet(template, "assets/fonts.123.css");
  assert(out.includes('<link rel="stylesheet" href="assets/fonts.123.css">'));
  assert(!out.includes("fonts.googleapis.com") && !out.includes("fonts.gstatic.com"), "Google addresses remain");
});

test("recognises woff2 data and rejects anything else", () => {
  assert(fonts.isWoff2(Buffer.from("wOF2\u0000\u0001payload", "latin1")));
  assert(!fonts.isWoff2(Buffer.from("<!DOCTYPE html><html>", "latin1")));
  assert(!fonts.isWoff2(Buffer.alloc(0)));
});

// ---- the whole flow, with a fake downloader instead of the network ----
const os = require("os");
const FONT_BYTES = Buffer.from("wOF2\u0000\u0001fake-font-data", "latin1");
const fakeSite = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "site-"));
  fs.writeFileSync(path.join(dir, "index.html"), template);
  return dir;
};
const serve = (bodyFor) => async (url) => bodyFor(url);

const asyncTests = [];
const atest = (name, body) => asyncTests.push([name, body]);

atest("self-hosts the fonts and rewrites the page", async () => {
  const dir = fakeSite();
  const googleCss = Buffer.from(css, "utf8");
  await fonts.main(dir, serve((url) => (url.includes("googleapis") ? googleCss : FONT_BYTES)));
  const html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  assert(!html.includes("fonts.googleapis.com") && !html.includes("fonts.gstatic.com"), "Google addresses remain in the page");
  const cssFile = html.match(/href="(assets\/fonts\.[0-9a-f]{10}\.css)"/)[1];
  const localCss = fs.readFileSync(path.join(dir, cssFile), "utf8");
  assert(!localCss.includes("gstatic.com"), "stylesheet still points at Google");
  const files = fs.readdirSync(path.join(dir, "assets", "fonts"));
  assert.strictEqual(files.length, 1, "identical font files should be stored once");
  localCss.match(/url\((fonts\/[^)]+)\)/g).forEach((ref) => {
    const rel = ref.slice(4, -1);
    assert(fs.existsSync(path.join(dir, "assets", rel)), `${rel} was not written`);
  });
});

atest("leaves the page alone when the download fails", async () => {
  const dir = fakeSite();
  await assert.rejects(fonts.main(dir, serve(() => { throw new Error("offline"); })), /offline/);
  assert.strictEqual(fs.readFileSync(path.join(dir, "index.html"), "utf8"), template);
});

atest("leaves the page alone when a 'font' is really an HTML error page", async () => {
  const dir = fakeSite();
  const googleCss = Buffer.from(css, "utf8");
  await assert.rejects(fonts.main(dir, serve((url) => (url.includes("googleapis") ? googleCss : Buffer.from("<html>blocked</html>")))), /not a woff2/);
  assert.strictEqual(fs.readFileSync(path.join(dir, "index.html"), "utf8"), template);
});

atest("does nothing when the page has no Google Fonts link", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "site-"));
  fs.writeFileSync(path.join(dir, "index.html"), "<html></html>");
  await fonts.main(dir, serve(() => { throw new Error("must not download"); }));
});

(async () => {
  let failed = 0;
  for (const [name, body] of tests) {
    try { body(); } catch (error) { failed += 1; console.error(` x ${name}\n    ${error.message}`); }
  }
  for (const [name, body] of asyncTests) {
    try { await body(); } catch (error) { failed += 1; console.error(` x ${name}\n    ${error.message}`); }
  }
  const total = tests.length + asyncTests.length;
  if (failed) { console.error(`\n${failed} of ${total} font tests failed`); process.exit(1); }
  console.log(`All ${total} font tests passed.`);
})();
