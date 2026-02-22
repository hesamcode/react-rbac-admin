import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/react-rbac-admin/", // 👈 مهم‌ترین خط
  resolve: {
    alias: {
      "react-router-dom": fileURLToPath(
        new URL("./src/lib/react-router-dom.jsx", import.meta.url),
      ),
    },
  },
});
