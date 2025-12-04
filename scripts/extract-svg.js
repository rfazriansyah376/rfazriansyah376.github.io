
const fs = require("fs");
const fse = require("fs-extra");
const path = require("path");
const { JSDOM } = require("jsdom");
const sharp = require("sharp");

const directory = "./";
const outputDir = "./foto/hasil-svg/";

fse.ensureDirSync(outputDir);

function scanHtmlFiles(dir) {
  const files = fs.readdirSync(dir);
  let htmlFiles = [];

  files.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !fullPath.includes(".github") && !fullPath.includes("node_modules") && !fullPath.includes("foto")) {
      htmlFiles = htmlFiles.concat(scanHtmlFiles(fullPath));
    } else if (file.endsWith(".html")) {
      htmlFiles.push(fullPath);
    }
  });

  return htmlFiles;
}

const htmlFiles = scanHtmlFiles(directory);

htmlFiles.forEach((filePath) => {
  const content = fs.readFileSync(filePath, "utf8");
  const dom = new JSDOM(content);
  const document = dom.window.document;

  const fileBase = path.basename(filePath, ".html");
  let counter = 1;
  let changed = false;

  document.querySelectorAll("svg").forEach((svg) => {
    const svgString = svg.outerHTML;

    const svgFilename = `${fileBase}-${String(counter).padStart(3, "0")}.svg`;
    const pngFilename = `${fileBase}-${String(counter).padStart(3, "0")}.png`;
    const webpFilename = `${fileBase}-${String(counter).padStart(3, "0")}.webp`;

    const svgPath = path.join(outputDir, svgFilename);
    const pngPath = path.join(outputDir, pngFilename);
    const webpPath = path.join(outputDir, webpFilename);

    fs.writeFileSync(svgPath, svgString);

    sharp(Buffer.from(svgString))
      .png()
      .toFile(pngPath);

    sharp(Buffer.from(svgString))
      .webp()
      .toFile(webpPath);

    const pictureElement = document.createElement("picture");
    pictureElement.innerHTML = `
      <source srcset="/foto/hasil-svg/${webpFilename}" type="image/webp">
      <img src="/foto/hasil-svg/${pngFilename}" alt="Illustration">
    `;

    svg.replaceWith(pictureElement);
    counter++;
    changed = true;
  });

  if (changed) {
    fs.writeFileSync(filePath, dom.serialize());
    console.log("Processed: " + filePath);
  }
});
