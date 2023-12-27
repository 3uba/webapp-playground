import {$, component$, useContext, useSignal, useTask$, useVisibleTask$} from "@builder.io/qwik";
import web3modal from "../../tools/modal";
import {NotificationContext, UserContext} from "~/root";
import type {IAlert} from "~/components/common/alert";
import {AlertType} from "~/resources/enums/AlertType";
import {ethers} from "ethers";
import {CONTRACT_SWAP_ABI} from "~/resources/consts/abi/ContractSwapAbi";
import {ERC_20_ABI} from "~/resources/consts/abi/Erc20Abi";
import {WalletActionsMessages} from "~/resources/enums/WalletActions";
import {Button} from "~/components/common/button";
import {SwapButton} from "~/components/task/components/swapButton";
import {Box} from "~/components/common/box";
import {WalletBox} from "~/components/task/block/wallet";
import {Label} from "~/components/common/label";
import {TokenSelect} from "~/components/task/components/tokenSelect";
import {Tokens} from "~/resources/consts/tokens/Tokens";
import {routeLoader$} from "@builder.io/qwik-city";
import {CONTRACT_ADDR} from "~/resources/consts/contracts/Contracts";
import {UNI_WETH_POOL} from "~/resources/consts/pools/Pools";

export const useTokenDataPrice = routeLoader$(async () => {
    const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/goerli-testnet/pools/${UNI_WETH_POOL}`)
    return await res.json()
})

export default component$(() => {
    const user = useContext(UserContext)
    const notifications = useContext(NotificationContext)

    const tokenDataPrice = useTokenDataPrice()

    const isSwapping = useSignal<boolean>(false);

    const tokenInValue = useSignal(0);
    const tokenOutValue = useSignal(0);
    const tokenInSymbol = useSignal(Tokens.WETH.tokenName);
    const tokenOutSymbol = useSignal(Tokens.UNI.tokenName);

    const addAlert = $((message: string, alertType: AlertType) => {
        notifications.push({
            message,
            isVisible: true,
            type: alertType,
        } as IAlert);

        setTimeout(()=> {
            notifications.shift()
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
        user.value = {
            address: web3modal.getAddress() ?? "",
            network: web3modal.getState().selectedNetworkId ?? 0
        }
        web3modal.subscribeProvider(subscribeProviderHandler);
    })

    const getTokenData = $((tokenSymbol: string) => {
        return Tokens[tokenSymbol as keyof typeof Tokens]
    })

    const swapHandler = $(async () => {
        try {
            isSwapping.value = true;

            const walletProvider = web3modal.getWalletProvider();
            if (walletProvider == null) {
                return addAlert("Please connect wallet", AlertType.Error);
            }

            const swapInToken = await getTokenData(tokenInSymbol.value)
            const swapOutToken = await getTokenData(tokenOutSymbol.value)
            if (swapInToken.tokenName == swapOutToken.tokenName) {
                return addAlert("You can't swap token for the same token", AlertType.Error);
            }

            const provider = new ethers.providers.Web3Provider(walletProvider);
            if (provider == undefined) {
                return addAlert("Problem with provider", AlertType.Error)
            }

            const amount = ethers.utils.parseUnits(tokenInValue.value.toString(), 18)
            const tokenFromContract = new ethers.Contract(swapInToken.address, ERC_20_ABI, provider.getSigner());
            let res = await tokenFromContract.approve(
                CONTRACT_ADDR,
                amount
            )
            if (!res.hash) {
                return addAlert("Token creating approve failed", AlertType.Error)
            }
            addAlert("Start approving...", AlertType.Info)

            res = await provider.waitForTransaction(res.hash);
            if (res.to != swapInToken.address) {
                return addAlert("Approve failed", AlertType.Error)
            }
            addAlert(`Approved successfully`, AlertType.Success)

            const contract = new ethers.Contract(
                CONTRACT_ADDR,
                CONTRACT_SWAP_ABI,
                provider.getSigner()
            );
            const swap = await contract.swap(
                amount,
                swapInToken.address,
                swapOutToken.address,
            );
            if (!swap.hash) {
                return addAlert("Swapping failed", AlertType.Error)
            }
            addAlert("Start swapping...", AlertType.Info)

            await swap.wait()
            addAlert("Swapped successfully", AlertType.Success)
        } catch (e) {
            addAlert('Error something went wrong', AlertType.Error)
        } finally {
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
                    tokenInSymbol.value == tokenOutSymbol.value
                        ? tokenInValue.value
                        : tokenInValue.value * tokenDataPrice.value?.data.attributes[tokenInSymbol.value == "UNI" ? "base_token_price_quote_token" : "quote_token_price_base_token"]
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
                <div q:slot={"children"} onSubmit$={swapHandler} class={'w-full'}>
                    <Label labelFor="amountOut" text="Choose token to swap" />
                    <div class={"flex flex-row w-full items-end mb-2"}>
                        <TokenSelect defaultValue={tokenInSymbol} />
                        <input
                            type="number"
                            step={0.000001}
                            bind:value={tokenInValue}
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-64 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        />
                    </div>
                    <Label labelFor="amountOut" text="Choose token to receive" />
                    <div class={"flex flex-row w-full items-end mb-2"}>
                        <TokenSelect defaultValue={tokenOutSymbol} />
                        <div class="bg-gray-150 border border-gray-300 text-gray-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-64 p-2.5 dark:bg-gray-900 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500">
                            {tokenOutValue}
                        </div>
                    </div>
                    <SwapButton onClick$={swapHandler} disabled={isSwapping.value} />
                </div>
            </Box>
        </div>
    );
});
