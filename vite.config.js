import { defineConfig } from "vite";

/** Path prefix for GitHub Pages. "/" on the custom domain; set SITE_BASE=/flowmaster-lab-site/ only for a project-page preview. */
function normalizeBase(value) {
  let base = (value == null || String(value).trim() === "") ? "/" : String(value).trim();
  if (!base.startsWith("/")) base = `/${base}`;
  if (!base.endsWith("/")) base = `${base}/`;
  return base;
}

const siteBase = normalizeBase(process.env.SITE_BASE);

export default defineConfig({
  base: siteBase,
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
  plugins: [
    {
      name: "site-base",
      transformIndexHtml: {
        order: "pre",
        handler(html) {
          return html.replaceAll("__SITE_BASE__", siteBase);
        },
      },
    },
  ],
  server: { host: true, port: 5173 },
});
