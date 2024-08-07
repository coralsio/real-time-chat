import {Card, CardBody} from "@nextui-org/card";
import ChatHeader from "@/app/ui/chat/chat-header";
import ChatBody from "@/app/ui/chat/chat-body";
import ChatInput from "@/app/ui/chat/chat-input";
import {Divider} from "@nextui-org/react";
import {Discussion, User} from "@/app/types";
import React, {useEffect} from "react";
import axiosClient from "@/app/lib/axios/client";
import {AxiosResponse} from "axios";
import {useStore} from "@/app/store/zustand";
import EchoManager from "@/app/lib/echo-manager";
import {useMessengerStore} from "@/app/store/messenger-store";

interface ChatProps {
    selectedChat: Discussion;
    setDiscussions: React.Dispatch<React.SetStateAction<Discussion[]>>;
    removeDiscussion: (discussion: Discussion) => void
}

const markMessagesAsRead = async (discussionId: number) => {
    return axiosClient.post(`/messaging/discussions/${discussionId}/mark-as-read`)
}

export default function Chat({selectedChat, setDiscussions, removeDiscussion}: ChatProps) {

    const user: User = useStore(state => state.user) as User;
    const mStore = useMessengerStore();

    const privateEcho = EchoManager.createPrivateEcho(user);

    useEffect(() => {
        if (!selectedChat.unread_counts) return

        mStore.setUnreadMessagesCount(mStore.unreadMessagesCount - selectedChat.unread_counts);

        markMessagesAsRead(selectedChat.id).then((response: AxiosResponse) => {
            const d: Discussion = response.data.data;

            const selectedDiscussionStore: Discussion = mStore.selectedDiscussion as Discussion;
            selectedDiscussionStore.unread_counts = d.unread_counts;
            mStore.setSelectedDiscussion(selectedDiscussionStore);

            if (privateEcho) {
                privateEcho
                    .private(`openedDiscussion.${selectedChat.id}`)
                    // @ts-ignore
                    .whisper('updateMessageSeen')
            }
        });

    }, [selectedChat])


    return <>
        <ChatHeader discussion={selectedChat} removeDiscussion={removeDiscussion}/>
        <ChatBody/>
        <ChatInput discussion={selectedChat}/>

    </>;


    return <div className=''>
        <Card
            className='max-md:rounded-[14px] max-md:h-[calc(100vh-13rem)] bg-white2 shadow-none max-md:rounded-t-none border-t border-t-white3'>
            <CardBody className='flex flex-col justify-evenly'>
                <ChatHeader discussion={selectedChat} removeDiscussion={removeDiscussion}/>
                <Divider className='bg-white3'/>
                <ChatBody/>
                <Divider className='bg-white3'/>
                <ChatInput discussion={selectedChat}/>
            </CardBody>
        </Card>
    </div>
}
