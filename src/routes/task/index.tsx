import {$, component$, type QRL, useContext, useSignal, useStore, useTask$, useVisibleTask$} from "@builder.io/qwik";
import web3modal from "../../tools/modal";
import {UserContext} from "~/root";
import type {IAlert} from "~/components/common/alert";
import {Alert} from "~/components/common/alert";
import {AlertType} from "~/resources/enums/AlertType";
import {ethers} from "ethers";
import {contractSwapAbi} from "~/resources/consts/abi/ContractSwapAbi";
import {erc20Abi} from "~/resources/consts/abi/Erc20Abi";
import {WalletActionsMessages} from "~/resources/enums/WalletActions";
import {Button} from "~/components/common/button";
import {SwapButton} from "~/components/task/components/swapButton";
import {Box} from "~/components/common/box";
import {WalletBox} from "~/components/task/block/wallet";
import {Label} from "~/components/common/label";
import {TokenSelect} from "~/components/task/components/tokenSelect";
import {Tokens} from "~/resources/consts/tokens/Tokens";

export const CONTRACT_ADDR = "0x2F46127F6E03384e1cd1d5866360c8eB8D417884"

export default component$(() => {
    const user = useContext(UserContext)
    const messageAlerts = useStore<IAlert[]>([]);
    const isSwapping = useSignal<boolean>(false);
    const tokenDataPrice = useSignal(null);

    const tokenInValue = useSignal(0);
    const tokenIn = useSignal(Tokens.WETH.tokenName);
    const tokenOutValue = useSignal(0);
    const tokenOut = useSignal(Tokens.UNI.tokenName);

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
    useVisibleTask$(async () => {
        let res = await fetch(`https://api.geckoterminal.com/api/v2/networks/goerli-testnet/pools/0x28cee28a7c4b4022ac92685c07d2f33ab1a0e122?include=${Tokens.WETH.address}`)
        tokenDataPrice.value = {...await res.json()}

        user.value = {
            address: web3modal.getAddress() ?? "",
            network: web3modal.getState().selectedNetworkId ?? 0
        }

        web3modal.subscribeProvider(subscribeProviderHandler)
    })

    const swapHandler = $(async () => {
        try {
            const walletProvider = web3modal.getWalletProvider();
            if (walletProvider == null) {
                return addAlert("Please connect wallet", AlertType.Error);
            }

            const swapInToken = Tokens[tokenIn.value as keyof typeof Tokens]
            const swapOutToken = Tokens[tokenOut.value as keyof typeof Tokens]
            if (swapInToken.tokenName == swapOutToken.tokenName) {
                return addAlert("You can't swap token for the same token", AlertType.Error);
            }

            isSwapping.value = true;

            const provider = new ethers.providers.Web3Provider(walletProvider);
            const amount = ethers.utils.parseUnits(tokenInValue.value.toString(), 18)
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

    useTask$(async ({ track }) => {
        track(() => {
            if (!tokenDataPrice.value) {
                tokenOutValue.value = 0
            } else {
                // only uni to weth
                tokenOutValue.value =
                    tokenIn.value == tokenOut.value
                        ? tokenInValue.value
                        : tokenInValue.value * tokenDataPrice.value?.data.attributes[tokenIn.value == "UNI" ? "base_token_price_quote_token" : "quote_token_price_base_token"]
            }
        })
    })

    return (
        <div class={"bg-black h-screen p-4"}>
            <Button onClick$={openModal}>
                <span q:slot={'children'}>{user.value.address == "" ? "Connect" : "Open modal"}</span>
            </Button>
            <WalletBox user={user.value} />
            <Box title={"Swap"}>
                <div q:slot={"children"}>
                    <div onSubmit$={swapHandler} class={'w-full'}>
                        <Label labelFor="amountOut" text="Choose token to swap" />
                        <div class={"flex flex-row w-full items-end mb-2"}>
                            <div>
                                <TokenSelect valueObj={tokenIn} />
                            </div>
                            <div>
                                <div class={'w-64'}>
                                    <input
                                        type="number"
                                        step={0.000001}
                                        bind:value={tokenInValue}
                                        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                        <Label labelFor="amountOut" text="Choose token to receive" />
                        <div class={"flex flex-row w-full items-end mb-2"}>
                            <div>
                                <TokenSelect valueObj={tokenOut} />
                            </div>
                            <div class={'w-64'}>
                                <div class="bg-gray-150 border border-gray-300 text-gray-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500">
                                    {tokenOutValue}
                                </div>
                            </div>
                        </div>
                        <SwapButton onClick$={swapHandler} disabled={isSwapping.value} />
                    </div>
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
