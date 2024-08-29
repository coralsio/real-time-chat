import Message from "@/app/ui/chat/message";
import React, {useEffect, useRef} from "react";
import {Discussion, Message as MessageType} from "@/app/types";
import {MessengerStore, useMessengerStore} from "@/app/store/messenger-store";
import InfiniteScroll from "react-infinite-scroll-component";
import axiosClient from "@/app/lib/axios/client";
import {AxiosResponse} from "axios";
import {cn} from "@/app/lib/helpers";

export default function ChatBody() {

    const messengerStore: MessengerStore | null = useMessengerStore();

    const discussion: Discussion = messengerStore.selectedDiscussion as Discussion;

    const scrollableDiv = useRef<any>(null);


    const fetchMoreMessages = () => {
        const lastMessageId = discussion.messages[discussion.messages.length - 1]?.id
        console.log('last message id', lastMessageId)

        axiosClient.get(`/messaging/messages/fetch-more-messages/${lastMessageId}`)
            .then((response: AxiosResponse) => {

                const moreMessages: MessageType[] = response.data.data;
                discussion.messages = discussion.messages.concat(moreMessages)
                messengerStore.setSelectedDiscussion(discussion)
            })
    }

    useEffect(() => {
        return () => {
            if (scrollableDiv?.current) {
                scrollableDiv.current.scrollTop = scrollableDiv.current.scrollHeight;
            }
        }
    }, [discussion])


    return <div
        className={'flex flex-col h-full overflow-x-auto mb-4'}
        id="scrollableDiv"
        style={{
            // height: 300,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column-reverse',
        }}
    >
        {/*Put the scroll bar always on the bottom*/}
        <InfiniteScroll
            dataLength={discussion.messages.length}
            next={fetchMoreMessages}
            style={{display: 'flex', flexDirection: 'column-reverse'}} //To put endMessage and loader to the top.
            inverse={true} //
            hasMore={discussion.messages.length < discussion.messages_count}
            loader={<h4>Loading...</h4>}
            scrollableTarget="scrollableDiv"
        >
            {discussion.messages.map((message: MessageType, index) => {
                const _prevMsg: MessageType | undefined = discussion.messages[index - 1];

                const groupMessages = _prevMsg?.sender.id === message.sender.id &&
                    _prevMsg.formatted_created_at === message.formatted_created_at

                return (
                    <Message key={message.id} groupMessages={groupMessages} message={message}/>

                )
            })}
        </InfiniteScroll>
    </div>;

    return (

        <div className={'flex flex-col h-full overflow-x-auto mb-4'} ref={scrollableDiv} id="scrollableDivEl">

            <InfiniteScroll
                dataLength={40}
                next={fetchMoreMessages}
                style={{
                    display: 'flex',
                    width: '100%',
                    flexDirection: 'column-reverse',
                    scrollbarWidth: 'none'
                }}
                inverse={true}
                hasMore={discussion.messages.length < discussion.messages_count}
                loader={'Loading ....'}
                scrollableTarget="scrollableDivEl"
            >
                <div className={cn('flex flex-col h-full')}>

                    <div className={'grid grid-cols-12 gap-y-2'}>
                        {discussion.messages.map((message: MessageType, index) => {
                            const _prevMsg: MessageType | undefined = discussion.messages[index - 1];

                            const groupMessages = _prevMsg?.sender.id === message.sender.id &&
                                _prevMsg.formatted_created_at === message.formatted_created_at

                            return (
                                <Message key={message.id} groupMessages={groupMessages} message={message}/>

                            )
                        })}

                    </div>
                </div>
            </InfiniteScroll>
        </div>
    );
}