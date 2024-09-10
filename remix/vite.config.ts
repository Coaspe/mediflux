/** @format */

import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

installGlobals();

export default defineConfig({
  plugins: [remix(), tsconfigPaths()],
  server: {
    port: 8000,
  },
  resolve: {
    alias: {
      "@mui/material": path.resolve(__dirname, "node_modules/@mui/material"),
      "@mui/system": path.resolve(__dirname, "node_modules/@mui/system"),
      "@mui/x-date-pickers": path.resolve(__dirname, "node_modules/@mui/x-date-pickers"),
      "@mui/base": path.resolve(__dirname, "node_modules/@mui/base"),
      "@mui/utils": path.resolve(__dirname, "node_modules/@mui/utils"),
      "@mui/styled-engine": path.resolve(__dirname, "node_modules/@mui/styled-engine"),
    },
  },
});
