import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("data/artists.json", "utf8"));
const genericLabels = new Set(["artist", "channel", "watch", "playlist", "profile.php", "p"]);
const failures = [];

function clean(value) {
  return String(value || "").trim();
}

function normalize(value) {
  return clean(value).toLowerCase().replace(/^@/, "");
}

for (const side of ["hiphop", "tekno"]) {
  for (const artist of data[side] || []) {
    for (const link of artist.links || []) {
      const label = normalize(link.label);
      const handle = normalize(link.handle);
      const where = `${side}/${artist.slug} ${link.platform || "link"} ${link.url || ""}`;

      if (!clean(link.url)) failures.push(`${where}: mist url.`);
      if (!clean(link.label) && !clean(link.handle)) {
        failures.push(`${where}: mist expliciet label/handle; vul artist legacy in, niet laten raden.`);
      }
      if (genericLabels.has(label)) failures.push(`${where}: generiek label "${link.label}".`);
      if (genericLabels.has(handle)) failures.push(`${where}: generieke handle "${link.handle}".`);
    }
  }
}

if (failures.length) {
  console.error("Social link check failed:");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("social-link-check passed.");
