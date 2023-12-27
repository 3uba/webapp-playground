import {component$, Slot} from "@builder.io/qwik";

interface BoxProps {
    title: string;
}

export const Box = component$<BoxProps>(({title}) => {
    return (
        <div class="block mt-2 mb-2 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h5>
            <Slot name={"children"} />
        </div>
    )
})