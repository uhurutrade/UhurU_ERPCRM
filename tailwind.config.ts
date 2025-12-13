import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                uhuru: {
                    navy: "#0a0f1e",
                    "navy-light": "#141b2e",
                    blue: "#5B7CFF",
                    "blue-light": "#7B94FF",
                    purple: "#8B5CF6",
                    cyan: "#06b6d4",
                },
            },
            backgroundImage: {
                'gradient-uhuru': 'linear-gradient(135deg, #0a0f1e 0%, #141b2e 100%)',
                'gradient-card': 'linear-gradient(135deg, rgba(91, 124, 255, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
            },
            boxShadow: {
                'uhuru': '0 0 20px rgba(91, 124, 255, 0.3)',
                'uhuru-sm': '0 0 10px rgba(91, 124, 255, 0.2)',
            },
        },
    },
    plugins: [],
};
export default config;
