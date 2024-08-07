import {Discussion} from "@/app/types";
import {Avatar} from "@nextui-org/react";
import {cn} from "@/app/lib/helpers";
import {MessengerStore, useMessengerStore} from "@/app/store/messenger-store";

export default function Conversation({discussion}: { discussion: Discussion }) {
    const messengerStore: MessengerStore = useMessengerStore();

    return (
        <div
            className={cn('flex items-center rounded-md justify-between gap-4 bg-transparent ')}>
            <div className='flex items-center gap-2'>
                <div className='relative w-10 h-10'>
                    {discussion.receivers[0].picture_thumb ?
                        <Avatar
                            src={discussion?.receivers[0]?.picture_thumb as string}
                            className='h-9 w-9 text-sm'
                        /> :
                        <Avatar
                            name={discussion.receivers[0].full_name}
                            className='h-9 w-9 text-large'
                        />
                    }
                </div>
                <div className='flex flex-col justify-between'>
                    <p className={cn('text-base', {
                        'font-bold': discussion.id === messengerStore.selectedDiscussion?.id
                    })}>
                        {discussion.receivers[0].full_name}
                    </p>
                </div>
            </div>
            <div className={'flex flex-col h-14 justify-between'}>
                <p className={cn('text-indigo-700 text-sm font-medium flex justify-end'
                )}>{discussion.messages[0]?.created_at_for_humans}</p>

                {discussion.unread_counts ?
                    <p className='flex items-center justify-center ml-auto text-xs text-white bg-red-500 h-4 w-4 rounded leading-none'>{discussion.unread_counts}</p>
                    : ''
                }
            </div>
        </div>
    );
}