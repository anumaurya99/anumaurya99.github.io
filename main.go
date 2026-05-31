package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"

	"github.com/a-h/templ"
	"wechitracreativehouse.in/web"
)

func check(err error, msg string) {
	if err != nil {
		panic(msg)
	}
}

func generateFile(template templ.Component, path string) {
	err := os.MkdirAll(filepath.Dir(path), 0755)
	check(err, "")

	f, err := os.Create(path)
	check(err, fmt.Sprintf("something went wrong generating file: %s with err:\n%v", path, err))
	defer f.Close()

	err = template.Render(context.Background(), f)
	check(err, fmt.Sprintf("failed to write output file: %v", err))
}

func main() {
	generateFile(web.Index(), "out/index.html")
	generateFile(web.Contact(), "out/contact.html")
}
