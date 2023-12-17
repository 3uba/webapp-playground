import {component$, $, useContext, useStore, useVisibleTask$} from "@builder.io/qwik";
import web3modal from "../../tools/modal";
import {UserContext} from "~/root";
import {Alert, AlertType, IAlert} from "~/components/alert";

enum WalletActionsMessages {
    ChangedNetwork = "Successfully changed network",
    ChangedAddress = "Successfully changed address",
    Connected = "Connected successfully",
    Disconnected = "Disconnected successfully",
}

export default component$(() => {
    const user = useContext(UserContext)
    const messageAlerts = useStore<IAlert[]>([]);

    const addAlert = $((message: string, alertType: AlertType) => {
        const alert: IAlert = {
            message,
            isVisible: true,
            type: alertType,
        };

        messageAlerts.push(alert);

        setTimeout(()=> {
            messageAlerts.shift()
        },3500);
    })

    const subscribeProviderHandler = $((provider) => {
        const before = user.value

        user.value = {
            address: provider.address ?? "",
            network: provider.chainId ?? 0
        }

        if (user.value.address == before.address
            && user.value.network != before.network) {
            return addAlert(WalletActionsMessages.ChangedNetwork, AlertType.Success);
        }

        if (user.value.address != before.address
            && user.value.network == before.network) {
            return addAlert(WalletActionsMessages.ChangedAddress, AlertType.Success);
        }

        if (user.value.address != "") {
            return addAlert(WalletActionsMessages.Connected, AlertType.Success);
        }

        if (user.value.address == "") {
            return addAlert(WalletActionsMessages.Disconnected, AlertType.Success);
        }
    })

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
        user.value = {
            address: web3modal.getAddress() ?? "",
            network: web3modal.getState().selectedNetworkId ?? 0
        }

        web3modal.subscribeProvider(subscribeProviderHandler)
    })

    const openModal = $(() => {
        web3modal.open()
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

            <div>
                {messageAlerts.map((alert, index) => (
                    <Alert key={index} alert={alert} />
                ))}
            </div>
        </div>
    );
});
