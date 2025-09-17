/**
 * Custom hook for tracking online/offline status
 */
import { createSignal, createEffect } from "solid-js";
export const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = createSignal(navigator.onLine);
    createEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    });
    return isOnline;
};
