import type { NextConfig } from 'next';

const nextConfig: NextConfig = process.env.SELF_HOSTED === '1' ? { output: 'standalone' } : {};

export default nextConfig;
