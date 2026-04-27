/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabled for socket.io testing to prevent double connects in dev
};

export default nextConfig;
