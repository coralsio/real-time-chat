'use client'

import Image from "next/image";
import Chat from "@/app/ui/chat/chat";
import {MessengerStore, useMessengerStore} from "@/app/store/messenger-store";
import Discussions from "@/app/ui/chat/discussions-list";
import React, {useEffect, useState} from "react";
import useMessages from "@/app/lib/use-messages";
import {useSearchParams} from "next/navigation";
import {Discussion} from "@/app/types";
import {useStore, Store} from "@/app/store/zustand";
import {Avatar, Divider} from "@nextui-org/react";
import {logout} from "@/app/lib/auth";
import {useRouter} from "next/navigation";
import {useCookies} from 'next-client-cookies';
import EchoManager from "@/app/lib/echo-manager";

export default function MessagesPage() {
    const messengerStore: MessengerStore = useMessengerStore();

    const store: Store = useStore();
    const router = useRouter()
    const cookies = useCookies();

    const searchParams = useSearchParams();

    const {
        setDiscussions,
        selectedDiscussion,
        discussions,
        loadingDiscussions
    } = useMessages(searchParams.get('d'))

    const closeChat = () => {
        messengerStore.setSelectedDiscussion(null);
    }

    const [isMobileView, setIsMobileView] = useState<boolean | null>(null);

    useEffect(() => {
        setIsMobileView(window.innerWidth < 768)
    }, []);

    const removeDiscussion = (deletedDiscussion: Discussion) => {
        setDiscussions(
            discussions.filter((discussion: Discussion) => discussion.id !== deletedDiscussion.id)
        )
    }


    return <div className="flex h-screen antialiased text-gray-800">
        <div className="flex flex-row h-full w-full overflow-x-hidden">

            {/*LEFT SIDE*/}
            <div className="flex flex-col py-8 pl-6 pr-2 w-72 bg-white flex-shrink-0">
                <div className="flex flex-row items-center justify-center h-12 w-full">
                    <div
                        className="flex items-center justify-center rounded-2xl text-indigo-700 bg-indigo-100 h-10 w-10"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                            ></path>
                        </svg>
                    </div>
                    <div
                        className="ml-2 font-bold text-2xl">{process.env.NEXT_PUBLIC_APP_NAME}</div>
                </div>

                <div className={'min-h-[36rem] max-h-[36rem] mt-3'}>
                    {loadingDiscussions ?
                        <div className='w-full h-fit flex items-center justify-center'>Loading...</div> :
                        <Discussions setDiscussions={setDiscussions} discussions={discussions}/>
                    }
                </div>

                <Divider className='bg-white3'/>

                <div className="flex flex-col space-y-1 mt-4 -mx-2">
                    <div className="flex flex-row justify-between"
                    >
                        <div>

                            {store.user?.picture_thumb ?
                                <Avatar
                                    src={store.user.picture_thumb as string}
                                    className='h-9 w-9 text-sm inline-block'
                                /> :
                                <Avatar
                                    name={store?.user?.full_name}
                                    className='h-9 w-9 text-large inline-block'
                                />
                            }
                            <div className="ml-2 text-sm font-semibold inline-block">{store.user?.full_name}</div>
                        </div>
                        <button className={'mr-3 cursor-pointer'} onClick={e => {
                            store.setObjectAction({
                                object: store.user,
                                title: `Logout`,
                                action: 'logout',
                                message: `Are you sure want to logout`,
                                onConfirmed: async (): Promise<boolean> => {
                                    return await logout().then(() => {
                                        EchoManager.destroy()
                                        cookies.remove('session');
                                        router.push('/api/logout')
                                        return true;
                                    });
                                }
                            })
                        }
                        }>
                            <Image src={'/icons/logout.svg'}
                                   width={30} height={30}
                                   alt={'Logout'}/>
                        </button>
                    </div>

                </div>
            </div>
            {/*END LEFT SIDE*/}
            <div className="flex flex-col flex-auto h-full p-6">
                <div
                    className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4"
                >
                    {selectedDiscussion ?
                        <Chat setDiscussions={setDiscussions} selectedChat={selectedDiscussion}
                              removeDiscussion={removeDiscussion}/>
                        : <div className={'flex flex-col h-full overflow-x-auto mb-4'}>
                            <div className={'col-start-1 col-end-8 p-3 rounded-lg'}>
                                <div className={'flex flex-row items-center'}>
                                    No Conversation selected!
                                </div>
                            </div>
                        </div>}
                </div>

            </div>

        </div>
    </div>

    // return (
    //     <div className={'flex flex-col h-full mb-10 px-4 grow w-full'}>
    //         <h2 className=''>
    //             <div
    //                 className="flex text-base tracking-tighter my-2 md:my-5 2xl:my-9 font-bold text-black3 ml-4  items-center">
    //                 <div className="flex items-center pr-2 bg-white2">
    //                     <Image
    //                         src="/icons/chat.svg"
    //                         height={22}
    //                         width={22}
    //                         alt=""
    //                         className="inline-block mr-2"
    //                     />
    //                     <span className="inline-block align-middle">Messages</span>
    //                 </div>
    //                 <span className="flex-1 h-px bg-white3"></span>
    //             </div>
    //
    //         </h2>
    //         <div className='w-full  md:gap-6 md:flex'>
    //             <div className='w-full md:w-3/12'>
    //                 {loadingDiscussions ?
    //                    `Loading ...`
    //                     :
    //                     <Discussions setDiscussions={setDiscussions} discussions={discussions}/>}
    //             </div>
    //             {!isMobileView ?
    //                 <div className='max-md:hidden md:w-9/12'>
    //                     {!selectedDiscussion ? <div
    //                             className='flex justify-center items-center outline-dashed outline-grayDark w-full h-[585px] rounded-lg'>
    //                             <div className='flex flex-col'>
    //                                 <div
    //                                     className=" bg-transparent flex justify-center items-center z-50 flex-col">
    //                                     <div className="">
    //                                         <div className="flex items-end gap-1 mb-1">
    //                                             <div className="bg-primary w-4 h-6 rounded-tr-md rounded-bl-md"></div>
    //                                             <div className="bg-secondary w-6 h-4 rounded-tl-md rounded-br-md"></div>
    //                                         </div>
    //                                         <div className="flex items-start gap-1 -translate-x-3">
    //                                             <div className="bg-secondary w-6 h-4 rounded-tl-md rounded-br-md"></div>
    //                                             <div className="bg-primary w-4 h-6 rounded-tr-md rounded-bl-md"></div>
    //                                         </div>
    //                                     </div>
    //                                 </div>
    //                                 <p className='text-lg text-grayDark'>No conversation selected!</p>
    //                             </div>
    //                         </div> :
    //                         selectedDiscussion &&
    //                         <Chat setDiscussions={setDiscussions} selectedChat={selectedDiscussion}
    //                               removeDiscussion={removeDiscussion}/>
    //                     }
    //                 </div>
    //                 :
    //                 <div
    //                     className={cn('z-[100] md:hidden w-screen h-screen fixed inset-0 overflow-hidden overscroll-none', {
    //                         'hidden': !selectedDiscussion,
    //                     })}>
    //
    //                     <div
    //                         className={cn('md:hidden px-0 z-50  top-20 left-0 w-full border-t absolute border-t-white3 bg-white', {
    //                             'hidden': !selectedDiscussion,
    //                         })}>
    //                         <button
    //                             onClick={closeChat}
    //                             className='md:hidden select-none bg-white z-[100] my-1 mx-3 '>
    //                             <div className='gap-2 items-center flex rounded-full w-fit py-3 px-2'>
    //
    //                                 <div className='relative w-4 h-4'>
    //                                     <Image
    //                                         alt='back to messages'
    //                                         fill
    //                                         src='/icons/left-arrow.svg'
    //                                     />
    //                                 </div>
    //                                 <p className='text-lg text-black leading-7'>Back to messages</p>
    //                             </div>
    //                         </button>
    //                         {selectedDiscussion &&
    //                         <Chat setDiscussions={setDiscussions} selectedChat={selectedDiscussion}
    //                               removeDiscussion={removeDiscussion}/>}
    //                     </div>
    //                 </div>
    //             }
    //         </div>
    //     </div>
    // );
}

