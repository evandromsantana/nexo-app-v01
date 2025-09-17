const globals = require("globals");
const pluginJs = require("@eslint/js");
const tseslint = require("@typescript-eslint/eslint-plugin");
const parser = require("@typescript-eslint/parser");
const pluginImport = require("eslint-plugin-import");
const eslintConfigGoogle = require("eslint-config-google");
const { FlatCompat } = require("@eslint/compat");
const path = require("path"); // Para resolver caminhos



const compat = new FlatCompat({
  baseDirectory: __dirname, // Usar o diretório base correto
});

module.exports = [
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "google"
  ),
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parser: parser,
      parserOptions: {
        project: ["./tsconfig.json"],
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      import: pluginImport,
    },
    rules: {
      quotes: ["error", "double"],
      "import/no-unresolved": "off",
      indent: ["error", 2],
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
  },
];