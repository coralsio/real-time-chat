import {formatBytes, isExcel, isImage, isPDF, isPowerPoint, isWord} from "@/app/lib/helpers";
import Image from "next/image";
import {toUpper, truncate} from "lodash";

interface FileProps {
    url: string;
    name: string;
    type: string;
    size: number
}

export default function PreviewAttachment({type, url, name, size}: FileProps) {
    const previewAttachments = () => {

        if (isImage(type)) {
            return <div className={'w-20 relative h-20'}>
                <Image fill={true} src={url} alt={name} className={'object-cover rounded-md'}/>
            </div>
        }

        let icon = '/icons/file.svg';

        const methods: any = {
            '/icons/pdf.svg': isPDF,
            '/icons/excel.svg': isExcel,
            '/icons/ppt.svg': isPowerPoint,
            '/icons/word.svg': isWord,
        };

        for (let _icon in methods) {
            if (methods[_icon](type)) {
                icon = _icon;
                break;
            }
        }
        return <div className={'w-full flex items-center gap-2 py-2 px-3 rounded-md'}>
            <div>
                <Image width={16} height={16} className={'w-8'} src={icon} alt={name}/>
            </div>
            <div className={'flex-1 text-gray-400 text-nowrap text-ellipsis overflow-hidden'}>
                <h4 className='overflow-hidden line-clamp-1'>{truncate(name,{length:20})}</h4>
                <span className={'text-xs'}>{toUpper(name.substring(name.indexOf('.')+1))} • {formatBytes(size)} </span>
            </div>
        </div>
    }

    return previewAttachments()
}