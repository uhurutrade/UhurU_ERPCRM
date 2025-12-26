import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"

export const authConfig = {
    providers: [Google({
        authorization: {
            params: {
                scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
                access_type: "offline",
            },
        },
    })],
    callbacks: {
        authorized({ auth, request }) {
            const isLoggedIn = !!auth?.user;
            const hasAccessCookie = request.cookies?.get('uhuru_access')?.value === 'true';
            const isOnDashboard = request.nextUrl.pathname.startsWith('/dashboard');
            const isOnApiRoute = request.nextUrl.pathname.startsWith('/api');

            // Allow API routes to handle their own internal auth or check session
            if (isOnApiRoute) return true;

            // If trying to access dashboard without login (either OAuth or Password cookie)
            // Redirect to landing
            if (isOnDashboard && !isLoggedIn && !hasAccessCookie) {
                return false; // This will redirect to signIn page (/)
            }

            // Allow access to landing page and other public routes
            return true;
        },
        async signIn({ user }) {
            const allowedEmail = "uhurutradeuk@gmail.com"
            if (user.email === allowedEmail) {
                return true;
            }
            console.log(`Access denied for: ${user.email}. Only ${allowedEmail} is allowed.`);
            return false;
        },
        async session({ session, user, token }) {
            console.log("[Auth] Session Callback:", { userId: user?.id, tokenId: token?.sub });
            if (session.user) {
                session.user.id = user?.id || (token?.sub as string);
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                console.log("[Auth] JWT Callback - User ID assigned:", user.id);
                token.id = user.id;
            }
            return token;
        }
    },
    pages: {
        signIn: '/',
        error: '/', // Error page
    },
} satisfies NextAuthConfig
