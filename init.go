package main

import (
	"errors"
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

const disabled = true

func init() {
	staticDir := "out"

	// pass 1 - delete compressed files if last modified time is > 1sec
	log.Printf("Pass 1 @ %v", staticDir)
	filepath.WalkDir(staticDir, func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			fmt.Printf("WalkDir failed with err: %+v\n", err.Error())
			return err
		}

		if strings.HasSuffix(entry.Name(), ".br") {
			fileEntryInfo, err := entry.Info()
			if err != nil {
				return err
			}
			if time.Since(fileEntryInfo.ModTime()) < time.Second {
				log.Printf("Skipping %s", filepath.Base(entry.Name()))
				return nil
			}
			err = os.Remove(path)
			if err != nil {
				return err
			}
		}

		return nil
	})

	// pass 2 - only after removing stale files, recompress them
	log.Printf("Pass 2 @ %v", staticDir)
	filepath.WalkDir(staticDir, func(path string, entry fs.DirEntry, err error) error {
		if err != nil {
			fmt.Printf("WalkDir failed with err: %+v\n", err.Error())
			return err
		}

		var compressFileBrotliIfNotExist = func(src string, quality int) error {
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

			log.Printf("%s -> %s", filepath.Base(src), filepath.Base(outPath))

			if !disabled {
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
			return nil
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
	})
}
