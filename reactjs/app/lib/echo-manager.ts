'use client';

import Pusher from "pusher-js";
import Echo from "laravel-echo";
import {User} from "@/app/types";

declare global {
    interface Window {
        Pusher: typeof Pusher
        Echo: Echo
    }
}

export default class EchoManager {

    /**
     * privateEcho
     */
    static privateEcho: Echo | undefined;

    /**
     * publicEcho
     */
    static publicEcho: Echo | undefined;

    /**
     *
     */
    static getEchoOptions() {
        window.Pusher = Pusher;

        return {
            broadcaster: 'reverb',
            encrypted: false,
            key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
            wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
            wsPort: process.env.NEXT_PUBLIC_REVERB_PORT ?? 80,
            wssPort: process.env.NEXT_PUBLIC_REVERB_PORT ?? 443,
            forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
            enabledTransports: ['ws', 'wss']
        }
    }

    /**
     *
     * @param user
     */
    static createPrivateEcho(user: User): Echo | undefined {

        if (!user) return;

        if (EchoManager.privateEcho) return EchoManager.privateEcho;

        return EchoManager.privateEcho = new Echo({
            ...EchoManager.getEchoOptions(),
            authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
            auth: {
                headers: {
                    Authorization: user?.authorization
                }
            }
        })
    }

    /**
     *
     * @param user
     */
    static createPublicEcho(user: User): Echo | undefined {
        if (!user) return;

        if (EchoManager.publicEcho) return EchoManager.publicEcho;

        return EchoManager.publicEcho = new Echo(EchoManager.getEchoOptions())
    }

    /**
     *
     */
    static destroy(): void {
        EchoManager.privateEcho = undefined;
        EchoManager.publicEcho = undefined;
    }
}