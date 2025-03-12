/** @type {import('next').NextConfig} */
module.exports = {
  eslint: {
    // Desactivar la verificación de ESLint durante la compilación
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  swcMinify: true,
};
