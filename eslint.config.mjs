import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import * as reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Standalone `ignores` object so global ignores apply even when ESLint is invoked with explicit paths (lint-staged).
  {
    ignores: ["build/**", "dist/**", "node_modules/**", "public/service-worker.js"],
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat["jsx-runtime"],
  reactHooks.configs["recommended-latest"],
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      import: importPlugin,
      "jsx-a11y": jsxA11y,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
        },
      },
    },
    rules: {
      "arrow-body-style": ["error", "as-needed"],
      "class-methods-use-this": "off",
      "import/extensions": [
        "error",
        "ignorePackages",
        { js: "never", jsx: "never", ts: "never", tsx: "never" },
      ],
      "import/no-unresolved": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/heading-has-content": "off",
      "jsx-a11y/label-has-associated-control": ["error", { controlComponents: ["Input"] }],
      "jsx-a11y/label-has-for": "off",
      "jsx-a11y/mouse-events-have-key-events": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
      "no-console": ["error", { allow: ["error"] }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_|^React$",
          caughtErrors: "none",
        },
      ],
      "no-use-before-define": "off",
      "prefer-template": "error",
      "react/display-name": "off",
      "react/react-in-jsx-scope": "off",
      "react/destructuring-assignment": "off",
      "react/jsx-first-prop-new-line": ["error", "multiline"],
      "react/jsx-filename-extension": "off",
      "react/jsx-no-target-blank": "off",
      "react/jsx-props-no-spreading": "off",
      "react/jsx-uses-vars": "error",
      "react/forbid-prop-types": "off",
      "react/jsx-closing-tag-location": "off",
      "react/prop-types": "off",
      "react/require-default-props": "off",
      "react/require-extension": "off",
      "react/self-closing-comp": "off",
      "react/sort-comp": "off",
      "react/no-array-index-key": "off",
    },
  },
  {
    files: [
      "src/containers/fmb/fmb-receipt/FmbReceiptCreate.tsx",
      "src/containers/fmb/fmb-thali-settings/FmbThaliSettingsList.tsx",
      "src/containers/whatsapp-templates/WhatsappTemplateShared.tsx",
    ],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },
  eslintConfigPrettier
);
