/** @type {import('jest').Config} */
const config = {
  transform: {
    "^.+\\.tsx?$": ["@swc/jest"],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
};

module.exports = config;
