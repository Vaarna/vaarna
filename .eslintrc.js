const warns = Object.fromEntries(["no-console", "complexity"].map((v) => [v, "warn"]));

const errors = Object.fromEntries(
  [
    "class-methods-use-this",
    "default-case-last",
    "default-param-last",
    "eqeqeq",
    "no-alert",
    "no-duplicate-imports",
    "no-else-return",
    "no-restricted-properties",
    "no-restricted-syntax",
    "no-return-await",
    "no-throw-literal",
    "no-var",
    "object-shorthand",
    "prefer-arrow-callback",
    "prefer-const",
    "prefer-numeric-literals",
    "prefer-rest-params",
    "prefer-spread",
    "prefer-template",
    "radix",
    "require-atomic-updates",
    "yoda",
  ].map((v) => [v, "error"])
);

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  ignorePatterns: [
    ".eslintrc.js",
    "jest.config.js",
    "next-env.d.ts",
    "next.config.js",
    "styled.d.ts",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
  },
  plugins: ["@typescript-eslint", "simple-import-sort", "import"],
  rules: {
    ...warns,
    ...errors,

    "simple-import-sort/imports": [
      "error",
      {
        groups: [["^\\u0000"], ["^@?\\w"], ["^@vaarna/"]],
      },
    ],
    "simple-import-sort/exports": ["error"],

    "@typescript-eslint/no-unused-vars": [
      "error",
      { varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-inferrable-types": [
      "error",
      {
        ignoreParameters: true,
        ignoreProperties: true,
      },
    ],
  },
};
