const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const { JSDOM } = require("jsdom");
const sharp = require("sharp");

const baseDir = "./";
const outputDir = "./foto/hasil-svg/";

// Pastikan folder hasil ada
fse.ensureDirSync(outputDir);

// Scan semua file HTML, termasuk di _posts/
function scanHtmlFiles(directory) {
  let results = [];
  for (const file of fs.readdirSync(directory)) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    // Skip folder yang tidak relevan
    if (
      stat.isDirectory() &&
      !fullPath.includes("node_modules") &&
      !fullPath.includes(".github") &&
      !fullPath.includes("foto")
    ) {
      results = results.concat(scanHtmlFiles(fullPath));
    } 
    // Ambil semua file .html termasuk di _posts/
    else if (file.endsWith(".html")) {
      results.push(fullPath);
    }
  }
  return results;
}

// Proses tiap file HTML
async function processHtml(filePath) {
  const html = fs.readFileSync(filePath, "utf8");
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const baseName = path.basename(filePath, ".html");
  let counter = 1;
  let changed = false;

  const svgNodes = Array.from(document.querySelectorAll("svg"));

  for (const svgNode of svgNodes) {
    const svgContent = svgNode.outerHTML;

    const id = String(counter).padStart(3, "0");
    const svgFile = `${baseName}-${id}.svg`;
    const pngFile = `${baseName}-${id}.png`;
    const webpFile = `${baseName}-${id}.webp`;

    const svgPath = path.join(outputDir, svgFile);
    const pngPath = path.join(outputDir, pngFile);
    const webpPath = path.join(outputDir, webpFile);

    // Simpan file SVG
    fs.writeFileSync(svgPath, svgContent);

    // Convert ke PNG dan WebP
    await sharp(Buffer.from(svgContent)).png().toFile(pngPath);
    await sharp(Buffer.from(svgContent)).webp().toFile(webpPath);

    // Replace inline SVG dengan <picture>
    const pictureWrapper = document.createElement("picture");
    pictureWrapper.innerHTML = `
      <source srcset="/foto/hasil-svg/${webpFile}" type="image/webp">
      <img src="/foto/hasil-svg/${pngFile}" alt="Illustration">
    `;
    svgNode.replaceWith(pictureWrapper);

    counter++;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, dom.serialize());
    console.log(`Converted and replaced SVGs in: ${filePath}`);
  }
}

// Main async
(async () => {
  const htmlFiles = scanHtmlFiles(baseDir);
  for (const file of htmlFiles) {
    await processHtml(file);
  }
})();
