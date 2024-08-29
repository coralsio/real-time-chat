import {twMerge} from "tailwind-merge";
import {ClassValue, clsx} from "clsx";
import {AxiosResponse} from "axios";
import axios from "@/app/lib/axios/client";
import {toast} from "react-hot-toast";

/**
 *
 * @param errors
 * @param setError
 */
export function setServerValidationErrors(errors: {}, setError: any): void {
    let shouldFocus = false;

    for (let field in errors) {
        setError(field, {
            type: 'Server Error',
            message: (errors as any)[field][0]
        }, {
            //focus on first error
            shouldFocus: shouldFocus ? false : shouldFocus = true
        })
    }
}

/**
 *
 * @param inputs
 */
export function cn(...inputs: ClassValue[]) {
    // Merge class names
    return twMerge(clsx(inputs));
}

export const isImage = (fileType: string): boolean => fileType.split('/')[0].toLowerCase() === 'image';


/**
 *
 * @param fileType
 */
export const isPDF = (fileType: string): boolean => fileType === 'application/pdf'

/**
 *
 * @param fileType
 */
export const isExcel = (fileType: string): boolean => [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
].includes(fileType)

/**
 *
 * @param fileType
 */
export const isWord = (fileType: string): boolean => [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
].includes(fileType)

/**
 *
 * @param fileType
 */
export const isPowerPoint = (fileType: string): boolean => [
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint'
].includes(fileType)

/**
 *
 * @param fileType
 */
export const isZipFile = (fileType: string): boolean => [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-zip'
].includes(fileType);

/**
 *
 * @param bytes
 * @param decimals
 */
export function formatBytes(bytes: number, decimals: number = 2) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals

    const sizes = ["Bytes", "KB", "MB", "GB"];

    let i = 0, size = bytes;

    while (size >= k) {
        size /= k;
        i++;
    }

    return `${parseFloat(size.toFixed(dm))} ${sizes[i]}`
}

/**
 *
 * @param method
 * @param url
 * @param fields
 * @param setError
 * @param opts
 */
export async function request(method: 'post' | 'patch' | 'put' = 'post', url: string, fields: object, setError: any = null, opts: any = {}): Promise<any> {
    return await axios[method](url, fields).then((response: AxiosResponse) => {
        if (opts.hasOwnProperty('showSuccessMsg') ? opts.showSuccessMsg : true) {
            toast.success(response.data.message || 'success');
        }

        return opts?.returnResponse ? response.data : true;
    }).catch(e => {
        if (opts.hasOwnProperty('showErrorMsg') ? opts.showErrorMsg : true) {
            toast.error(e.response.data.message)
        }
        if (setError && e.response.data?.errors) {
            setServerValidationErrors(e.response.data?.errors, setError)
        }
        return false;
    })
}