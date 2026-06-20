import { minify } from "html-minifier-terser";
import { transform } from "lightningcss";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { cpSync } from "fs";

// mkdirSync("./dist", { recursive: true });
// cpSync("./out/media", "./dist/media", { recursive: true });
//
import { readdir } from "node:fs/promises";

// read all the files in the current directory, recursively
const outFiles = await readdir("./out", { recursive: true });

// Minify JS
await Bun.build({
    entrypoints: outFiles.filter((outFile) => outFile.includes(".js")).map((outFile) => "./out/" + outFile),
    outdir: "./dist",
    minify: true,
});

// Minify CSS
for (const file of outFiles.filter((outFile) => outFile.includes(".css"))) {
    const css = readFileSync("./out/" + file);
    const { code } = transform({
        filename: file,
        code: css,
        minify: true,
    });
    writeFileSync("./dist/" + file, code);
}

// Minify HTML
for (const file of outFiles.filter((outFile) => outFile.includes(".html"))) {
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
