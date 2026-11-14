#!/usr/bin/env node
/**
 * Self-host the web fonts, so visitors' browsers never contact Google.
 *
 *   node scripts/self-host-fonts.js dist/site
 *
 * It reads the Google Fonts link from index.html, downloads the stylesheet and every font
 * file it names, stores them under assets/, and points index.html at the local copies.
 *
 * If anything goes wrong (no network, Google changes its response, a file is not a font)
 * it leaves index.html untouched, so the page still works with Google Fonts, and exits 0.
 * Set FONTS_STRICT=1 to make failures stop the build instead.
 *
 * The functions below are pure and unit-tested (test/fonts.test.js); only main() uses the network.
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const GOOGLE_STYLESHEET = /<link href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)" rel="stylesheet">/;
const GOOGLE_PRECONNECT = /<link rel="preconnect" href="https:\/\/fonts\.(?:googleapis|gstatic)\.com"[^>]*>\n?/g;
const FONT_FILE_URL = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g;
// A current browser user agent makes Google answer with compact woff2 files.
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const TIMEOUT_MS = 20000;

// ---------------- pure helpers ----------------

/** The Google Fonts stylesheet address in a page, or null. */
const findStylesheetUrl = (html) => {
  const match = html.match(GOOGLE_STYLESHEET);
  return match ? match[1].replace(/&amp;/g, "&") : null;
};

/** Every distinct font file a stylesheet refers to. */
const fontUrls = (css) => [...new Set([...css.matchAll(FONT_FILE_URL)].map((match) => match[1]))];

/** Replace remote font addresses with local paths (a Map of remote url -> local path). */
const rewriteCss = (css, localPaths) =>
  css.replace(FONT_FILE_URL, (whole, url) => (localPaths.has(url) ? `url(${localPaths.get(url)})` : whole));

/** Swap the Google stylesheet link for a local one and drop the now-useless preconnects. */
const useLocalStylesheet = (html, href) =>
  html.replace(GOOGLE_STYLESHEET, `<link rel="stylesheet" href="${href}">`).replace(GOOGLE_PRECONNECT, "");

/** woff2 files start with the bytes "wOF2"; this stops an HTML error page being saved as a font. */
const isWoff2 = (bytes) => bytes.length > 4 && bytes.subarray(0, 4).toString("latin1") === "wOF2";

const shortHash = (data) => crypto.createHash("sha256").update(data).digest("hex").slice(0, 10);

// ---------------- network ----------------

const download = async (url) => {
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
};

/** `fetchBytes` can be replaced in tests so no network is needed. */
const main = async (siteDir, fetchBytes = download) => {
  const indexPath = path.join(siteDir, "index.html");
  const html = fs.readFileSync(indexPath, "utf8");
  const stylesheetUrl = findStylesheetUrl(html);
  if (!stylesheetUrl) {
    console.log("fonts: no Google Fonts link in index.html, nothing to do");
    return;
  }

  const css = (await fetchBytes(stylesheetUrl)).toString("utf8");
  const urls = fontUrls(css);
  if (urls.length === 0) throw new Error("the stylesheet names no font files");

  const localPaths = new Map();
  const fontsDir = path.join(siteDir, "assets", "fonts");
  fs.mkdirSync(fontsDir, { recursive: true });
  for (const url of urls) {
    const bytes = await fetchBytes(url);
    if (!isWoff2(bytes)) throw new Error(`${url} is not a woff2 font`);
    const name = `${shortHash(bytes)}.woff2`;
    fs.writeFileSync(path.join(fontsDir, name), bytes);
    localPaths.set(url, `fonts/${name}`); // relative to the stylesheet, which lives in assets/
  }

  const localCss = rewriteCss(css, localPaths);
  const cssName = `assets/fonts.${shortHash(localCss)}.css`;
  fs.writeFileSync(path.join(siteDir, cssName), localCss);
  fs.writeFileSync(indexPath, useLocalStylesheet(html, cssName));
  console.log(`fonts: self-hosted ${urls.length} font files (${cssName})`);
};

if (require.main === module) {
  const siteDir = process.argv[2] || path.join(__dirname, "..", "dist", "site");
  main(siteDir).catch((error) => {
    console.warn(`fonts: could not self-host (${error.message}). Keeping the Google Fonts link.`);
    process.exit(process.env.FONTS_STRICT === "1" ? 1 : 0);
  });
}

module.exports = { findStylesheetUrl, fontUrls, rewriteCss, useLocalStylesheet, isWoff2, main };
