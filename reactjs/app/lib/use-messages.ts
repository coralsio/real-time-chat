import {Discussion, Message, Pagination, User} from "@/app/types";
import {useEffect, useState} from "react";
import Echo from "laravel-echo";
import axiosClient from "@/app/lib/axios/client";
import {AxiosResponse} from "axios";
import {MessengerStore, useMessengerStore} from "@/app/store/messenger-store";
import {useStore} from "@/app/store/zustand";
import EchoManager from "@/app/lib/echo-manager";


export default function useMessages(openDiscussionId?: string | number | null) {
    const messengerStore: MessengerStore = useMessengerStore();

    const [newMessage, setNewMessage] = useState<Message | null>();
    const [discussions, setDiscussions] = useState<Discussion[]>([])
    const userObject: User = useStore(state => state.user) as User;
    const [onlineUsers, setOnlineUsers] = useState<User[]>([])
    const [localPrivateEcho, setLocalPrivateEcho] = useState<Echo | null>();
    const [messagesChannelName, setMessagesChannelName] = useState<string>('')
    const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(messengerStore.selectedDiscussion);
    const [loadingDiscussions, setLoadingDiscussions] = useState<boolean>(true);

    /**
     *
     * @param existsDiscussion
     * @param newMessage
     */
    function updateExistsDiscussion(existsDiscussion: Discussion, newMessage: Message) {
        existsDiscussion.messages.unshift(newMessage);
        existsDiscussion.messages_count += 1;
        // if the received message is for the the selected discussion,
        // we will emit an event to mark the message as read.
        if (localPrivateEcho && existsDiscussion.id === messengerStore.selectedDiscussion?.id) {
            localPrivateEcho.connector.pusher.send_event(
                'MarkDiscussionAsRead',
                JSON.stringify({
                    did: selectedDiscussion?.id,
                    uid: userObject.id,
                    m_date: newMessage.created_at
                }),
                messagesChannelName
            );
            messengerStore.setSelectedDiscussion(existsDiscussion);

            //TODO::For now we assume the discussion between two participations
            localPrivateEcho
                .private(`openedDiscussion.${existsDiscussion.id}`)
                // @ts-ignore
                .whisper('updateMessageSeen')

        } else {
            existsDiscussion.unread_counts += 1;
        }

        setDiscussions(prevDiscussions => {
            return sortDiscussion(prevDiscussions.map((prevDiscussion: Discussion) =>
                prevDiscussion.id === existsDiscussion.id ? existsDiscussion : prevDiscussion
            ))
        })
    }

    /**
     *
     * @param discussionId
     */
    function findDiscussion(discussionId: number): Discussion | undefined {
        return discussions.find((discussion: Discussion) => discussion.id === discussionId)
    }

    /**
     *
     * @param discussions
     */
    function sortDiscussion(discussions: Discussion[]) {
        return discussions.sort((a: Discussion, b: Discussion) => {
            return (new Date(b.messages[0].created_at)).getTime() - (new Date(a.messages[0].created_at)).getTime()
        })
    }

    /**
     *
     * @param privateEcho
     */
    function joinOnline(privateEcho: Echo) {
        privateEcho.join('online').here((users: User[]) => {
            setOnlineUsers((prevOnlineUsers) => {
                return [...prevOnlineUsers, ...users]
            });
        }).joining((user: User) => {
            setOnlineUsers(prevUsers => [...prevUsers, user]);
        }).leaving((user: User) => {
            setOnlineUsers(prevUsers => prevUsers.filter((u: User) => u.id !== user.id));
        }).error((e: any) => {
            console.log('ERROR', e)
        })

        return () => {
            privateEcho.leave('online')
        };
    }

    /**
     *
     * @param privateEcho
     */
    function joinMessagesChannel(privateEcho: Echo) {

        const messagesChannelName = `messages.${userObject.id}`;

        setMessagesChannelName(messagesChannelName);

        const messagesChannel = privateEcho.private(messagesChannelName);

        messagesChannel.listen('.message.received', (message: Message) => {
            setNewMessage(message)
        })

        return () => {
            privateEcho.leave(messagesChannelName)
        }
    }

    /**
     *
     * @param discussionId
     */
    function fetchDiscussion(discussionId: number) {
        axiosClient.get(`/messaging/discussions/${discussionId}`)
            .then((response: AxiosResponse) => {
                const newDiscussion: Discussion = response.data.data

                const discussionsPagination: Pagination = messengerStore.discussionsPagination as Pagination;
                discussionsPagination.total++;
                discussionsPagination.count++;
                messengerStore.setDiscussionsPagination(discussionsPagination)

                setDiscussions(prevDiscussions => {
                    return sortDiscussion([...prevDiscussions, newDiscussion])
                });

            })
    }

    useEffect(() => {
        const privateEcho = EchoManager.createPrivateEcho(userObject);

        if (!privateEcho) return;

        setLocalPrivateEcho(privateEcho);

        const leaveOnlineChannel = joinOnline(privateEcho),
            leaveMessageChannel = joinMessagesChannel(privateEcho);

        return () => {
            leaveOnlineChannel()
            leaveMessageChannel()
        }

    }, [userObject])

    useEffect(() => {
        if (!newMessage) return;

        const existsDiscussion = findDiscussion(newMessage.discussion_id);

        existsDiscussion ?
            updateExistsDiscussion(existsDiscussion, newMessage) :
            fetchDiscussion(newMessage.discussion_id)

    }, [newMessage])

    useEffect(() => {
        messengerStore.setOnlineUsers(onlineUsers);
    }, [onlineUsers])

    useEffect(() => {
        axiosClient.get('messaging/discussions').then((response: AxiosResponse) => {
            const _discussions: Discussion[] = response.data.data

            setDiscussions(_discussions);
            messengerStore.setDiscussionsPagination(response.data.meta.pagination)

            setLoadingDiscussions(false);

            if (openDiscussionId) {
                const _discussion = _discussions.find((d: Discussion) => d.id == openDiscussionId)

                if (_discussion) {
                    messengerStore.setSelectedDiscussion(_discussion)
                }
            }
        })

        return () => {
            messengerStore.setSelectedDiscussion(null);
            messengerStore.setDiscussionsPagination(null);
        }
    }, [])

    useEffect(() => {
        return useMessengerStore.subscribe((state: MessengerStore, prevState: MessengerStore) => {
            setSelectedDiscussion(state.selectedDiscussion);

            if (state.selectedDiscussion) {
                const _d: Discussion = state.selectedDiscussion;

                setDiscussions(prevDiscussions => {
                    return sortDiscussion(prevDiscussions.map((prevDiscussion: Discussion) =>
                        prevDiscussion.id === _d.id ? _d : prevDiscussion
                    ))
                })
            }

        })
    }, [])

    return {
        onlineUsers,
        discussions,
        setDiscussions,
        selectedDiscussion,
        setSelectedDiscussion,
        loadingDiscussions
    }
}