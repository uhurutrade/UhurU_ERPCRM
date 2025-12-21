import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    // 1. Check if user has the password-access cookie
    const hasAccessCookie = req.cookies.has('uhuru_access');

    // 2. If cookie exists and we are accessing a protected route, renew it
    // We don't want to renew it on public static files, but the matcher already handles that
    if (hasAccessCookie) {
        const response = NextResponse.next();

        // Refresh the cookie for another 10 minutes
        response.cookies.set('uhuru_access', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 10, // 10 minutes from NOW
            path: '/',
        });

        return response;
    }

    // Default NextAuth handling
    return NextResponse.next();
})

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
