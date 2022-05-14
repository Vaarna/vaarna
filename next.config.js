const CircularDependencyPlugin = require("circular-dependency-plugin");

module.exports = {
  webpack5: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    const circularDependency = dev
      ? [
          new CircularDependencyPlugin({
            exclude: /node_modules/,
            include: /pages|src/,
            failOnError: false,
            allowAsyncCycles: false,
            cwd: process.cwd(),
          }),
        ]
      : [];

    return {
      ...config,
      plugins: [...config.plugins, ...circularDependency],
    };
  },
};
