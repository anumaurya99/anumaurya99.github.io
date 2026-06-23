//go:build ignore

package main

import (
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"

	"github.com/tdewolff/minify/v2"
	"github.com/tdewolff/minify/v2/css"
	"github.com/tdewolff/minify/v2/html"
	"github.com/tdewolff/minify/v2/js"
	"github.com/tdewolff/minify/v2/svg"
)

var minifier = minify.New()

func check(err error, msg any) {
	if err != nil {
		panic(msg)
	}
}

func compress(src *os.File, dst *os.File) {
	mediatype := ""
	ext := filepath.Ext(src.Name())
	switch ext {
	case ".js":
		mediatype = "text/javascript"
	case ".css":
		mediatype = "text/css"
	case ".html":
		mediatype = "text/html"
	case ".svg":
		mediatype = "image/svg+xml"
	}
	if err := minifier.Minify(mediatype, dst, src); err != nil {
		panic(err)
	}
}

func compressAndCopy(src, dst string) (err error) {
	defer fmt.Printf("%s -> %s\n", src, dst)

	srcInfo, err := os.Stat(src)
	check(err, fmt.Sprintf("problem stating src: %s\n", src))
	if srcInfo.IsDir() {
		return os.MkdirAll(dst, 0755)
	}

	srcFile, err := os.Open(src)
	check(err, fmt.Sprintf("problem opening srcFile: %s\n", src))
	defer srcFile.Close()

	dstFile, err := os.Create(dst)
	check(err, fmt.Sprintf("problem opening dstFile: %s\n", dst))
	defer dstFile.Close()

	ext := filepath.Ext(dstFile.Name())
	if ext == ".js" || ext == ".css" || ext == ".html" || ext == ".svg" {
		defer fmt.Printf("🗜️ ")
		compress(srcFile, dstFile)
	} else {
		_, err = io.Copy(dstFile, srcFile)
		check(err, fmt.Sprintf("failed to copy files from %s -> %s:\n %#v\n", src, dst, err))
		err = dstFile.Sync()
	}

	return
}

func main() {
	// --- setup minifier ---
	jsMinifier := &js.Minifier{
		KeepVarNames: false,
	}
	minifier.Add("text/javascript", jsMinifier)
	minifier.Add("application/javascript", jsMinifier)
	minifier.AddRegexp(regexp.MustCompile(`^module$`), jsMinifier)

	minifier.AddFunc("text/html", html.Minify)
	minifier.AddFunc("text/css", css.Minify)
	minifier.AddFunc("image/svg+xml", svg.Minify)

	// --- copy and compress ---
	const src = "out"
	const dst = "dist"

	err := filepath.WalkDir(src, func(path string, de fs.DirEntry, err error) error {
		check(err, fmt.Sprintf("problem walking path: %s\n", path))

		rel, err := filepath.Rel(src, path)
		check(err, fmt.Sprintf("problem getting relative path: %s\n", path))

		target := filepath.Join(dst, rel)
		return compressAndCopy(path, target)
	})
	check(err, "failed to walkDir")
}
