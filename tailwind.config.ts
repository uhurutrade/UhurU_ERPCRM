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
                    base: "#0B1121", // Deepest background
                    sidebar: "#0F172A", // Sidebar background
                    card: "#1E293B", // Card background
                    hover: "#334155", // Hover state
                    border: "rgba(255, 255, 255, 0.08)", // Subtle border
                    text: {
                        main: "#F8FAFC", // Slate 50
                        muted: "#94A3B8", // Slate 400
                        dim: "#64748B", // Slate 500
                    },
                    accent: {
                        green: "#10B981", // Emerald 500 - Money/Positive
                        purple: "#8B5CF6", // Violet 500 - Secondary
                        blue: "#3B82F6", // Blue 500 - Action
                        red: "#EF4444", // Red 500 - Negative/Danger
                        orange: "#F59E0B", // Amber 500 - Warning
                    }
                },
            },
            backgroundImage: {
                'gradient-main': 'linear-gradient(135deg, #0B1121 0%, #151e32 100%)',
                'gradient-card': 'linear-gradient(145deg, #1E293B 0%, #0F172A 100%)',
                'gradient-card-hover': 'linear-gradient(145deg, #253349 0%, #162038 100%)',
                'gradient-accent': 'linear-gradient(135deg, #10B981 0%, #059669 100%)', // Emerald gradient
            },
            borderRadius: {
                'xl': '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(16, 185, 129, 0.15)', // Green glow
                'card': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
            },
        },
    },
    plugins: [],
};
export default config;
