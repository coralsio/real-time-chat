/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: process.env.NEXT_IMAGE_DOMAINS.split('|').map((domain) => {
            domain = (new URL(domain))
            return {
                protocol: domain.protocol.replace(':', ''),
                hostname: domain.hostname,
                port: domain.port
            }
        })
    }
};

export default nextConfig;
