import {component$} from "@builder.io/qwik";

interface LabelProps {
    labelFor: string;
    text: string;
}

export const Label = component$<LabelProps>(({labelFor, text}) => {
    return (
        <label for={labelFor} class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            {text}
        </label>
    )
})