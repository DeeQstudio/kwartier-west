import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const failures = [];
const IGNORED_DIRS = new Set([".git", "node_modules", "_backups", "_screens", "_chrome-profile"]);

function walk(dir, filter) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const out = [];

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      out.push(...walk(absolute, filter));
      continue;
    }
    if (!filter || filter(absolute)) out.push(absolute);
  }

  return out;
}

function normalizeCandidate(target) {
  return target.split("#")[0].split("?")[0];
}

function existsWithIndex(targetPath) {
  if (fs.existsSync(targetPath)) return true;
  const withIndex = path.join(targetPath, "index.html");
  return fs.existsSync(withIndex);
}

function isExternal(ref) {
  return /^(https?:|mailto:|tel:|data:|javascript:|#)/i.test(ref);
}

function resolveRef(file, ref) {
  const clean = normalizeCandidate(ref.trim());
  if (!clean) return null;

  if (clean.startsWith("/")) {
    return path.join(ROOT, clean.slice(1));
  }

  return path.resolve(path.dirname(file), clean);
}

function isKnownVirtualRoute(ref) {
  const clean = normalizeCandidate(String(ref || "").trim());
  if (!clean) return false;
  return /^\/pages\/(?:tekno|hiphop)\/artist\/[^/?#]+\/?$/i.test(clean);
}

function assertFileExists(file, ref, label) {
  if (isExternal(ref)) return;
  if (isKnownVirtualRoute(ref)) return;
  const resolved = resolveRef(file, ref);
  if (!resolved) return;

  if (!existsWithIndex(resolved)) {
    failures.push(`${label}: ${path.relative(ROOT, file)} -> ${ref} (missing ${path.relative(ROOT, resolved)})`);
  }
}

function checkHTML() {
  const htmlFiles = walk(ROOT, (file) => file.endsWith(".html"));
  const refPattern = /(href|src)="([^"]+)"/g;

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, "utf8");
    let match;
    while ((match = refPattern.exec(html))) {
      const [, attr, ref] = match;
      assertFileExists(file, ref, `HTML ${attr}`);
    }
  }
}

function checkJSImports() {
  const jsRoots = [path.join(ROOT, "js"), path.join(ROOT, "partials")].filter((p) => fs.existsSync(p));
  const importPattern = /from\s+"([^"]+)"/g;

  for (const root of jsRoots) {
    const jsFiles = walk(root, (file) => file.endsWith(".js") || file.endsWith(".mjs"));

    for (const file of jsFiles) {
      const code = fs.readFileSync(file, "utf8");
      let match;
      while ((match = importPattern.exec(code))) {
        const ref = match[1];
        if (isExternal(ref) || ref.startsWith("node:")) continue;

        const resolved = resolveRef(file, ref.endsWith(".js") || ref.endsWith(".mjs") ? ref : `${ref}.js`);
        if (!resolved || !fs.existsSync(resolved)) {
          failures.push(`JS import: ${path.relative(ROOT, file)} -> ${ref} (missing ${path.relative(ROOT, resolved || ROOT)})`);
        }
      }
    }
  }
}

function checkJSON() {
  const jsonDir = path.join(ROOT, "data");
  if (!fs.existsSync(jsonDir)) return;

  const jsonFiles = walk(jsonDir, (file) => file.endsWith(".json"));
  for (const file of jsonFiles) {
    try {
      const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
      JSON.parse(raw);
    } catch (error) {
      failures.push(`JSON parse: ${path.relative(ROOT, file)} -> ${error.message}`);
    }
  }
}

checkHTML();
checkJSImports();
checkJSON();

if (failures.length) {
  console.error("Site smoke-check failed:\n");
  for (const message of failures) console.error(" - " + message);
  process.exit(1);
}

console.log("Site smoke-check passed.");
