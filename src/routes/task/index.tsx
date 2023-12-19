import {$, component$, type QRL, useContext, useSignal, useStore, useVisibleTask$} from "@builder.io/qwik";
import web3modal from "../../tools/modal";
import {UserContext} from "~/root";
import type {IAlert} from "~/components/common/alert";
import {Alert} from "~/components/common/alert";
import {AlertType} from "~/resources/enums/AlertType";
import type {SubmitHandler, InitialValues} from '@modular-forms/qwik';
import {formAction$, useForm, valiForm$} from '@modular-forms/qwik';
import type {SwapForm} from "~/components/task/form/swap";
import { SwapSchema} from "~/components/task/form/swap";
import {ethers} from "ethers";
import {contractSwapAbi} from "~/resources/consts/abi/ContractSwapAbi";
import {erc20Abi} from "~/resources/consts/abi/Erc20Abi";
import {WalletActionsMessages} from "~/resources/enums/WalletActions";
import {routeLoader$} from "@builder.io/qwik-city";
import {Button} from "~/components/common/button";
import {SwapButton} from "~/components/task/form/components/swapButton";
import {Box} from "~/components/common/box";
import {WalletBox} from "~/components/task/block/wallet";
import {Label} from "~/components/common/label";
import {TokenSelect} from "~/components/task/form/components/tokenSelect";
import {Tokens} from "~/resources/consts/tokens/Tokens";
import {Token} from "~/resources/enums/Token";

export const CONTRACT_ADDR = "0x2F46127F6E03384e1cd1d5866360c8eB8D417884"

export const useFormLoader = routeLoader$<InitialValues<SwapForm>>(() => ({
    swapAmountIn: 0,
    swapIn: Token.WETH,
    swapOut: Token.UNI,
}));

export const useFormAction = formAction$<SwapForm>(() => {}, valiForm$(SwapSchema));

export default component$(() => {
    const user = useContext(UserContext)
    const messageAlerts = useStore<IAlert[]>([]);
    const isSwapping = useSignal<boolean>(false);

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

    const subscribeProviderHandler = $((provider: any) => {
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

        return addAlert("Something went wrong", AlertType.Error);
    })

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(() => {
        user.value = {
            address: web3modal.getAddress() ?? "",
            network: web3modal.getState().selectedNetworkId ?? 0
        }

        web3modal.subscribeProvider(subscribeProviderHandler)
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const swapHandler: QRL<SubmitHandler<SwapForm>> = $(async (values, event) => {
        try {
            const walletProvider = web3modal.getWalletProvider();
            if (walletProvider == null) {
                return addAlert("Please connect wallet", AlertType.Error);
            }

            const swapInToken = Tokens[values.swapIn as keyof typeof Tokens]
            const swapOutToken = Tokens[values.swapOut as keyof typeof Tokens]
            if (swapInToken.tokenName == swapOutToken.tokenName) {
                return addAlert("You can't swap token for the same token", AlertType.Error);
            }

            isSwapping.value = true;

            const provider = new ethers.providers.Web3Provider(walletProvider);
            const amount = ethers.utils.parseUnits(values.swapAmountIn.toString(), 18)
            const tokenFromContract = new ethers.Contract(swapInToken.address, erc20Abi, provider.getSigner());
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
                swapInToken.address,
                swapOutToken.address,
                amount
            )
            addAlert("Start swapping...", AlertType.Info)
            await result.wait()

            addAlert("Swapped successfully", AlertType.Success)
            isSwapping.value = false;
        } catch (e) {
            addAlert('Error something went wrong', AlertType.Error)
            console.log({e})
            isSwapping.value = false;
        }
    })

    const openModal = $(() => {
        web3modal.open()
    })

    // eslint-disable-next-line
    const [swapForm, { Form, Field }] = useForm<SwapForm>({
        loader: useFormLoader(),
        action: useFormAction(),
        validate: valiForm$(SwapSchema),
    });

    return (
        <div class={"bg-black h-screen p-4"}>
            <Button onClick$={openModal}>
                <span q:slot={'children'}>{user.value.address == "" ? "Connect" : "Open modal"}</span>
            </Button>
            <WalletBox user={user.value} />
            <Box title={"Swap"}>
                <div q:slot={"children"}>
                    <Form onSubmit$={swapHandler} class={'w-full'}>
                        <Label labelFor="amountOut" text="Choose token to swap" />
                        <div class={"flex flex-row w-full items-end mb-2"}>
                            <Field name="swapIn" type={'string'}>
                                {(field, props) => (
                                    <TokenSelect fieldProps={props} fieldValue={field.value} />
                                )}
                            </Field>
                            <Field name="swapAmountIn" type={'number'}>
                                {(field, props) => (
                                    <div class={'w-64'}>
                                        {field.error && <div class={"text-red-400 pb-1 text-sm"}>{field.error}</div>}
                                        <input {...props} type="number" step={0.000001} value={field.value} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                                    </div>
                                )}
                            </Field>
                        </div>
                        <Label labelFor="amountOut" text="Choose token to receive" />
                        <div class={"flex flex-row w-full items-end mb-2"}>
                            <Field name="swapOut" type={'string'}>
                                {(field, props) => (
                                    <TokenSelect fieldProps={props} fieldValue={field.value} />
                                )}
                            </Field>
                            <div class={'w-64'}>
                                <input disabled type="number" class="bg-gray-150 border border-gray-300 text-gray-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
                            </div>
                        </div>
                        <SwapButton isSwapping={isSwapping.value} />
                    </Form>
                </div>
            </Box>

            <div class={"w-full fixed bottom-2 flex items-center justify-center flex-col"}>
                {messageAlerts.map((alert, index) => (
                    <Alert key={index} alert={alert} />
                ))}
            </div>
        </div>
    );
});
