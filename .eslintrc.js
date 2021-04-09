const warns = Object.fromEntries(["no-console", "complexity"].map((v) => [v, "warn"]));

const errors = Object.fromEntries(
  [
    "class-methods-use-this",
    "default-case-last",
    "default-case",
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
    "prefer-destructuring",
    "prefer-numeric-literals",
    "prefer-rest-params",
    "prefer-spread",
    "prefer-template",
    "radix",
  ].map((v) => [v, "error"])
);

module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
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
  plugins: ["react", "react-hooks", "@typescript-eslint"],
  rules: {
    ...warns,
    ...errors,

    "react/react-in-jsx-scope": "off",

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
  settings: {
    react: {
      version: "detect",
      linkComponents: [{ name: "Link", linkAttribute: "href" }],
    },
  },
};
