import {Card, CardBody} from "@nextui-org/card";
import {Dropdown, DropdownItem, DropdownMenu, DropdownTrigger} from "@nextui-org/dropdown";
import {Button} from "@nextui-org/button";
import Image from "next/image";
import {Avatar} from "@nextui-org/react";
import {cn} from "@/app/lib/helpers";
import {Discussion, User} from "@/app/types";
import {MessengerStore, useMessengerStore} from "@/app/store/messenger-store";
import {useEffect, useState} from "react";
import axios from "@/app/lib/axios/axios";
import {Store, useStore} from "@/app/store/zustand";

export default function ChatHeader({
                                       discussion,
                                       removeDiscussion
                                   }: { discussion: Discussion, removeDiscussion: (discussion: Discussion) => void }) {
    const [onlineUsers, setOnlineUsers] = useState<User[]>(useMessengerStore(state => state.onlineUsers))

    const [isReceiverOnline, setIsReceiverOnline] = useState<boolean>(!!onlineUsers.find((user: User) => user.id === discussion.receivers[0].id));
    const setSelectedDiscussion = useMessengerStore(state => state.setSelectedDiscussion);

    const store: Store = useStore();

    useEffect(() => {
        return useMessengerStore.subscribe((state: MessengerStore, prevState: MessengerStore) => {
            setIsReceiverOnline(!!state.onlineUsers.find((user: User) => user.id === state.selectedDiscussion?.receivers[0].id));
            setOnlineUsers(state.onlineUsers);
        })
    }, [])

    useEffect(() => {
        setIsReceiverOnline(!!onlineUsers.find((user: User) => user.id === discussion.receivers[0].id));
    }, [discussion, onlineUsers])


    const deleteConversation = async (discussion: Discussion) => await axios.post(`/messaging/discussions/${discussion.id}/delete-conversation`)
        .then(response => {
            setSelectedDiscussion(null)
            removeDiscussion(discussion);
            return true;
        })


    return <div className='max-h-20 h-full'>
        <Card radius={'md'} shadow={'sm'} className='bg-transparent'>
            <CardBody className='flex-row  justify-between h-13'>
                <div className='flex items-center gap-2'>
                    <div className='relative w-12 h-12'>
                        {discussion.receivers[0].picture_thumb ?
                            <Image
                                src={discussion.receivers[0].picture_thumb || '/images/missing-img.png'}
                                fill
                                className=' rounded-full'
                                alt='profile-pic'
                            /> :
                            <Avatar
                                name={discussion.receivers[0].full_name}
                                className='h-12 w-12 text-large'
                            />
                        }
                    </div>
                    <div className='flex flex-col w-fit justify-center'>
                        <p className='text-large font-bold'>{discussion.receivers[0].full_name}</p>
                        {isReceiverOnline &&
                        <div className='flex items-center '>
                            <div className={cn('w-2 h-2 rounded-full mr-1 bg-primary'
                            )}></div>
                            <p className='font-medium text-sm text-[#5C5C5C]'>Active Now</p>
                        </div>
                        }
                    </div>
                </div>
                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            variant="bordered"
                            className='w-10 h-10 p-0 gap-0 min-w-10'
                            radius={"full"}
                        >
                            <div className='relative rounded-full h-6 w-6 flex justify-center items-center '>
                                <Image
                                    src="/icons/dots.svg"
                                    fill
                                    alt=""
                                    className="object-contain rotate-90 inline-block"
                                />
                            </div>
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Static Actions">
                        <DropdownItem onPress={() => setSelectedDiscussion(null)}>Close Chat</DropdownItem>
                        <DropdownItem className="text-danger" color="danger"
                                      onPress={() => {
                                          store.setObjectAction({
                                              object: discussion,
                                              title: `Delete conversation with [${discussion.receivers.map((r: User) => r.full_name).join(', ')}]`,
                                              action: 'delete',
                                              message: `Are you sure want to delete Conversation with [${discussion.receivers.map((r: User) => r.full_name).join(', ')}]`,
                                              onConfirmed: async (): Promise<boolean> => {
                                                  return await deleteConversation(discussion)
                                              }
                                          });
                                      }}>
                            Delete Conversation
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </CardBody>
        </Card>
    </div>
}
