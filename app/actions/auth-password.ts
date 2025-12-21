'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const PASSWORD = process.env.ACCESS_PASSWORD || '12345678';

export async function loginWithPassword(password: string) {
    if (password === PASSWORD) {
        // Set a cookie that lasts for 1 day
        cookies().set('uhuru_access', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });
        return { success: true };
    }
    return { success: false, error: 'Incorrect password' };
}

export async function logout() {
    cookies().delete('uhuru_access');
    redirect('/');
}
