import type { NextConfig } from "next";

// Prevent Tokio and libuv from exhausting thread limits on cloud containers (e.g. Hostinger os error 11)
process.env.TOKIO_WORKER_THREADS = '1';
process.env.UV_THREADPOOL_SIZE = '1';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@prisma/client', 'prisma', '@prisma/adapter-mariadb', 'mariadb'],
  outputFileTracingIncludes: {
    '/**': [
      './node_modules/.prisma/client/**/*',
      './node_modules/@prisma/client/**/*',
    ],
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
};

export default nextConfig;
