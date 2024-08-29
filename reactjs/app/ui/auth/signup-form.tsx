'use client'

import React, {useEffect, useTransition} from "react";
import {useForm,} from 'react-hook-form';
import {useFormState} from 'react-dom'
import {registerUser} from "@/app/lib/auth";
import {useRouter} from "next/navigation";
import {setServerValidationErrors} from "@/app/lib/helpers";
import {Store, useStore} from "@/app/store/zustand";
import {User} from "@/app/types";
import ErrorMessages from "@/app/ui/error-msgs";
import {cn} from "../../lib/helpers";


interface LoginFormFields {
    name: string,
    last_name: string
    email: string
    password: string
    password_confirmation: string;
    terms: boolean
}

const initialState = {
    message: '',
    user: null
}


export default function SignupForm() {
    const [state, formAction] = useFormState(registerUser, initialState)
    const store: Store = useStore();

    const router = useRouter()

    const {
        setError,
        register,
        handleSubmit,
        getValues,
        formState: {errors}
    } = useForm<LoginFormFields>({
        mode: 'onTouched',
        defaultValues: {
            terms: true
        }
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


    const fields = {
        name: register('name', {required: 'Name is required'}),
        last_name: register('last_name', {required: 'Lastname is required'}),
        email: register('email', {required: 'Email is required'}),
        password: register('password', {required: 'Password is required'}),
        password_confirmation: register('password_confirmation', {
            required: 'Password confirmation is required',
            validate: (value) => getValues('password') === value || 'confirmation does not match password.',
        }),
        terms: register('terms'),
    };

    const [isPending, startTransition] = useTransition();

    return <form onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => {
            handleSubmit(formAction)()
        })
    }}>
        <div>
            <label htmlFor="name"
                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">First Name</label>
            <input type="name" id="name"
                   {...fields.name}
                   className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   placeholder="John"/>
        </div>
        <ErrorMessages errors={errors.name?.message}/>

        <div className={'mt-3'}>
            <label htmlFor="last_name"
                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Last Name</label>
            <input type="last_name" id="last_name"
                   {...fields.last_name}
                   className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   placeholder="Smith"/>
        </div>
        <ErrorMessages errors={errors.last_name?.message}/>

        <div className={'mt-3'}>
            <label htmlFor="email"
                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your
                email</label>
            <input type="email" id="email"
                   {...fields.email}
                   className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                   placeholder="name@company.com"/>
        </div>
        <ErrorMessages errors={errors.email?.message}/>

        <div className={'mt-3'}>
            <label htmlFor="password"
                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
            <input
                {...fields.password}
                type="password" id="password" placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
        </div>
        <ErrorMessages errors={errors.password?.message}/>

        <div className={'mt-3'}>
            <label htmlFor="password_confirmation"
                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password
                confirmation</label>
            <input
                {...fields.password_confirmation}
                type="password" id="password_confirmation" placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
        </div>
        <ErrorMessages errors={errors.password_confirmation?.message}/>

        <button
            disabled={isPending}
            type="submit"
            className={cn("mt-3 w-full text-white bg-primary-600 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800", {
                'bg-gray cursor-not-allowed': isPending,
                'hover:bg-primary-700 ': !isPending
            })}>
            Sign up
        </button>
    </form>
}
