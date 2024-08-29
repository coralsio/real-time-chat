'use client'

import React, {useEffect, useTransition} from "react";
import {useForm} from 'react-hook-form';
import {useFormState} from 'react-dom'
import {login} from "@/app/lib/auth";
import {useRouter} from "next/navigation";
import {useCookies} from 'next-client-cookies';
import {setServerValidationErrors} from "@/app/lib/helpers";
import {Store, useStore} from "@/app/store/zustand";
import {User} from "@/app/types";
import ErrorMessages from "@/app/ui/error-msgs";
import Link from "next/link";
import {cn} from "../../lib/helpers";


interface LoginFormFields {
    email: string,
    password: string
}

const initialState = {
    message: '',
    user: null
}


export default function LoginForm() {
    const [state, formAction] = useFormState(login, initialState)
    const store: Store = useStore();

    const router = useRouter()
    const cookies = useCookies();

    const {
        setError,
        register,
        handleSubmit,
        formState: {errors, isSubmitting}
    } = useForm<LoginFormFields>({
        mode: 'onTouched'
    });

    useEffect(() => {
        if (!state.user && !state.errors) {
            return;
        }

        if (state.errors) {
            setServerValidationErrors(state.errors, setError)
        } else {
            store.setUser(state.user as User)
        }

        if (state?.status === 'success') {
            router.push('/chat')
        }

    }, [state])

    useEffect(() => {
        store.reset()
        cookies.remove('user');
    }, [])

    const fields = {
        email: register('email', {required: 'Email is required'}),
        password: register('password', {required: 'Password is required'})
    };

    const [isPending, startTransition] = useTransition();


    return <form onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => {
            handleSubmit(formAction)()
        })
    }}>
        <div>
            <label htmlFor="email"
                   className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Your
                email</label>
            <input type="email" id="email"
                   {...fields.email}
                   className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   placeholder="name@company.com"/>
        </div>
        <ErrorMessages errors={errors.email?.message}/>

        <div className={'mt-3'}>
            <label htmlFor="password"
                   className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Password</label>
            <input
                {...fields.password}
                type="password" id="password" placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
        </div>
        <ErrorMessages errors={errors.password?.message}/>

        <button disabled={isPending}
                type="submit"
                className={cn("mt-3 w-full text-white bg-primary-600 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800", {
                    'bg-gray cursor-not-allowed': isPending,
                    'hover:bg-primary-700 ': !isPending
                })}>
            Log in
        </button>
        <p className="text-sm font-light text-gray-500 dark:text-gray-400">
            Don’t have an account yet? <Link href="/sign-up"
                                             className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign
            up</Link>
        </p>
    </form>
}