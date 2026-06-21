import { minify } from "html-minifier-terser";
import { transform } from "lightningcss";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { cpSync } from "fs";
import { readdir } from "node:fs/promises";
import path from "node:path";

mkdirSync("./dist", { recursive: true });
cpSync("./out/media", "./dist/media", { recursive: true });

const outFiles = (await readdir("./out", { recursive: true, withFileTypes: true }))
    .filter((file) =>
        !file.name.includes(".min.") &&
        !file.name.endsWith(".webp") &&
        !file.name.endsWith(".svg") &&
        !file.name.endsWith(".mp4") &&
        file.isFile()
    )
    .map((stat) => path.join(stat.path, stat.name))

console.log(outFiles)
// Minify JS
const jsFiles = outFiles.filter((outFile) => outFile.endsWith(".js"));
if (jsFiles.length === 0) {
    throw new Error("No JS files found")
}
await Bun.build({
    entrypoints: jsFiles.map((outFile) => outFile),
    outdir: "./dist",
    minify: {
        whitespace: true,
        syntax: true,
        identifiers: false,
    },
});

// Minify CSS
const cssFiles = outFiles.filter((outFile) => outFile.includes(".css"));
if (cssFiles.length === 0) {
    throw new Error("No CSS files found")
}
for (const file of cssFiles) {
    const css = readFileSync(file);
    const { code } = transform({
        filename: file,
        code: css,
        minify: true,
    });
    writeFileSync("./dist/" + file, code);
}

// Minify HTML
const htmlFiles = outFiles.filter((outFile) => outFile.includes(".html"));
if (htmlFiles.length === 0) {
    throw new Error("No HTML files found")
}
for (const file of htmlFiles) {
    const html = readFileSync(file, "utf8");
    const minified = await minify(html, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
    });
    writeFileSync("./dist/" + file, minified);
}

console.log("Build done.");
