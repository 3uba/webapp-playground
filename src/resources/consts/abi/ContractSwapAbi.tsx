export const CONTRACT_SWAP_ABI =
[
    { inputs: [], stateMutability: "nonpayable", type: "constructor" },
    {
      inputs: [],
      name: "poolFee",
      outputs: [{ internalType: "uint24", name: "", type: "uint24" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "routerAddress",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "amountIn", type: "uint256" },
        { internalType: "address", name: "tokenIn", type: "address" },
        { internalType: "address", name: "tokenOut", type: "address" },
      ],
      name: "swap",
      outputs: [{ internalType: "uint256", name: "amountOut", type: "uint256" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "swapRouter",
      outputs: [
        { internalType: "contract ISwapRouter", name: "", type: "address" },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];
  