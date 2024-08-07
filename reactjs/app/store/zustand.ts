import {create} from 'zustand'import {createJSONStorage, persist} from 'zustand/middleware'import {User} from "@/app/types";import SecureStorage from "@/app/store/secure-storage";type ACTIONS = {    setUser: (user: User) => void;    reset: () => void;}type STATE = {    user: User | null}export type Store = ACTIONS & STATEconst initialState = {    user: null}export const useStore = create<Store>()(    persist(        (set, get) => ({            ...initialState,            setUser: (user: User) => set({user: user}),            reset: () => set(initialState),        }),        {            name: 'real-time-chat-storage', // name of the item in the storage (must be unique)            storage: createJSONStorage(() => SecureStorage),            partialize: state => ({                user: state.user            })        }    ))