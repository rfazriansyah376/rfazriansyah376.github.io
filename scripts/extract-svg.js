const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const { JSDOM } = require("jsdom");
const sharp = require("sharp");

const baseDir = "./";
const outputDir = "./foto/hasil-svg/";

fse.ensureDirSync(outputDir);

function scanHtmlFiles(directory) {
  let results = [];
  for (const file of fs.readdirSync(directory)) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (
      stat.isDirectory() &&
      !fullPath.includes("node_modules") &&
      !fullPath.includes(".github") &&
      !fullPath.includes("foto")
    ) {
      results = results.concat(scanHtmlFiles(fullPath));
    } else if (file.endsWith(".html")) {
      results.push(fullPath);
    }
  }
  return results;
}

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

    fs.writeFileSync(svgPath, svgContent);

    // wait conversion finish
    await sharp(Buffer.from(svgContent)).png().toFile(pngPath);
    await sharp(Buffer.from(svgContent)).webp().toFile(webpPath);

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

(async () => {
  const htmlList = scanHtmlFiles(baseDir);
  for (const file of htmlList) {
    await processHtml(file);
  }
})();
