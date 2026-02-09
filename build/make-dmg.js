const appdmg = require("appdmg");
const path = require("path");
const fs = require("fs");

const root = path.resolve(__dirname, "..");
const appPath = path.join(root, "release/mac-arm64/Nackle.app");
const dmgPath = path.join(root, "release/Nackle-1.0.0-arm64.dmg");

// Remove old DMG if it exists
if (fs.existsSync(dmgPath)) {
  fs.unlinkSync(dmgPath);
  console.log("  Removed old DMG");
}

if (!fs.existsSync(appPath)) {
  console.error("  ERROR: Nackle.app not found at", appPath);
  console.error("  Run `electron-builder --dir` first.");
  process.exit(1);
}

console.log("  Building DMG...");

const ee = appdmg({
  target: dmgPath,
  basepath: root,
  specification: {
    title: "Nackle",
    icon: "assets/icon.icns",
    "icon-size": 80,
    background: "build/dmg-background.png",
    window: {
      size: {
        width: 540,
        height: 380,
      },
    },
    format: "ULFO",
    contents: [
      { x: 160, y: 175, type: "file", path: appPath },
      { x: 380, y: 175, type: "link", path: "/Applications" },
      // Move hidden files out of visible area
      { x: 900, y: 900, type: "position", path: ".background" },
      { x: 900, y: 900, type: "position", path: ".DS_Store" },
      { x: 900, y: 900, type: "position", path: ".Trashes" },
      { x: 900, y: 900, type: "position", path: ".VolumeIcon.icns" },
    ],
  },
});

ee.on("progress", (info) => {
  if (info.type === "step-begin") {
    process.stdout.write(`  ${info.title}...`);
  } else if (info.type === "step-end") {
    console.log(` ${info.status}`);
  }
});

ee.on("finish", () => {
  const stats = fs.statSync(dmgPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
  console.log(`\n  DMG created: ${dmgPath}`);
  console.log(`  Size: ${sizeMB} MB`);
});

ee.on("error", (err) => {
  console.error("  DMG build failed:", err);
  process.exit(1);
});
