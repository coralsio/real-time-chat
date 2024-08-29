import {cn, isImage} from "@/app/lib/helpers";
import {Avatar} from "@nextui-org/react";
import Seen from "@/app/ui/icons/seen";
import {Message as MessageType, SimpleFile, User} from "@/app/types";
import {useStore} from "@/app/store/zustand";
import PreviewAttachment from "@/app/ui/chat/preview-attachment";


export default function Message({message, groupMessages}: { message: MessageType; groupMessages: boolean }) {

    const user: User | null = useStore(state => state.user);
    const fromCurrentUser = message.sender.id === user?.id;

    const seen = !!message.seen;


    return <div className={cn('rounded-lg p-3', {
        'col-start-1 col-end-8': !fromCurrentUser,
        'col-start-6 col-end-13 ': fromCurrentUser
    })}>
        <div className={cn("flex items-center", {
            'flex-row': !fromCurrentUser,
            'justify-start flex-row-reverse': fromCurrentUser
        })}>
            <div
                className={cn("flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0")}
            >

                <Avatar className={cn('relative min-h-9 min-w-9 w-9 h-9', {
                    'order-1': fromCurrentUser,
                    'order-2': !fromCurrentUser,
                })} src={message.sender.picture_thumb as string} fallback={
                    <Avatar className='relative w-9 h-9 min-w-9 min-h-9' name={message.sender.name}/>
                }/>

            </div>
            <div
                className={cn("relative text-sm bg-white py-2 px-4 shadow rounded-xl", {
                    'mr-3': fromCurrentUser,
                    'ml-3': !fromCurrentUser,
                    'bg-indigo-100': fromCurrentUser
                })}
            >
                <div className={'text-wrap break-words whitespace-pre-wrap max-w-md'}>

                    {message?.media?.length ? <div className={'flex flex-wrap gap-1 p-2 m-1'}>

                        {message?.media?.map((m: SimpleFile, index: number) =>

                            <a href={m.url} download target={'_blank'} key={`${m.file_name}_${index}_m`}>
                                <div className={cn(
                                    `relative flex justify-between `, {
                                        'w-[240px] rounded-lg': !isImage(m.mime_type),
                                        'border-gray-300': !isImage(m.mime_type) && fromCurrentUser,
                                        'bg-gray3': !isImage(m.mime_type) && !fromCurrentUser,
                                    }
                                )} key={m.file_name}>
                                    <PreviewAttachment
                                        key={`${index}_${m.file_name}_p`}
                                        url={m.url}
                                        name={m.file_name}
                                        type={m.mime_type}
                                        size={m.size}
                                    />

                                </div>
                            </a>
                        )}
                    </div> : ''}

                    {message.body}
                </div>

                <div className={cn('flex justify-end', {
                    'flex-row-reverse': !fromCurrentUser
                })}>

                    {seen ?
                        <div className={cn('w-6 h-6 flex justify-center items-center mr-1 justify-items-end', {
                                'hidden': !fromCurrentUser
                            }
                        )}>
                            <Seen/>
                        </div>
                        : null}

                    <p className={cn("text-xs text-black flex my-1", {
                        // "justify-start": !fromCurrentUser
                    })}>
                        {message.formatted_created_at}
                    </p>

                </div>
            </div>
        </div>
    </div>;

    return (
        <div className={cn('flex items-end', {
            'flex-row-reverse': fromCurrentUser,
        })}>

            <div className={cn("flex flex-col w-full mx-2", {
                "order-1 items-end": fromCurrentUser,
                "order-2 items-start": !fromCurrentUser
            })}>

                <div className={cn("px-4 py-2 rounded-lg  max-w-96 bg-primary",
                    {
                        " text-primary-foreground": fromCurrentUser,
                        "bg-white3 text-black": !fromCurrentUser,
                        "rounded-br-none": !groupMessages && fromCurrentUser,
                        "rounded-bl-none": !groupMessages && !fromCurrentUser,
                        " mr-9 mb-0.5": groupMessages && fromCurrentUser,
                        " ml-9 mb-0.5": groupMessages && !fromCurrentUser,
                        "px-4 py-2": message.body,
                        "p-1": message.media.length > 0
                    })}>
                    <div className={cn('', {
                        'text-wrap break-words whitespace-pre-wrap': !!message.body
                    })}>
                        {message?.media?.length ? <div className={'flex flex-wrap gap-1 p-2 m-1'}>

                            {message?.media?.map((m: SimpleFile, index: number) =>

                                <a href={m.url} download target={'_blank'} key={`${m.file_name}_${index}_m`}>
                                    <div className={cn(
                                        `relative flex justify-between `, {
                                            'w-[240px] rounded-lg': !isImage(m.mime_type),
                                            'bg-[#88c34a]': !isImage(m.mime_type) && fromCurrentUser,
                                            'bg-gray3': !isImage(m.mime_type) && !fromCurrentUser,
                                        }
                                    )} key={m.file_name}>
                                        <PreviewAttachment
                                            key={`${index}_${m.file_name}_p`}
                                            url={m.url}
                                            name={m.file_name}
                                            type={m.mime_type}
                                            size={m.size}
                                        />

                                    </div>
                                </a>
                            )}
                        </div> : ''}

                        {message.body ? <p className='max-md:max-w-52'> {message.body}</p> : ''}
                    </div>
                </div>


                <div className={cn('flex justify-end', {
                    'flex-row-reverse': !fromCurrentUser
                })}>

                    {seen ?
                        <div className={cn('w-6 h-6 flex justify-center items-center mr-1 justify-items-end', {
                                'hidden': groupMessages || !fromCurrentUser
                            }
                        )}>
                            <Seen/>
                        </div>
                        : null}
                    <p className={cn("text-xs text-black flex w-full my-1", {
                        "justify-end": fromCurrentUser,
                        "justify-start": !fromCurrentUser,
                        'hidden': groupMessages
                    })}>
                        {message.formatted_created_at}
                    </p>
                </div>

            </div>
            <Avatar className={cn('relative min-h-9 min-w-9 w-9 h-9', {
                'order-1': fromCurrentUser,
                'order-2': !fromCurrentUser,
                'hidden': groupMessages
            })} src={message.sender.picture_thumb as string} fallback={
                <Avatar className='relative w-9 h-9 min-w-9 min-h-9' name={message.sender.name}/>
            }/>
        </div>
    );
}
