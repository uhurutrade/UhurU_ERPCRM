/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    webpack: (config, { isServer }) => {
        // Hacer canvas opcional para pdfjs-dist (no necesario para extracción de texto)
        if (isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                canvas: false,
            };
        }
        return config;
    }
};

export default nextConfig;
