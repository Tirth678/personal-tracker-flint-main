import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
export default defineConfig({
  plugins: [tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: {
    rolldownOptions: {
      input: {
        app: "index.html",
        demo: "peak-demo.html",
        glassy: "glassy-demo.html",
      },
    },
  },
  server: { host: "0.0.0.0", allowedHosts: true },
});
