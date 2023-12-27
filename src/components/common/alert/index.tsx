import {component$} from "@builder.io/qwik";
import {AlertType} from "~/resources/enums/AlertType";

export interface IAlert {
    message: string;
    isVisible: boolean;
    type: AlertType;
}

export interface AlertProps {
    alert: IAlert;
}

export const Alert =  component$<AlertProps>(({alert: {message, isVisible, type}}) => {
    return (
        <div class={`
            ${!isVisible ? 'hidden' : ''} 
            ${type == AlertType.Success ? 'text-green-300 bg-green-100 border-green-300' : ''} 
            ${type == AlertType.Error ? 'text-red-300 bg-red-100 border-red-300' : ''}
            ${type == AlertType.Info ? 'text-blue-300 bg-blue-100 border-blue-300' : ''}
            ${type == AlertType.Warning ? 'text-yellow-300 bg-yellow-100 border-yellow-300' : ''}
            mt-2 mb-2 w-1/4 flex items-center p-4 text-sm  border rounded-lg dark:bg-gray-800 transition-opacity opacity-100 animate-fadeOut`} role="alert">
            <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
            </svg>
            <span class={`font-medium`}>{message}</span>
        </div>
    );
});
