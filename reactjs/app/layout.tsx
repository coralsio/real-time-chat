import type {Metadata} from "next";
import "./globals.css";
import {CookiesProvider} from 'next-client-cookies/server';
import {NextuiProvider} from "@/app/providers/nextui-provider";
import {Open_Sans} from "next/font/google";
import ActionModal from "@/app/ui/action-modal";


const openSans = Open_Sans({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Chat App",
    description: "Chat App",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={`${openSans.className} bg-white`}>
        <CookiesProvider>
            <NextuiProvider>
                <main className={'bg-white2'}>
                    {children}
                    <ActionModal/>
                </main>
            </NextuiProvider>
        </CookiesProvider>
        </body>
        </html>
    );
}
