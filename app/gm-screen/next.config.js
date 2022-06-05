/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    styledComponents: true,
  },
  // needed to import jsx, which is required for styled-components to work
  // TODO: use babel with styled-components plugin in packages to circumvent this issue
  experimental: { externalDir: true },
};
