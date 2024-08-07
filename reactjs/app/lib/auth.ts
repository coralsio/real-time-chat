'use server'

import axios from "@/app/lib/axios/axios";
import {cookies} from "next/headers";
import {AxiosResponse} from "axios";


export async function login(prevState: any, data: object) {
    return await axios.post('/auth/login', data).then(async (response: AxiosResponse) => {
        return {
            user: await doLogin(response.data.data),
            status: response.data.status,
            message: response.data.message
        }
    }).catch(e => {
        return e.response.data
    })
}

export async function doLogin(user: any) {
    // Save the session in a cookie
    const dataUserToStore = {
        id: user.id,
        full_name: user.full_name,
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions,
        authorization: user.authorization
    }

    cookies().set('session' as any, JSON.stringify(dataUserToStore) as any, {
        httpOnly: true
    } as any);

    cookies().set('user' as any, JSON.stringify({
        full_name: user.full_name,
        roles: user.roles,
        picture_thumb: user.picture_thumb
    }) as any)

    return user;
}

export async function getSession(key: string = 'session') {
    const session = cookies().get(key as any)?.value;
    if (!session) return null;
    return JSON.parse(session)
}

export async function logout() {
    await axios.post('auth/logout').then((response: AxiosResponse) => {
    }).catch(err => {
        console.log(err);
    })
}


export async function doLogout() {
    // Destroy the session
    cookies().delete('session' as any);
    cookies().delete('user' as any);
}


export async function registerUser(prevState: any, data: object) {

    return await axios.post('/auth/register', data).then(async (response: AxiosResponse) => {
        return {
            user: await doLogin(response.data.data),
            status: response.data.status,
            message: response.data.message
        }
    }).catch(e => {
        return e.response.data
    })
}