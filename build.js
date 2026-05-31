import { minify } from "html-minifier-terser";
import { transform } from "lightningcss";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { cpSync } from "fs";

mkdirSync("./dist", { recursive: true });
cpSync("./out/media", "./dist/media", { recursive: true });

// Minify JS
await Bun.build({
    entrypoints: ["./out/script.js"],
    outdir: "./dist",
    minify: true,
});

// Minify CSS
const css = readFileSync("./out/style.css");
const { code } = transform({
    filename: "style.css",
    code: css,
    minify: true,
});
writeFileSync("./dist/style.css", code);

// Minify HTML
const files = ["index.html", "contact.html"]

for (const file of files) {
    const html = readFileSync("./out/" + file, "utf8");
    const minified = await minify(html, {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
    });
    writeFileSync("./dist/" + file, minified);
}

console.log("Build done.");
