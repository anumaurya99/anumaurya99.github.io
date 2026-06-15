package main

import (
	"errors"
	"flag"
	"fmt"

	"io"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/andybalholm/brotli"
)

var enableCompression, pc bool
var logf = func(format string, args ...any) {}

func compressFileBrotliIfNotExist(src string, quality int) error {
	if !enableCompression {
		return nil
	}
	_, err := os.Stat(src + ".br")
	if !errors.Is(err, os.ErrNotExist) {
		return nil
	}

	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	outPath := src + ".br"
	logf("%s -> %s", filepath.Base(src), filepath.Base(outPath))

	outFile, err := os.Create(outPath)
	if err != nil {
		return err
	}
	defer outFile.Close()

	bw := brotli.NewWriterLevel(outFile, quality)
	defer bw.Close()

	_, err = io.Copy(bw, in)
	return err
}

func init() {
	staticDir := "out"

	flag.BoolVar(&enableCompression, "compress", false, "[default:false] enable brotli compression")
	flag.BoolVar(&pc, "pc", false, "[default:false] print when compressed")
	flag.Parse()

	if pc {
		logf = log.Printf
	}

	// pass 1 - delete compressed files if last modified time is > 1sec
	logf("Pass1 @ %v", staticDir)
	if err := filepath.WalkDir(staticDir, func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			fmt.Printf("WalkDir failed with err: %+v\n", err.Error())
			return err
		}

		if !enableCompression || !strings.HasSuffix(entry.Name(), ".br") {
			return nil
		}

		info, err := entry.Info()
		if err != nil {
			return err
		}
		if time.Since(info.ModTime()) < time.Second {
			logf("Skipping %s", filepath.Base(entry.Name()))
			return nil
		}

		return os.Remove(path)
	}); err != nil {
		log.Fatal("[Pass1] Failed to WalkDir")
	}

	// pass 2 - only after removing stale files, recompress them
	logf("Pass2 @ %v", staticDir)

	if err := filepath.WalkDir(staticDir, func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			fmt.Printf("WalkDir failed with err: %+v\n", err.Error())
			return err
		}

		if entry.Type().IsDir() {
			return nil
		}

		abs, err := filepath.Abs(path)
		if err != nil {
			return err
		}

		compressFileBrotliIfNotExist(abs, brotli.BestCompression)
		return nil
	}); err != nil {
		log.Fatal("[Pass2] Failed to WalkDir")
	}
}
