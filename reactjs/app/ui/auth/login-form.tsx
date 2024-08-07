'use client'

import React, {useEffect} from "react";
import {useForm} from 'react-hook-form';
import {useFormState} from 'react-dom'
import {login} from "@/app/lib/auth";
import {useRouter} from "next/navigation";
import {useCookies} from 'next-client-cookies';
import {setServerValidationErrors} from "@/app/lib/helpers";
import {Store, useStore} from "@/app/store/zustand";
import {User} from "@/app/types";
import ErrorMessages from "@/app/ui/error-msgs";


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
            router.push('/dashboard')
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

    return <form onSubmit={handleSubmit(formAction)}>
        <div>
            <label htmlFor="email"
                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your
                email</label>
            <input type="email" id="email"
                   {...fields.email}
                   className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   placeholder="name@company.com" />
        </div>
        <ErrorMessages errors={errors.email?.message}/>

        <div>
            <label htmlFor="password"
                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
            <input
                {...fields.password}
                type="password" id="password" placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
        </div>
        <ErrorMessages errors={errors.password?.message}/>

        <button type="submit"
                className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
            Log in
        </button>
        <p className="text-sm font-light text-gray-500 dark:text-gray-400">
            Don’t have an account yet? <a href="#"
                                          className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign
            up</a>
        </p>
    </form>
}