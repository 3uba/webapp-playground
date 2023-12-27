import {component$} from "@builder.io/qwik";
import {Box} from "../../../common/box";
import {IUser} from "~/root";

interface WalletBoxProps {
    user: IUser;
}

export const WalletBox = component$<WalletBoxProps>(({user}) => {
    return (
        <Box title={"Wallet Data"}>
            <div q:slot={'children'}>
                { user.address != "" || user.network != 0 ? (
                    <>
                        <p class="font-normal text-gray-700 dark:text-gray-400 py-1">Address: {user.address}</p>
                        <p class="font-normal text-gray-700 dark:text-gray-400 py-1">Network: {user.network}</p>
                    </>
                ) : <div class={"text-white"}>Not connected yet</div> }
            </div>
        </Box>
    )
})