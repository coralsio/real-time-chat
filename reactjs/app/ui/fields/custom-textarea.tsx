import {Textarea, TextAreaProps} from "@nextui-org/input";import ErrorMessages from "@/app/ui/error-msgs";import {cn} from "@/app/lib/helpers";import {ClassValue} from "tailwind-variants";interface HSInputProps extends TextAreaProps {    errors?: string | [] | undefined,    fieldProps?: object,    inputWrapper?: string,    labelClass?: ClassValue    topHelpText?: string,    hint?: string,    maxLength?: number,    className?: string}export default function CustomTextarea({errors, fieldProps, ...props}: HSInputProps) {    return <>        <div className={'relative'}>            {props.topHelpText &&                <span className={'text-xs absolute right-3.5 text-gray'}>{props.topHelpText}</span>            }            <Textarea                maxRows={3}                {...props}                labelPlacement={props.labelPlacement || 'outside'}                radius={props.radius || 'full'}                size={props.size || 'md'}                {...fieldProps}                classNames={{                    label: props.labelClass || "text-sm text-black3 tracking-tight font-bold mb-1 z-0",                    inputWrapper: cn('', props.classNames?.inputWrapper || '')                }}                isInvalid={props.isInvalid}                maxLength={props.maxLength}            />            {props.hint &&                <p className="text-default-500 text-xs mb-4">{props.hint}</p>            }            <ErrorMessages errors={errors}/>        </div>    </>}