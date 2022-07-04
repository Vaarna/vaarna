/**
 * @type {import('next').NextConfig}
 */
const config = {
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    externalDir: true,
  },
};

module.exports = config;
