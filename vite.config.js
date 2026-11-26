import { defineConfig } from "vite";

export default defineConfig({
  base: "/flowmaster-lab-site/",
  publicDir: "public",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    sourcemap: false,
    target: "es2018",
    rollupOptions: {
      input: {
        main: "index.html",
        notfound: "404.html",
      },
    },
  },
  server: { host: true, port: 5173 },
});
