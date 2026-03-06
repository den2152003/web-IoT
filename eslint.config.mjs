import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["public/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        $: "readonly",
        jQuery: "readonly"
      }
    }
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: globals.node
    }
  }
]);