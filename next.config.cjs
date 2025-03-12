/** @type {import('next').NextConfig} */
module.exports = {
  eslint: {
    // Desactivar la verificación de ESLint durante la compilación
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Desactivar la verificación de TypeScript durante la compilación
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  swcMinify: true,
};
