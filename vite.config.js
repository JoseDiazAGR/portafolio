import { defineConfig } from "vite";
import { readdirSync, existsSync } from "fs";
import { resolve } from "path";

// Detecta automáticamente cada landing nueva en /landings/<nombre>/index.html
// (las carpetas que empiezan con "_" son plantillas y no se publican)
const landingsDir = resolve(__dirname, "landings");
const landings = existsSync(landingsDir)
  ? Object.fromEntries(
      readdirSync(landingsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
        .filter((d) => existsSync(resolve(landingsDir, d.name, "index.html")))
        .map((d) => [d.name, resolve(landingsDir, d.name, "index.html")])
    )
  : {};

export default defineConfig({
  base: "./",
  server: { port: 5173, open: true },
  build: {
    outDir: "dist",
    rollupOptions: { input: { main: resolve(__dirname, "index.html"), ...landings } }
  }
});
