import {Input} from "@nextui-org/input";
import Conversation from "@/app/ui/chat/conversation";
import Image from "next/image";
import {Discussion, Discussions as DiscussionsType} from "@/app/types";
import {MessengerStore, useMessengerStore} from "@/app/store/messenger-store";
import React, {useState} from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import axiosClient from "@/app/lib/axios/client";
import {AxiosResponse} from "axios";
import {cn} from "@/app/lib/helpers";
import {useDebouncedCallback} from "use-debounce";
import {Spinner} from "@nextui-org/react";

interface ConversationsListProps {
    discussions: DiscussionsType,
    setDiscussions: React.Dispatch<React.SetStateAction<Discussion[]>>
}


export default function Discussions({discussions, setDiscussions}: ConversationsListProps) {

    const messengerStore: MessengerStore = useMessengerStore();

    const [searchQuery, setSearchQuery] = useState<string>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchMoreDiscussions = () => {

        const lastDiscussion: Discussion = discussions[discussions.length - 1];

        const lastMessageCreatedAt = lastDiscussion.messages[lastDiscussion.messages.length - 1].created_at;

        const params = new URLSearchParams({
            last_msg_created_at: lastMessageCreatedAt
        });

        if (searchQuery) {
            params.set('search', searchQuery)
        }

        axiosClient.get(`messaging/discussions?${params.toString()}`)
            .then((response: AxiosResponse) => {
                setDiscussions((prevDiscussions: Discussion[]) => [...prevDiscussions, ...response.data.data])
                messengerStore.setDiscussionsPagination(response.data.meta.pagination)
            })
    }

    const search = (e: any) => {
        setIsLoading(true);

        const value = e.target.value;
        setSearchQuery(value);
        axiosClient.get(`messaging/discussions?search=${value}`).then((response: AxiosResponse) => {
            setDiscussions(response.data.data);
            messengerStore.setDiscussionsPagination(response.data.meta.pagination)
            setIsLoading(false)
        })

    }


    return <div className='flex max-h-[36rem] flex-col'>
        <Input
            type="text"
            placeholder="Search"
            onChange={useDebouncedCallback(search, 300)}
            classNames={{
                label: "text-sm text-black3 tracking-tight font-bold mb-1",
                input: "block  rounded-full",
                inputWrapper: "rounded-full h-8 bg-white3 p-0 mb-5 max-lg:mb-2",
            }}
            endContent={
                isLoading ? <Spinner color="default" size="sm"/> : ''
            }
            startContent={
                <div className='px-4'>
                    <Image
                        src="/icons/search-gray.svg"
                        height={22}
                        width={22}
                        alt=""
                        className="inline-block mr-2"
                    />
                </div>
            }
        />

        {discussions.length === 0
            ? <div className='w-full h-fit flex items-center justify-center'>No conversations yet</div>
            : <div
                id={'discussions-scroll-target'}
                className={'overflow-auto pr-3'}>
                <InfiniteScroll
                    dataLength={discussions.length}
                    hasMore={(messengerStore.discussionsPagination?.count || 0) < (messengerStore.discussionsPagination?.total || 0)}
                    next={fetchMoreDiscussions}
                    loader={'Loading ....'}
                    scrollableTarget={'discussions-scroll-target'}
                    style={{scrollbarWidth: 'none'}}>
                    {discussions.map((discussion: Discussion, index: number) => {
                        return (
                            <div className={cn('p-1', {
                                'bg-indigo-100': discussion.id === messengerStore.selectedDiscussion?.id
                            })}
                                 onClick={() => messengerStore.setSelectedDiscussion(discussion)}
                                 key={discussion.id}>
                                <Conversation discussion={discussion}/>
                            </div>
                        )
                    })}
                </InfiniteScroll>
            </div>

        }
    </div>
}
