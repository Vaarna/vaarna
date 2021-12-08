const warns = Object.fromEntries(["no-console", "complexity"].map((v) => [v, "warn"]));

const errors = Object.fromEntries(
  [
    "class-methods-use-this",
    "default-case-last",
    "default-case",
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
  env: {
    browser: true,
    es2021: true,
  },
  ignorePatterns: [".eslintrc.js", "jest.config.js", "next-env.d.ts", "next.config.js"],
  extends: [
    "eslint:recommended",
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
  },
  plugins: ["@typescript-eslint"],
  rules: {
    ...warns,
    ...errors,

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
