const path = require("path");
const fs = require("fs");

// Verify native addons are properly unpacked after packaging
exports.default = async function afterPack(context) {
  const resourcesDir = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.app`,
    "Contents/Resources"
  );

  // Check asar-unpacked location (where .node files end up)
  const vibrancyUnpacked = path.join(resourcesDir, "app.asar.unpacked/native/build/Release/vibrancy.node");
  const sqliteUnpacked = path.join(resourcesDir, "app.asar.unpacked/node_modules/better-sqlite3");

  if (fs.existsSync(vibrancyUnpacked)) {
    console.log("  + Native vibrancy addon: OK (asar-unpacked)");
  } else {
    console.warn("  ! Native vibrancy addon: NOT FOUND");
  }

  if (fs.existsSync(sqliteUnpacked)) {
    console.log("  + better-sqlite3: OK (asar-unpacked)");
  } else {
    console.warn("  ! better-sqlite3: NOT FOUND in asar-unpacked");
  }
};
