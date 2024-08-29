'use client'

import {request} from "@/app/lib/helpers";
import AxiosPublic from "@/app/lib/axios/public";
import {toast} from "react-hot-toast";


export async function uploadToS3(file: File | Blob, file_name: string, model_id: number, model_type: string, collection: string, mime_type: string, fileSize: number | undefined, is_public: 1 | 0, media_id: string | undefined, uuid?: string, showSuccessMessage: boolean = true) {
    //get pre-signed url from backend
    const preSignedUrlResponse = await request('post', 'media/get-pre-signed-url', {
        "file_name": file_name,
        "model_id": model_id,
        "model_type": model_type,
        "collection": collection,
        'is_public': is_public
    }, null, {
        returnResponse: true,
        showSuccessMsg: false,
    })
    if (!preSignedUrlResponse) {
        return;
    }

    let pre_signed_url = preSignedUrlResponse.data.pre_signed_url;
    let key = preSignedUrlResponse.data.key;

    //upload the file to s3

    let storeMediaResponse = {};

    const response = await AxiosPublic.put(pre_signed_url, file, {
        headers: {
            'Content-Type': mime_type,
        },
    }).then(response => {
    }).then(async () => {
        //submit to backend
        const mediaResponse = await request('post', 'media/store-media', {
            "file_name": file_name,
            "media_id": media_id,
            "model_id": model_id,
            "model_type": model_type,
            "collection": collection,
            'mime_type': mime_type,
            'size': fileSize,
            'key': key,
            'is_public': is_public,
            uuid: uuid
        }, null, {
            returnResponse: true,
            showSuccessMsg: false
        })
        if (mediaResponse) {
            if (showSuccessMessage) {
                toast.success('The file has been saved successfully');
            }

            storeMediaResponse = mediaResponse.data;

            return true;
        } else {
            return false;
        }
    }).catch(e => {
        toast.error('Something went wrong. try again later.')
        console.error(e);
        return false;
    });

    return storeMediaResponse;
}
