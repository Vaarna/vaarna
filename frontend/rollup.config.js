import resolve from "@rollup/plugin-node-resolve";
import sucrase from "@rollup/plugin-sucrase";
import livereload from "rollup-plugin-livereload";

import fs from "fs";
import path from "path";

const copy = (from, to) => ({
  name: "copy",
  load() {
    this.addWatchFile(path.resolve(from));
  },
  generateBundle() {
    fs.copyFileSync(path.resolve(from), path.resolve(to));
  },
});

export default [
  {
    input: "node_modules/pdfjs-dist/build/pdf.js",
    output: {
      file: "dist/pdf.js",
      format: "iife",
      sourcemap: true,
    },
  },
  {
    input: "node_modules/pdfjs-dist/build/pdf.worker.js",
    output: {
      file: "dist/pdf.worker.js",
      format: "iife",
      sourcemap: true,
    },
  },
  {
    input: "node_modules/mithril/mithril.js",
    output: {
      file: "dist/mithril.js",
      format: "iife",
      sourcemap: true,
    },
  },
  {
    input: "node_modules/mithril/stream/stream.js",
    output: {
      file: "dist/mithril.stream.js",
      format: "iife",
      sourcemap: true,
    },
  },

  {
    input: "src/index.ts",
    external: ["mithril", "mithril/stream"],
    output: {
      file: "dist/index.js",
      format: "iife",
      sourcemap: true,
      globals: {
        mithril: "m",
        "mithril/stream": "m.stream",
      },
    },
    watch: {
      include: ["src/**/*"],
    },
    plugins: [
      livereload("dist"),
      resolve(),
      sucrase({ exclude: ["node_modules/**"], transforms: ["typescript"] }),
      copy("node_modules/normalize.css/normalize.css", "dist/normalize.css"),
      copy("src/styles.css", "dist/styles.css"),
      copy("src/index.html", "dist/index.html"),
    ],
  },
];
