import resolve from "@rollup/plugin-node-resolve";
import sucrase from "@rollup/plugin-sucrase";
import livereload from "rollup-plugin-livereload";
import multi from "@rollup/plugin-multi-entry";

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

export default (args) => [
  {
    input: [
      "node_modules/mithril/mithril.js",
      "node_modules/mithril/stream/stream.js",
    ],
    output: {
      file: "dist/mithril.js",
      format: "iife",
      sourcemap: true,
    },
    plugins: [multi()],
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
      args.configLivereload ? livereload("dist") : undefined,
      resolve(),
      sucrase({ exclude: ["node_modules/**"], transforms: ["typescript"] }),
      copy("node_modules/normalize.css/normalize.css", "dist/normalize.css"),
      copy("src/styles.css", "dist/styles.css"),
      copy("src/index.html", "dist/index.html"),
    ],
  },
];
