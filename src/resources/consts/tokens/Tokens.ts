import { Token } from "../../enums/Token";

export const Tokens = {
    [Token.WETH]: {
        tokenName: "WETH",
        address: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
        active: true,
    },
    [Token.UNI]: {
        tokenName: "UNI",
        address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        active: true,
    },
    [Token.USDT]: {
        tokenName: "USDT",
        address: "0x0000",
        active: false,
    }
};
