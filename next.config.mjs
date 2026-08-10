/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['node-llama-cpp'],
  ...(process.env.POSTIFY_LOCAL_SERVER === '1' ? { distDir: '.next-local' } : {}),
};

export default nextConfig;
