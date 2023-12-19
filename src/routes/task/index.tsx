import {$, component$, type QRL, useContext, useSignal, useStore, useVisibleTask$} from "@builder.io/qwik";
import web3modal from "../../tools/modal";
import {UserContext} from "~/root";
import {Alert, AlertType, IAlert} from "~/components/alert";
import {routeLoader$} from '@builder.io/qwik-city';
import type {InitialValues, SubmitHandler} from '@modular-forms/qwik';
import {formAction$, useForm, valiForm$} from '@modular-forms/qwik';
import {SwapForm, SwapSchema} from "~/components/form/swap";
import {ethers} from "ethers";
import {contractSwapAbi} from "~/resources/abi/contract_swap_abi";
import {erc20Abi} from "~/resources/abi/erc20_abi";

enum WalletActionsMessages {
    ChangedNetwork = "Successfully changed network",
    ChangedAddress = "Successfully changed address",
    Connected = "Connected successfully",
    Disconnected = "Disconnected successfully",
}

export const useFormLoader = routeLoader$<InitialValues<SwapForm>>(() => ({
    swapAmountIn: 0,
    swapIn: "WETH",
    swapAmountOut: 0,
    swapOut: "UNI",
}));

export const useFormAction = formAction$<SwapForm>(() => {});

export default component$(() => {
    const user = useContext(UserContext)
    const messageAlerts = useStore<IAlert[]>([]);
    const swapping = useSignal<boolean>(false);

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

    const swapHandler: QRL<SubmitHandler<SwapForm>> = $(async (values, event) => {
        try {
            const walletProvider = web3modal?.getWalletProvider();
            if (walletProvider == null) {
                return addAlert("Please connect wallet", AlertType.Error);
            }

            swapping.value = true;

            const CONTRACT_ADDR = "0x2F46127F6E03384e1cd1d5866360c8eB8D417884"
            const WRAPPED_ETH_ADDR = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"
            const UNI_ADDR = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"

            const provider = new ethers.providers.Web3Provider(walletProvider);

            const amount = ethers.utils.parseUnits(values.swapAmount.toString(), 18)
            const tokenFromContract = new ethers.Contract(WRAPPED_ETH_ADDR, erc20Abi, provider.getSigner());

            const res = await tokenFromContract.approve(
                CONTRACT_ADDR,
                amount
            )
            addAlert("Start approving...", AlertType.Info)
            await provider.waitForTransaction(res.hash);

            addAlert(`Approved successfully`, AlertType.Success)
            const contract = new ethers.Contract(
                CONTRACT_ADDR,
                contractSwapAbi,
                provider.getSigner()
            );

            const result = await contract.swap(
                WRAPPED_ETH_ADDR,
                UNI_ADDR,
                amount
            )
            addAlert("Start swapping...", AlertType.Info)
            await result.wait()

            addAlert(`Swapped successfully`, AlertType.Success)
            swapping.value = false;

        } catch (e) {
            console.log(e)
            addAlert('Error: ' + e.message, AlertType.Error)
            swapping.value = false;
        }
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
                <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Swap</h5>
                <Form onSubmit$={swapHandler} class={'w-screen'}>
                    <label for="amountIn" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Choose token to swap</label>
                    <div class={"flex flex-row w-full items-center"}>
                        <Field name="swapIn" type={'string'} class={""}>
                            {(field, props) => (
                                <select class={'h-1/2 mr-2 bg-gray-50 border border-gray-300 text-xs text-grey-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'} {...props} value={field.value}>
                                    {/*<option value="ETH">ETH</option>*/}
                                    <option value="WETH">WETH</option>
                                    <option value="UNI">UNI</option>
                                </select>
                            )}
                        </Field>
                        <Field name="swapAmountIn" type={'number'} class={''}>
                            {(field, props) => (
                                <div>
                                    {field.error && <div class={"text-red-400 pb-1 text-sm"}>{field.error}</div>}
                                    <input {...props} type="number" step={0.000001} value={field.value} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                                </div>
                            )}
                        </Field>
                    </div>
                    <label for="amountOut" class="block mt-2 mb-2 text-sm font-medium text-gray-900 dark:text-white">Choose token to receive</label>
                    <div class={"flex flex-row w-full items-center"}>
                        <Field name="swapOut" type={'string'} class={""}>
                            {(field, props) => (
                                <select class={'h-1/2 mr-2 bg-gray-50 border border-gray-300 text-xs text-grey-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'} {...props} value={field.value}>
                                    {/*<option value="ETH">ETH</option>*/}
                                    <option value="UNI">UNI</option>
                                    <option value="WETH">WETH</option>
                                </select>
                            )}
                        </Field>
                        <Field name="swapAmountOut" type={'number'} class={''}>
                            {(field, props) => (
                                <div>
                                    {field.error && <div class={"text-red-400 pb-1 text-sm"}>{field.error}</div>}
                                    <input disabled {...props} type="number" step={0.000001} value={field.value} class="bg-gray-150 border border-gray-300 text-gray-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                                </div>
                            )}
                        </Field>
                    </div>
                    <button disabled={swapping.value} type="submit" class={"my-4 text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 me-2 mb-2"}>
                        {swapping.value ? <>
                            <svg aria-hidden="true" class="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                            </svg>
                            <span class={'ml-2'}>Swapping...</span>
                        </> : 'Swap'}
                    </button>
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
