#!/usr/bin/env node
// Generates the Homebrew Cask formula for nackle.
// Usage: node build/update-cask.js <version> <arm64_sha> <x64_sha> <output_path>

const fs = require("fs");
const path = require("path");

const [version, arm64Sha, x64Sha, outputPath] = process.argv.slice(2);

if (!version || !arm64Sha || !x64Sha || !outputPath) {
  console.error("Usage: node update-cask.js <version> <arm64_sha> <x64_sha> <output_path>");
  process.exit(1);
}

const cask = `cask "nackle" do
  arch arm: "arm64", intel: "x64"

  version "${version}"
  sha256 arm:   "${arm64Sha}",
         intel: "${x64Sha}"

  url "https://github.com/nodelike/nackle/releases/download/v\#{version}/Nackle-\#{version}-\#{arch}.dmg"
  name "Nackle"
  desc "Fast, minimal, shortcut-driven todo app"
  homepage "https://github.com/nodelike/nackle"

  auto_updates true

  app "Nackle.app"

  zap trash: [
    "~/Library/Application Support/nackle",
    "~/Library/Preferences/com.nodelike.nackle.plist",
    "~/Library/Caches/com.nodelike.nackle",
  ]
end
`;

const dir = path.dirname(outputPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(outputPath, cask);
console.log(`Wrote cask formula to ${outputPath}`);
