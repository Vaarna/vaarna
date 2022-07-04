module.exports = {
  testPathIgnorePatterns: ["dist/"],
  transform: {
    "^.+\\.tsx?$": ["@swc/jest"],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
};
