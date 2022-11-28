import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import typescript from "rollup-plugin-typescript2";

import pkg from "./package.json";

function config({ plugins = [], output = {} }) {
  return {
    input: "src/index.ts",
    plugins: [typescript(), commonjs(), ...plugins],
    output: output,
    external: ["jszip"],
  };
}

export default [
  config({
    plugins: [terser()],
    output: {
      format: "esm",
      file: pkg.module,
    },
  }),
  config({
    plugins: [terser()],
    output: {
      format: "umd",
      name: pkg.name,
      file: pkg.unpkg,
      globals: {
        jszip: "JSZip",
      },
    },
  }),
];
