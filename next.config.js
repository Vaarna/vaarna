const CircularDependencyPlugin = require("circular-dependency-plugin");

module.exports = {
  webpack5: true,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Important: return the modified config
    return {
      ...config,
      plugins: [
        ...config.plugins,
        new CircularDependencyPlugin({
          exclude: /node_modules/,
          include: /pages|src/,
          failOnError: false,
          allowAsyncCycles: false,
          cwd: process.cwd(),
        }),
      ],
    };
  },
};
