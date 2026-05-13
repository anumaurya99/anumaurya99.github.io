import { minify } from "html-minifier-terser";
import { transform } from "lightningcss";
import { readFileSync, writeFileSync, mkdirSync } from "fs";

mkdirSync("./dist", { recursive: true });

// Minify JS
await Bun.build({
    entrypoints: ["./src/script.js"],
    outdir: "./dist",
    minify: true,
});

// Minify CSS
const css = readFileSync("./src/style.css");
const { code } = transform({
    filename: "style.css",
    code: css,
    minify: true,
});
writeFileSync("./dist/style.css", code);

// Minify HTML
const html = readFileSync("./src/index.html", "utf8");
const minified = await minify(html, {
    collapseWhitespace: true,
    removeComments: true,
    minifyCSS: true,
    minifyJS: true,
});
writeFileSync("./dist/index.html", minified);

console.log("Build done.");
