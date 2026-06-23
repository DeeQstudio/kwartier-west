import fs from "node:fs/promises";
import fsSync from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const outRoot = path.join(projectRoot, "_screens", "visual-audit");

const routes = [
  { id: "home", path: "/" },
  { id: "home-hover-tekno", path: "/", desktopOnly: true, hover: "tekno" },
  { id: "home-hover-hiphop", path: "/", desktopOnly: true, hover: "hiphop" },
  { id: "home-hover-villa", path: "/", desktopOnly: true, hover: "villa" },
  { id: "tekno", path: "/pages/tekno/index.html" },
  { id: "hiphop", path: "/pages/hiphop/index.html" },
  { id: "events", path: "/pages/events/index.html" },
  { id: "villa-west", path: "/pages/events/detail/villa-west-radio-2026/index.html" },
  { id: "archive", path: "/pages/archive/index.html" },
  { id: "booking", path: "/pages/booking/index.html" },
  { id: "artist-tekno", path: "/pages/tekno/artist/spoorloos/index.html" },
  { id: "artist-hiphop", path: "/pages/hiphop/artist/de-kweker/index.html" },
  { id: "partners", path: "/pages/partners/index.html" },
  { id: "manifest", path: "/pages/manifest/index.html" },
  { id: "tickets", path: "/pages/tickets/index.html" },
  { id: "privacy", path: "/pages/privacy/index.html" },
  { id: "voorwaarden", path: "/pages/voorwaarden/index.html" },
  { id: "contact", path: "/pages/contact/index.html" }
];

const viewports = [
  { id: "desktop", width: 1440, height: 1000 },
  { id: "mobile", width: 390, height: 844, isMobile: true }
];

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".mp3", "audio/mpeg"],
  [".wav", "audio/wav"]
]);

function safeSegment(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function requestPathToFile(url = "/") {
  const parsed = new URL(url, "http://127.0.0.1");
  const cleanPath = decodeURIComponent(parsed.pathname || "/");
  const relative = cleanPath === "/" ? "index.html" : cleanPath.replace(/^\/+/, "");
  const resolved = path.resolve(projectRoot, relative);

  if (!resolved.startsWith(projectRoot)) return "";
  if (fsSync.existsSync(resolved) && fsSync.statSync(resolved).isDirectory()) {
    return path.join(resolved, "index.html");
  }
  return resolved;
}

function createServer() {
  const server = http.createServer((request, response) => {
    if ((request.url || "").startsWith("/api/public-config")) {
      response.writeHead(200, {
        "cache-control": "no-store",
        "content-type": "application/json; charset=utf-8"
      });
      response.end(
        JSON.stringify({
          ok: true,
          authEnabled: false,
          bookingVerificationEnabled: true,
          turnstileEnabled: false,
          turnstileSiteKey: "",
          supabase: { url: "", anonKey: "" }
        })
      );
      return;
    }

    const filePath = requestPathToFile(request.url || "/");
    if (!filePath || !fsSync.existsSync(filePath)) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": mimeTypes.get(ext) || "application/octet-stream"
    });
    fsSync.createReadStream(filePath).pipe(response);
  });

  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      resolve({ server, origin: `http://127.0.0.1:${address.port}` });
    });
  });
}

async function inspectPage(page) {
  return page.evaluate(() => {
    const images = [...document.images].map((img) => ({
      src: img.currentSrc || img.src,
      alt: img.getAttribute("alt") || "",
      width: img.naturalWidth,
      height: img.naturalHeight,
      complete: img.complete
    }));

    const brokenImages = images.filter((img) => !img.complete || img.width === 0 || img.height === 0);
    const horizontalOverflow = Math.ceil(document.documentElement.scrollWidth) > Math.ceil(window.innerWidth + 1);
    const emptyTextButtons = [...document.querySelectorAll("a, button")]
      .filter((node) => !String(`${node.textContent || ""} ${node.getAttribute("aria-label") || ""} ${node.getAttribute("title") || ""}`).trim())
      .map((node) => node.outerHTML.slice(0, 160));

    return {
      title: document.title,
      imageCount: images.length,
      brokenImages,
      horizontalOverflow,
      emptyTextButtons
    };
  });
}

async function settleLazyMedia(page) {
  await page.evaluate(async () => {
    const step = Math.max(300, Math.floor(window.innerHeight * 0.75));
    const max = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);

    for (let y = 0; y <= max; y += step) {
      window.scrollTo(0, y);
      await new Promise((resolve) => window.setTimeout(resolve, 90));
    }

    window.scrollTo(0, 0);
    await new Promise((resolve) => window.setTimeout(resolve, 160));
  });
}

async function main() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = path.join(outRoot, stamp);
  await fs.mkdir(outDir, { recursive: true });

  const { server, origin } = await createServer();
  const browser = await chromium.launch();
  const report = {
    createdAt: new Date().toISOString(),
    origin,
    output: path.relative(projectRoot, outDir).replaceAll("\\", "/"),
    pages: []
  };

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: Boolean(viewport.isMobile),
        deviceScaleFactor: viewport.isMobile ? 2 : 1
      });

      for (const route of routes) {
        const page = await context.newPage();
        const consoleErrors = [];
        const pageErrors = [];
        const failedRequests = [];

        page.on("console", (message) => {
          if (message.type() === "error") consoleErrors.push(message.text());
        });
        page.on("pageerror", (error) => pageErrors.push(error.message));
        page.on("requestfailed", (request) => {
          failedRequests.push(`${request.method()} ${request.url()} (${request.failure()?.errorText || "failed"})`);
        });

        const url = `${origin}${route.path}`;
        await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
        await page.waitForTimeout(250);
        await settleLazyMedia(page);

        if (route.desktopOnly && viewport.id !== "desktop") {
          await page.close();
          continue;
        }

        if (route.hover && viewport.id === "desktop") {
          const selector =
            route.hover === "villa"
              ? "[data-rift-villa]"
              : `[data-rift-panel][data-rift-side="${route.hover}"]`;
          const target = page.locator(selector).first();
          if (await target.count()) await target.hover();
          await page.waitForTimeout(250);
        }

        const screenshotName = `${safeSegment(route.id)}-${viewport.id}.png`;
        const screenshotPath = path.join(outDir, screenshotName);
        await page.screenshot({ path: screenshotPath, fullPage: true });

        const inspection = await inspectPage(page);
        report.pages.push({
          route: route.id,
          path: route.path,
          viewport: viewport.id,
          screenshot: path.relative(projectRoot, screenshotPath).replaceAll("\\", "/"),
          ...inspection,
          consoleErrors,
          pageErrors,
          failedRequests
        });

        await page.close();
      }

      await context.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  const reportPath = path.join(outDir, "report.json");
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  const issueCount = report.pages.reduce(
    (total, page) =>
      total +
      page.brokenImages.length +
      page.emptyTextButtons.length +
      page.consoleErrors.length +
      page.pageErrors.length +
      page.failedRequests.length +
      (page.horizontalOverflow ? 1 : 0),
    0
  );

  console.log(`Visual audit written to ${path.relative(projectRoot, outDir).replaceAll("\\", "/")}`);
  console.log(`Screenshots: ${report.pages.length}`);
  console.log(`Issues: ${issueCount}`);

  if (issueCount) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
