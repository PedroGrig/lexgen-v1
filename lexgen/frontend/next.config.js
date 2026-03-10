/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: process.env.API_URL ? `${process.env.API_URL}/:path*` : 'http://backend:8000/:path*',
            },
        ]
    },
};

module.exports = nextConfig;
