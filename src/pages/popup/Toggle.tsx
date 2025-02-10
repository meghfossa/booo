'use client'

import { Field, Label, Switch } from '@headlessui/react'
import React from 'react'
export default function Toggle({ text, checked, onChange, onClick }: { text: string | React.ReactNode, checked: boolean, onChange: (checked: boolean) => void, onClick: () => void }) {
    return (
        <Field className="flex items-center w-full justify-between">
            <Switch
                checked={checked}
                onChange={onChange}
                className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-hidden data-checked:bg-red-600"
            >
                <span
                    aria-hidden="true"
                    className="pointer-events-none inline-block size-5 transform rounded-full bg-white ring-0 shadow-sm transition duration-200 ease-in-out group-data-checked:translate-x-5"
                />
            </Switch>
            <Label as="span" className="ml-3">
                <span onClick={onClick} className={onClick === undefined ? "underline" : undefined}>{text}</span>{' '}
            </Label>
        </Field>
    )
}