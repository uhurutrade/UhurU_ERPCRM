import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export const authConfig = {
    providers: [Google({
        clientId: process.env.AUTH_GOOGLE_ID,
        clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnApiRoute = nextUrl.pathname.startsWith('/api');

            // Allow API routes to handle their own auth
            if (isOnApiRoute) return true;

            // If trying to access dashboard without login, redirect to landing
            if (isOnDashboard && !isLoggedIn) {
                return false; // This will redirect to signIn page (/)
            }

            // Allow access to landing page and other public routes
            return true;
        },
        async signIn({ user }) {
            const allowedEmails = ["raul.irus@gmail.com", "uhurutradeuk@gmail.com"]
            if (user.email && allowedEmails.includes(user.email)) {
                return true;
            }
            console.log(`Access denied for: ${user.email}`);
            return false;
        }
    },
    pages: {
        signIn: '/',
        error: '/', // Error page
    },
} satisfies NextAuthConfig
