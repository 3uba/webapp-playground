import {component$, $, useContext, useStore, useVisibleTask$, type QRL } from "@builder.io/qwik";
import web3modal from "../../tools/modal";
import {UserContext} from "~/root";
import {Alert, AlertType, IAlert} from "~/components/alert";
import { routeLoader$ } from '@builder.io/qwik-city';
import type { InitialValues, SubmitHandler } from '@modular-forms/qwik';
import { formAction$, useForm, valiForm$ } from '@modular-forms/qwik';
import {SwapForm, SwapSchema} from "~/components/form/swap";

enum WalletActionsMessages {
    ChangedNetwork = "Successfully changed network",
    ChangedAddress = "Successfully changed address",
    Connected = "Connected successfully",
    Disconnected = "Disconnected successfully",
}

export const useFormLoader = routeLoader$<InitialValues<SwapForm>>(() => ({
    swapAmount: '',
}));

export const useFormAction = formAction$<SwapForm>(() => {});

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

    const swapHandler: QRL<SubmitHandler<SwapForm>> = $((values, event) => {
        addAlert("Start swapping...", AlertType.Info)
        // sweepToken (0xdf2ab5bb)
        console.log(values.swapAmount)
    })

    const openModal = $(() => {
        web3modal.open()
    })

    const [swapForm, { Form, Field }] = useForm<SwapForm>({
        loader: useFormLoader(),
        action: useFormAction(),
        validate: valiForm$(SwapSchema),
    });

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
            <div class="block mt-2 mb-2 mx-4 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Swap Eth to Uni</h5>
                <Form onSubmit$={swapHandler}>
                    <Field name="swapAmount" type={'number'}>
                        {(field, props) => (
                            <div>
                                <label for="first_name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Amount in ether</label>
                                {field.error && <div class={"text-red-400 pb-1 text-sm"}>{field.error}</div>}
                                <input {...props} type="number" step={0.000001} value={field.value} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                            </div>
                        )}
                    </Field>
                    <button type="submit" class={"my-4 text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 me-2 mb-2"}>Swap</button>
                </Form>
            </div>

            <div>
                {messageAlerts.map((alert, index) => (
                    <Alert key={index} alert={alert} />
                ))}
            </div>
        </div>
    );
});
