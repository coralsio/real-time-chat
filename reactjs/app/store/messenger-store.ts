import {create} from 'zustand'
import {createJSONStorage, persist} from 'zustand/middleware'
import {Discussion, Message, Pagination, User} from "@/app/types";

type ACTIONS = {
    setSelectedDiscussion: (selectedDiscussion: Discussion | null) => void
    setOnlineUsers: (users: User[]) => void,
    setDiscussionsPagination: (discussionsPagination: Pagination | null) => void
    setUnreadMessagesCount: (count: number) => void;
    reset: () => void
}

type STATE = {
    selectedDiscussion: Discussion | null,
    onlineUsers: User[],
    discussionsPagination: Pagination | null;
    unreadMessagesCount: number
}

export type MessengerStore = ACTIONS & STATE

const initialState = {
    selectedDiscussion: null,
    onlineUsers: [],
    discussionsPagination: null,
    unreadMessagesCount: 0
}

export const useMessengerStore = create<MessengerStore>()(
    persist(
        (set, get) => ({
            ...initialState,
            reset: () => set(initialState),
            setSelectedDiscussion: (selectedDiscussion: Discussion | null) => set({selectedDiscussion}),
            setDiscussionsPagination: (discussionsPagination: Pagination | null) => set({discussionsPagination}),
            setOnlineUsers: (users: User[]) => set({onlineUsers: users}),
            setUnreadMessagesCount: (unreadMessagesCount: number) => set({unreadMessagesCount})
        }),
        {
            name: 'messenger-store',
            storage: createJSONStorage(() => localStorage),
            partialize: state => ({
                unreadMessagesCount: state.unreadMessagesCount
            })
        },
    )
)