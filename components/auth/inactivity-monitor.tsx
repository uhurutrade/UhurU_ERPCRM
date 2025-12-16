'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes in milliseconds

export default function InactivityMonitor({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    useEffect(() => {
        let inactivityTimer: NodeJS.Timeout;

        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                // Clear session and redirect to home
                sessionStorage.removeItem('crm_unlocked');
                router.push('/');
            }, INACTIVITY_TIMEOUT);
        };

        // Events that indicate user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        // Add event listeners
        events.forEach(event => {
            document.addEventListener(event, resetTimer, true);
        });

        // Start the timer
        resetTimer();

        // Cleanup
        return () => {
            clearTimeout(inactivityTimer);
            events.forEach(event => {
                document.removeEventListener(event, resetTimer, true);
            });
        };
    }, [router]);

    return <>{children}</>;
}
