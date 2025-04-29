const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Ensure cwebp is installed
try {
  console.log("Checking for cwebp...");
  execSync("cwebp -version", { stdio: "ignore" });
  console.log("cwebp is installed.");
} catch (error) {
  console.error("cwebp is not installed. Please install it:");
  console.error(
    "- On Windows: Download from https://developers.google.com/speed/webp/download"
  );
  console.error("- On macOS: brew install webp");
  console.error("- On Linux: sudo apt-get install webp");
  process.exit(1);
}

const assetsDir = path.join(__dirname, "..", "assets");

// Function to traverse directories and convert PNG files
function convertPngsInDir(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      convertPngsInDir(filePath);
    } else if (path.extname(file).toLowerCase() === ".png") {
      const webpPath = filePath.replace(/\.png$/i, ".webp");

      // Check if WebP version already exists
      if (!fs.existsSync(webpPath)) {
        console.log(`Converting ${filePath} to WebP...`);
        try {
          // Convert with 80% quality
          execSync(`cwebp -q 80 "${filePath}" -o "${webpPath}"`);

          // Compare file sizes
          const pngSize = fs.statSync(filePath).size;
          const webpSize = fs.statSync(webpPath).size;

          console.log(`Converted ${file}`);
          console.log(`  Original: ${Math.round(pngSize / 1024)}KB`);
          console.log(`  WebP: ${Math.round(webpSize / 1024)}KB`);
          console.log(
            `  Saving: ${Math.round(
              (pngSize - webpSize) / 1024
            )}KB (${Math.round((1 - webpSize / pngSize) * 100)}%)`
          );
        } catch (error) {
          console.error(`Error converting ${file}:`, error.message);
        }
      }
    }
  });
}

// Start conversion
console.log("Converting PNG images to WebP...");
convertPngsInDir(assetsDir);
console.log("Conversion complete!");
