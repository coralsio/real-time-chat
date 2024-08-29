import ChatPage from '@/app/ui/chat/chat-page';
import {Metadata} from "next";

export const metadata: Metadata = {
    title: "Chat"
};

export default function Page() {
    return <ChatPage/>
}