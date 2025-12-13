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
            const isApiAuth = nextUrl.pathname.startsWith('/api/auth');

            // Allow auth routes always
            if (isApiAuth) return true;

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // If logged in and on home, redirect to dashboard
                const isHome = nextUrl.pathname === '/';
                if (isHome) return Response.redirect(new URL('/dashboard', nextUrl));
            }
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
