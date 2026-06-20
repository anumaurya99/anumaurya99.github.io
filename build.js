import { minify } from "html-minifier-terser";
import { transform } from "lightningcss";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { cpSync } from "fs";

mkdirSync("./dist", { recursive: true });
cpSync("./out/media", "./dist/media", { recursive: true });

// Minify JS
await Bun.build({
    entrypoints: ["./out/index.js", "./out/toast.min.js"],
    outdir: "./dist",
    minify: true,
});

// Minify CSS
const cssFiles = ["style.css", "toast.css"];

for (const file of cssFiles) {
    const css = readFileSync("./out/" + file);
    const { code } = transform({
        filename: "style.css",
        code: css,
        minify: true,
    });
    writeFileSync("./dist/" + file, code);
}

// Minify HTML
const htmlFiles = ["index.html", "contact.html", "library.html"]

for (const file of htmlFiles) {
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
