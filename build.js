#!/usr/bin/env node
/**
 * Build: bundles src/ for two kinds of hosting. No dependencies.
 *
 *   node build.js          one self-contained file:  dist/planet-poems.html
 *   node build.js --site   a deployable folder:      dist/site/
 *                            index.html
 *                            assets/app.<hash>.js
 *                            assets/styles.<hash>.css
 *
 * The site build keeps script and styles in their own files, which lets a server send a
 * strict Content-Security-Policy (no inline script) and cache the assets forever, because
 * the file name changes whenever the content does.
 */
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const manifest = require("./manifest.js");

const ROOT = __dirname;
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");

const read = (file) => fs.readFileSync(path.join(SRC, file), "utf8");
const comment = (file) => `\n/* ---- ${file} ---- */\n`;
const hashOf = (text) => crypto.createHash("sha256").update(text).digest("hex").slice(0, 10);
const kb = (text) => `${(Buffer.byteLength(text) / 1024).toFixed(1)} KB`;

const modules = [...manifest.pure, ...manifest.ui];

/** Fail the build early if any module has a syntax error. */
const checkSyntax = () => {
  modules.forEach((file) => {
    try {
      new vm.Script(read(file), { filename: file });
    } catch (error) {
      console.error(`Syntax error in ${file}: ${error.message}`);
      process.exit(1);
    }
  });
};

const bundleStyles = () => manifest.styles.map((file) => comment(file) + read(file)).join("");

/** All modules in one strict-mode closure, so nothing leaks into the global scope. */
const bundleScript = () =>
  [
    "(() => {",
    '"use strict";',
    ...modules.map((file) => `\n// ---- ${file} ----\n${read(file)}`),
    "})();",
  ].join("\n");

const fill = (template, { styles, script }) =>
  template.replace("<!--__STYLES__-->", () => styles).replace("<!--__SCRIPT__-->", () => script);

const write = (file, text) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
};

const buildSingleFile = () => {
  const script = bundleScript().replace(/<\/script/gi, "<\\/script");
  const html = fill(read("index.template.html"), {
    styles: `<style>\n${bundleStyles()}\n</style>`,
    script: `<script>\n${script}\n</script>`,
  });
  const out = path.join(DIST, "planet-poems.html");
  write(out, html);
  console.log(`Built ${path.relative(process.cwd(), out)} (${kb(html)}, ${modules.length} modules)`);
};

const buildSite = () => {
  const site = path.join(DIST, "site");
  fs.rmSync(site, { recursive: true, force: true });

  const css = bundleStyles();
  const js = bundleScript();
  const cssName = `assets/styles.${hashOf(css)}.css`;
  const jsName = `assets/app.${hashOf(js)}.js`;
  write(path.join(site, cssName), css);
  write(path.join(site, jsName), js);

  const html = fill(read("index.template.html"), {
    styles: `<link rel="stylesheet" href="${cssName}">`,
    script: `<script src="${jsName}" defer></script>`,
  });
  write(path.join(site, "index.html"), html);

  console.log(`Built ${path.relative(process.cwd(), site)}/  index.html ${kb(html)}, ${jsName} ${kb(js)}, ${cssName} ${kb(css)}`);
};

checkSyntax();
if (process.argv.includes("--site")) buildSite();
else buildSingleFile();
