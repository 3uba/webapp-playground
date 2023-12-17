import {component$, $, useSignal, Signal, useTask$, useContext, useStore} from "@builder.io/qwik";
import modal from "../../tools/modal";
import {UserContext} from "~/root";

export enum AlertType {
    Success = "green",
    Error = "red",
}

export default component$(() => {
    const user = useContext(UserContext)
    const modalWasOpened = useSignal(0)
    const messageAlert = useStore({ message: "", isVisible: false, type: AlertType })

    const showAlert = $((message: string, alertType: AlertType) => {
        if (messageAlert.isVisible) {
            return;
        }
        messageAlert.message = message;
        messageAlert.isVisible = true;
        messageAlert.type = alertType;
        console.log(messageAlert)
        setTimeout(()=> {
            messageAlert.isVisible = false
        },3500);
    })

    const openModal = $(() => {
        if (modalWasOpened.value === 0) {
            modal.subscribeProvider((provider) => {
                user.value = {
                    address: provider.address ?? "",
                    network: provider.chainId ?? 0
                }

                if (user.value.address != "") {
                    showAlert("Connected successfully", AlertType.Success)
                }
                if (user.value.address == "") {
                    showAlert("Disconnected successfully", AlertType.Success)
                }
            })
            modalWasOpened.value = 1
        }
        modal.open()
    })

    return (
        <div class={"bg-black h-screen"}>
            <button class={"m-4 text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 me-2 mb-2"} onClick$={openModal}>
                {user.value.address == "" ? "Connect" : "Open modal"}
            </button>

            <div class="block mt-2 mb-2 mx-4 p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Wallet Data</h5>
                { user.value.address != "" || user.value.network != 0 ? (
                    <>
                        <p class="font-normal text-gray-700 dark:text-gray-400">Address: {user.value.address}</p>
                        <p class="font-normal text-gray-700 dark:text-gray-400">Network: {user.value.network}</p>
                    </>
                ) : <div class={"text-white"}>Not connected yet</div> }
            </div>

            <div class={`${!messageAlert.isVisible ? 'hidden' : ''} mt-2 mb-2 mx-4 flex items-center p-4 text-sm text-${messageAlert.type}-800 border border-${messageAlert.type}-300 rounded-lg bg-${messageAlert.type}-50 dark:bg-gray-800 dark:text-${messageAlert.type}-400 dark:border-${messageAlert.type}-800`} role="alert">
                <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                </svg>
                <span class="font-medium">{messageAlert.message}</span>
            </div>
        </div>
    );
});
