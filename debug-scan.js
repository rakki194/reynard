import fs from "fs";
import path from "path";

const scanDirs = ["packages", "examples", "templates", "src", "styles"];
const ignorePatterns = [
  /node_modules/,
  /dist/,
  /build/,
  /\.git/,
  /__pycache__/,
  /\.next/,
  /coverage/,
  /\.cache/,
];

function findCSSFiles(rootDir = process.cwd()) {
  console.log("Starting scan from:", rootDir);
  const cssFiles = [];

  const scanDirectory = (dir) => {
    console.log("Scanning directory:", dir);
    if (!fs.existsSync(dir)) {
      console.log("Directory does not exist:", dir);
      return;
    }

    const items = fs.readdirSync(dir);
    console.log("Directory contents:", items.slice(0, 5));

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        console.log("Found subdirectory:", fullPath);
        // Skip ignored directories
        if (ignorePatterns.some((pattern) => pattern.test(fullPath))) {
          console.log("Skipping ignored directory:", fullPath);
          continue;
        }

        // Only scan configured directories
        const dirName = path.basename(fullPath);
        if (scanDirs.includes(dirName) || dirName.startsWith("reynard")) {
          console.log("Scanning subdirectory:", fullPath);
          scanDirectory(fullPath);
        } else {
          console.log("Skipping non-configured directory:", fullPath);
        }
      } else if (item.endsWith(".css")) {
        console.log("Found CSS file:", fullPath);
        if (!ignorePatterns.some((pattern) => pattern.test(fullPath))) {
          cssFiles.push(fullPath);
        }
      }
    }
  };

  scanDirectory(rootDir);
  return cssFiles;
}

const cssFiles = findCSSFiles();
console.log("\nFinal CSS files found:");
cssFiles.forEach((file) => console.log("  -", file));
console.log("\nTotal files:", cssFiles.length);
