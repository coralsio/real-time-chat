import {Card, CardBody} from "@nextui-org/card";
import CustomTextarea from "@/app/ui/fields/custom-textarea";
import Image from "next/image";
import {SubmitHandler, useForm} from "react-hook-form";
import {cn, isExcel, isImage, isPDF, isPowerPoint, isWord, request} from "@/app/lib/helpers";
import {Button} from "@nextui-org/button";
import {Divider} from "@nextui-org/divider";
import Send from "@/app/ui/icons/send";
import {Discussion, Message, User} from "@/app/types";
import {MessengerStore, useMessengerStore} from "@/app/store/messenger-store";
import EmojiPicker from 'emoji-picker-react';
import React, {useEffect, useRef, useState} from "react";
import {useStore} from "@/app/store/zustand";
import Echo from "laravel-echo";
import EchoManager from "@/app/lib/echo-manager";
import {uploadToS3} from "@/app/lib/media";
import PreviewAttachment from "@/app/ui/chat/preview-attachment";
import {Spinner} from "@nextui-org/spinner";
import axios from "@/app/lib/axios/axios";
import {AxiosResponse} from "axios";
import ErrorMessages from "@/app/ui/error-msgs";

interface MessageFields {
    message: string,
}

interface FileObject {
    file: File
    url: string
}

const allowedTypeMethods: any = {
    isImage,
    isPDF,
    isExcel,
    isPowerPoint,
    isWord
};

const MAX_FILE_SIZE: number = 1 * 1024 * 1024; // 1 MB in bytes

export default function ChatInput({discussion}: { discussion?: Discussion }) {

    const {
        setError,
        control,
        register,
        setValue,
        watch,
        reset,
        handleSubmit,
        getValues,
        formState: {errors, isSubmitting}
    } = useForm<MessageFields>({
        mode: 'onTouched',
        defaultValues: {
            message: '',
        }
    });
    const fields = {
        message: register('message')
    }


    const messengerStore: MessengerStore = useMessengerStore();

    const [files, setFiles] = useState<FileObject[]>([]);
    const [filesError, setFilesError] = useState<string | []>('');
    const [openEmojiPicker, setOpenEmojiPicker] = useState<boolean>(false);

    const onSubmit: SubmitHandler<MessageFields> = async (fields: MessageFields) => {

        if (!watchMessage && !files?.length) return;

        const response = await request('post', `messaging/messages`, {
            discussion_id: discussion?.id,
            second_participation_id: discussion?.receivers[0]?.id,
            body: fields.message,
            status: files?.length ? 'draft' : 'active'
        }, setError, {
            returnResponse: true,
            showErrorMsg: false,
            showSuccessMsg: false
        });

        if (response !== false) {

            const message: Message = response.data;

            await Promise.all(
                files?.map(async ({file}: FileObject) => {
                    return await uploadToS3(
                        file, file.name, message.id,
                        'Message', 'message-files',
                        file.type, file.size, 0, '', undefined, false
                    )
                }) || []
            ).then((uploadedMediaFiles) => {

                if (files?.length) {
                    axios.post(`messaging/messages/broadcast/${message.id}`)
                        .then((broadcastMessageResponse: AxiosResponse) => {
                            successResponse(broadcastMessageResponse.data.data)
                        })
                } else {
                    successResponse(message)
                }
            })
        }
    }

    const successResponse = (message: Message) => {
        const d: Discussion = messengerStore.selectedDiscussion as Discussion;
        setFiles([]);
        d.messages = [message, ...d.messages];
        messengerStore.setSelectedDiscussion(d);
        reset();
        setFilesError('')
    }

    const watchMessage = watch('message');

    const user: User = useStore(state => state.user) as User;

    const [localEcho, setLocalEcho] = useState<Echo | null>();
    const [typing, setTyping] = useState<string>('');

    const emojiPickerRef = useRef<HTMLDivElement | any>(null);
    const emojiPickerIconRef = useRef<HTMLImageElement | any>(null);


    const handleDocumentClick = (event: MouseEvent) => {
        try {
            if (emojiPickerIconRef?.current?.contains(event.target)) {
                return;
            }
            if (!emojiPickerRef?.current?.contains(event.target)) {
                setOpenEmojiPicker(false);
            }
        } catch (error) {
            return null
        }
    }

    useEffect(() => {
        document.addEventListener("click", handleDocumentClick, false);

        return () => {
            document.removeEventListener('click', handleDocumentClick)
        }
    }, []);

    useEffect(() => {

        const privateEcho = EchoManager.createPrivateEcho(user);

        if (!messengerStore.selectedDiscussion?.id || !privateEcho) return;

        setLocalEcho(privateEcho);

        const _echo = privateEcho.private(`openedDiscussion.${messengerStore.selectedDiscussion?.id}`)
            .listenForWhisper('typing', (e: any) => {
                setTyping(`<b>${e.name} </b> is typing ...`)
            }).listenForWhisper('stoppedTyping', (e: any) => {
                setTyping('');
            }).listenForWhisper('updateMessageSeen', (e: any) => {
                const d: Discussion = messengerStore.selectedDiscussion as Discussion;

                d.messages = d.messages.map((m: Message) => {
                    m.seen = true;
                    return m;
                })
                messengerStore.setSelectedDiscussion(d)
            });

        return () => {
            _echo.stopListeningForWhisper('typing')
            _echo.stopListeningForWhisper('stoppedTyping')
            _echo.stopListeningForWhisper('updateMessageSeen')
        }

    }, [messengerStore.selectedDiscussion])

    useEffect(() => {

        if (!localEcho) return;

        const event = watchMessage ? 'typing' : 'stoppedTyping';

        localEcho.private(`openedDiscussion.${messengerStore.selectedDiscussion?.id}`)
            // @ts-ignore
            .whisper(event, {
                name: user.full_name
            });

    }, [watchMessage])

    const onFilesChange = (e: any) => {
        setFilesError('');

        const _filesErrors: string[] = [];

        const files = [...e.target.files].filter(f => {

            if (f.size > MAX_FILE_SIZE) {
                _filesErrors.push(`file ${f.name} size exceeds 1 MB. Please select a smaller file`);
                return false;
            }

            for (let methodType in allowedTypeMethods) {
                if (allowedTypeMethods[methodType](f.type)) {
                    return true;
                }
            }

            _filesErrors.push(`file ${f.name} not allowed`);
            return false;
        })

        if (_filesErrors.length) {
            setFilesError(_filesErrors as [])
        }

        if (files.length > 3) {
            setFilesError('only 3 files are allowed on a time');
        }

        const filesObject = [...files].splice(0, 3).map(file => {
            return {
                file: file,
                url: URL.createObjectURL(file)
            }
        })

        setFiles(filesObject);
    }


    return <div>

        {typing && <small dangerouslySetInnerHTML={{__html: typing}}/>}

        <div
            className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4"
        >

            <div ref={emojiPickerRef} id={'emoji-picker-wrapper'}>
                <EmojiPicker
                    style={{
                        top: '181px',
                        right: '165px',
                        position: 'absolute',
                        zIndex: 1000
                    }}
                    open={openEmojiPicker}
                    // @ts-ignore
                    emojiStyle={'native'} onEmojiClick={(emoji) => {
                    setValue('message', getValues('message') + emoji.emoji)
                }}/>
            </div>

            <div>
                <button
                    className="relative flex items-center justify-center text-gray-400 hover:text-gray-600"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                        ></path>
                    </svg>

                    <input
                        accept=".pdf,.doc,.docx,.xlsx,.mp4,.png,.jpg"
                        className={'absolute cursor-pointer opacity-0 z-100'}
                        type={'file'} multiple onChange={onFilesChange}/>
                </button>

            </div>
            <div className="flex-grow ml-4">
                <div className="relative w-full">
                    <input
                        readOnly={isSubmitting}
                        onKeyDown={(e: any) => {
                            if (isSubmitting) return;

                            if (e.code !== 'Enter') return;

                            e.preventDefault();
                            if (watchMessage || files?.length) handleSubmit(onSubmit)()
                        }}
                        placeholder='Type a message...'
                        value={getValues('message')}
                        {...fields.message}
                        type="text"
                        className={cn('flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10', {
                            'bg-white2': isSubmitting
                        })}
                    />

                    <button
                        ref={emojiPickerIconRef}
                        onClick={e => {
                            setOpenEmojiPicker(!openEmojiPicker)
                        }}
                        className="absolute flex items-center justify-center h-full w-12 right-0 top-0 text-gray-400 hover:text-gray-600"
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
                                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div className="ml-4">
                <button
                    onClick={e => {
                        if (!isSubmitting) {
                            handleSubmit(onSubmit)()
                        }
                    }}
                    disabled={isSubmitting || (!watchMessage && !files?.length)}
                    className={cn("flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0", {
                        'bg-gray cursor-not-allowed hover:bg-gray-500': isSubmitting || (!watchMessage && !files?.length)
                    })}
                >
                    <span>Send</span>
                    <span className="ml-2">
                  <svg
                      className="w-4 h-4 transform rotate-45 -mt-px"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    ></path>
                  </svg>
                </span>
                </button>
            </div>
        </div>

        {files?.length ? <div className={'flex flex-wrap gap-1 p-2 m-1 bg-white rounded-xl px-4'}>

            {files?.map((f: FileObject, index: number) => <div className={cn(
                'relative bg-zinc-300 rounded-xl flex justify-between',
                'w-[240px]' && isImage(f.file.type)
                )} key={f.file.name}>
                    <PreviewAttachment
                        key={`${index}_${f.file.name}`}
                        url={f.url}
                        name={f.file.name}
                        type={f.file.type}
                        size={f.file.size}
                    />
                    <button
                        onClick={(e) => {
                            setFilesError('')
                            e.preventDefault();
                            setFiles((prevFiles: FileObject[]) =>
                                prevFiles?.filter((_f: FileObject) => _f.file.name !== f.file.name)
                            )
                        }}
                        className={'absolute w-4 h-4 rounded-full bg-white hover:bg-gray-100 z-10 -right-1 -top-1 flex items-center justify-center'}>

                        <Image src={'/icons/close-circle-outlined.svg'}
                               width={16} height={16}
                               alt={'X'}/>

                    </button>
                </div>
            )}
        </div> : ''}


        {filesError.length ||
        // @ts-ignore
        errors.body?.message || errors.message?.message
            ? <div className={'m-2'}>
                <ErrorMessages errors={filesError}/>

                <ErrorMessages
                    // @ts-ignore
                    errors={errors.body?.message || errors.message?.message}/>
            </div> : ''}
    </div>;
}
