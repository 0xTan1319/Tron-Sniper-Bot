/* ------------------------------ */
/*           CONFIG PART          */
/* ------------------------------ */

export const SUNSWAP_FACTORY_ADDRESS = "TKWJdrQkqHisa1X8HUdHEfREvTzw4pMAaY"; // https://www.sunswap.com/docs/sunswapV2-interfaces_en.pdf
export const SUNSWAP_ROUTER_ADDRESS = "TKzxdSv2FZKQrEqkKVgp5DcwEXBEKMg2Ax"; // https://www.sunswap.com/docs/sunswapV2-interfaces_en.pdf
export const WTRX_ADDRESS = "TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR"; // https://tronscan.org/#/contract/TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR
export const WTRX_DECIMALS = 6;
export const GENERIC_ERROR_MESSAGE =
  "An error occurred. Please try again later.";

export const SUNSWAP_FACTORY_ABI = {
  entrys: [
    {
      outputs: [
        {
          type: "address",
        },
      ],
      constant: true,
      name: "feeTo",
      stateMutability: "View",
      type: "Function",
    },
    {
      outputs: [
        {
          type: "address",
        },
      ],
      constant: true,
      name: "feeToSetter",
      stateMutability: "View",
      type: "Function",
    },
    {
      outputs: [
        {
          type: "address",
        },
      ],
      constant: true,
      inputs: [
        {
          type: "uint256",
        },
      ],
      name: "allPairs",
      stateMutability: "View",
      type: "Function",
    },
    {
      outputs: [
        {
          type: "uint256",
        },
      ],
      constant: true,
      name: "allPairsLength",
      stateMutability: "View",
      type: "Function",
    },
    {
      outputs: [
        {
          type: "bytes32",
        },
      ],
      constant: true,
      name: "getPairHash",
      stateMutability: "View",
      type: "Function",
    },
    {
      inputs: [
        {
          name: "_feeToSetter",
          type: "address",
        },
      ],
      name: "setFeeToSetter",
      stateMutability: "Nonpayable",
      type: "Function",
    },
    {
      outputs: [
        {
          name: "pair",
          type: "address",
        },
      ],
      inputs: [
        {
          name: "tokenA",
          type: "address",
        },
        {
          name: "tokenB",
          type: "address",
        },
      ],
      name: "createPair",
      stateMutability: "Nonpayable",
      type: "Function",
    },
    {
      outputs: [
        {
          type: "address",
        },
      ],
      constant: true,
      inputs: [
        {
          type: "address",
        },
        {
          type: "address",
        },
      ],
      name: "getPair",
      stateMutability: "View",
      type: "Function",
    },
    {
      inputs: [
        {
          name: "_feeTo",
          type: "address",
        },
      ],
      name: "setFeeTo",
      stateMutability: "Nonpayable",
      type: "Function",
    },
    {
      inputs: [
        {
          name: "_feeToSetter",
          type: "address",
        },
      ],
      stateMutability: "Nonpayable",
      type: "Constructor",
    },
    {
      inputs: [
        {
          indexed: true,
          name: "token0",
          type: "address",
        },
        {
          indexed: true,
          name: "token1",
          type: "address",
        },
        {
          name: "pair",
          type: "address",
        },
        {
          type: "uint256",
        },
      ],
      name: "PairCreated",
      type: "Event",
    },
  ],
};
export const SUNSWAP_PAIR_ABI = {
  entrys: [
    { inputs: [], stateMutability: "nonpayable", type: "constructor" },
    {
      inputs: [
        {
          indexed: true,
          name: "owner",
          internalType: "address",
          type: "address",
        },
        {
          indexed: true,
          name: "spender",
          internalType: "address",
          type: "address",
        },
        {
          indexed: false,
          name: "value",
          internalType: "uint256",
          type: "uint256",
        },
      ],
      name: "Approval",
      anonymous: false,
      type: "event",
    },
    {
      inputs: [
        {
          indexed: true,
          name: "sender",
          internalType: "address",
          type: "address",
        },
        {
          indexed: false,
          name: "amount0",
          internalType: "uint256",
          type: "uint256",
        },
        {
          indexed: false,
          name: "amount1",
          internalType: "uint256",
          type: "uint256",
        },
        { indexed: true, name: "to", internalType: "address", type: "address" },
      ],
      name: "Burn",
      anonymous: false,
      type: "event",
    },
    {
      inputs: [
        {
          indexed: true,
          name: "sender",
          internalType: "address",
          type: "address",
        },
        {
          indexed: false,
          name: "amount0",
          internalType: "uint256",
          type: "uint256",
        },
        {
          indexed: false,
          name: "amount1",
          internalType: "uint256",
          type: "uint256",
        },
      ],
      name: "Mint",
      anonymous: false,
      type: "event",
    },
    {
      inputs: [
        {
          indexed: true,
          name: "sender",
          internalType: "address",
          type: "address",
        },
        {
          indexed: false,
          name: "amount0In",
          internalType: "uint256",
          type: "uint256",
        },
        {
          indexed: false,
          name: "amount1In",
          internalType: "uint256",
          type: "uint256",
        },
        {
          indexed: false,
          name: "amount0Out",
          internalType: "uint256",
          type: "uint256",
        },
        {
          indexed: false,
          name: "amount1Out",
          internalType: "uint256",
          type: "uint256",
        },
        { indexed: true, name: "to", internalType: "address", type: "address" },
      ],
      name: "Swap",
      anonymous: false,
      type: "event",
    },
    {
      inputs: [
        {
          indexed: false,
          name: "reserve0",
          internalType: "uint112",
          type: "uint112",
        },
        {
          indexed: false,
          name: "reserve1",
          internalType: "uint112",
          type: "uint112",
        },
      ],
      name: "Sync",
      anonymous: false,
      type: "event",
    },
    {
      inputs: [
        {
          indexed: true,
          name: "from",
          internalType: "address",
          type: "address",
        },
        { indexed: true, name: "to", internalType: "address", type: "address" },
        {
          indexed: false,
          name: "value",
          internalType: "uint256",
          type: "uint256",
        },
      ],
      name: "Transfer",
      anonymous: false,
      type: "event",
    },
    {
      outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
      inputs: [],
      name: "DOMAIN_SEPARATOR",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
      inputs: [],
      name: "MINIMUM_LIQUIDITY",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
      inputs: [],
      name: "PERMIT_TYPEHASH",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
      inputs: [
        { name: "", internalType: "address", type: "address" },
        { name: "", internalType: "address", type: "address" },
      ],
      name: "allowance",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "", internalType: "bool", type: "bool" }],
      inputs: [
        { name: "spender", internalType: "address", type: "address" },
        { name: "value", internalType: "uint256", type: "uint256" },
      ],
      name: "approve",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
      inputs: [{ name: "", internalType: "address", type: "address" }],
      name: "balanceOf",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "", internalType: "uint8", type: "uint8" }],
      inputs: [],
      name: "decimals",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "", internalType: "address", type: "address" }],
      inputs: [],
      name: "factory",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
      inputs: [],
      name: "kLast",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "", internalType: "string", type: "string" }],
      inputs: [],
      name: "name",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
      inputs: [{ name: "", internalType: "address", type: "address" }],
      name: "nonces",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [],
      inputs: [
        { name: "owner", internalType: "address", type: "address" },
        { name: "spender", internalType: "address", type: "address" },
        { name: "value", internalType: "uint256", type: "uint256" },
        { name: "deadline", internalType: "uint256", type: "uint256" },
        { name: "v", internalType: "uint8", type: "uint8" },
        { name: "r", internalType: "bytes32", type: "bytes32" },
        { name: "s", internalType: "bytes32", type: "bytes32" },
      ],
      name: "permit",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
      inputs: [],
      name: "price0CumulativeLast",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
      inputs: [],
      name: "price1CumulativeLast",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "", internalType: "string", type: "string" }],
      inputs: [],
      name: "symbol",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "", internalType: "address", type: "address" }],
      inputs: [],
      name: "token0",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "", internalType: "address", type: "address" }],
      inputs: [],
      name: "token1",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
      inputs: [],
      name: "totalSupply",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "", internalType: "bool", type: "bool" }],
      inputs: [
        { name: "to", internalType: "address", type: "address" },
        { name: "value", internalType: "uint256", type: "uint256" },
      ],
      name: "transfer",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [{ name: "", internalType: "bool", type: "bool" }],
      inputs: [
        { name: "from", internalType: "address", type: "address" },
        { name: "to", internalType: "address", type: "address" },
        { name: "value", internalType: "uint256", type: "uint256" },
      ],
      name: "transferFrom",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [
        { name: "_reserve0", internalType: "uint112", type: "uint112" },
        { name: "_reserve1", internalType: "uint112", type: "uint112" },
        { name: "_blockTimestampLast", internalType: "uint32", type: "uint32" },
      ],
      inputs: [],
      name: "getReserves",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [],
      inputs: [
        { name: "_token0", internalType: "address", type: "address" },
        { name: "_token1", internalType: "address", type: "address" },
      ],
      name: "initialize",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [
        { name: "liquidity", internalType: "uint256", type: "uint256" },
      ],
      inputs: [{ name: "to", internalType: "address", type: "address" }],
      name: "mint",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [
        { name: "amount0", internalType: "uint256", type: "uint256" },
        { name: "amount1", internalType: "uint256", type: "uint256" },
      ],
      inputs: [{ name: "to", internalType: "address", type: "address" }],
      name: "burn",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [],
      inputs: [
        { name: "amount0Out", internalType: "uint256", type: "uint256" },
        { name: "amount1Out", internalType: "uint256", type: "uint256" },
        { name: "to", internalType: "address", type: "address" },
        { name: "data", internalType: "bytes", type: "bytes" },
      ],
      name: "swap",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [],
      inputs: [{ name: "to", internalType: "address", type: "address" }],
      name: "skim",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [],
      inputs: [],
      name: "sync",
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};
export const SUNSWAP_ROUTER_ABI = {
  entrys: [
    {
      inputs: [
        { name: "_factory", type: "address" },
        { name: "_WETH", type: "address" },
      ],
      stateMutability: "Nonpayable",
      type: "Constructor",
    },
    {
      outputs: [{ type: "address" }],
      name: "WETH",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [
        { name: "amountA", type: "uint256" },
        { name: "amountB", type: "uint256" },
        { name: "liquidity", type: "uint256" },
      ],
      inputs: [
        { name: "tokenA", type: "address" },
        { name: "tokenB", type: "address" },
        { name: "amountADesired", type: "uint256" },
        { name: "amountBDesired", type: "uint256" },
        { name: "amountAMin", type: "uint256" },
        { name: "amountBMin", type: "uint256" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      name: "addLiquidity",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [
        { name: "amountToken", type: "uint256" },
        { name: "amountETH", type: "uint256" },
        { name: "liquidity", type: "uint256" },
      ],
      inputs: [
        { name: "token", type: "address" },
        { name: "amountTokenDesired", type: "uint256" },
        { name: "amountTokenMin", type: "uint256" },
        { name: "amountETHMin", type: "uint256" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      name: "addLiquidityETH",
      stateMutability: "payable",
      type: "function",
    },
    {
      outputs: [{ type: "address" }],
      name: "factory",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "amountIn", type: "uint256" }],
      inputs: [
        { name: "amountOut", type: "uint256" },
        { name: "reserveIn", type: "uint256" },
        { name: "reserveOut", type: "uint256" },
      ],
      name: "getAmountIn",
      stateMutability: "pure",
      type: "function",
    },
    {
      outputs: [{ name: "amountOut", type: "uint256" }],
      inputs: [
        { name: "amountIn", type: "uint256" },
        { name: "reserveIn", type: "uint256" },
        { name: "reserveOut", type: "uint256" },
      ],
      name: "getAmountOut",
      stateMutability: "pure",
      type: "function",
    },
    {
      outputs: [{ name: "amounts", type: "uint256[]" }],
      inputs: [
        { name: "amountOut", type: "uint256" },
        { name: "path", type: "address[]" },
      ],
      name: "getAmountsIn",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "amounts", type: "uint256[]" }],
      inputs: [
        { name: "amountIn", type: "uint256" },
        { name: "path", type: "address[]" },
      ],
      name: "getAmountsOut",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "pair", type: "address" }],
      inputs: [
        { name: "tokenA", type: "address" },
        { name: "tokenB", type: "address" },
      ],
      name: "getPairOffChain",
      stateMutability: "view",
      type: "function",
    },
    {
      outputs: [{ name: "amountB", type: "uint256" }],
      inputs: [
        { name: "amountA", type: "uint256" },
        { name: "reserveA", type: "uint256" },
        { name: "reserveB", type: "uint256" },
      ],
      name: "quote",
      stateMutability: "pure",
      type: "function",
    },
    {
      outputs: [
        { name: "amountA", type: "uint256" },
        { name: "amountB", type: "uint256" },
      ],
      inputs: [
        { name: "tokenA", type: "address" },
        { name: "tokenB", type: "address" },
        { name: "liquidity", type: "uint256" },
        { name: "amountAMin", type: "uint256" },
        { name: "amountBMin", type: "uint256" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      name: "removeLiquidity",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [
        { name: "amountToken", type: "uint256" },
        { name: "amountETH", type: "uint256" },
      ],
      inputs: [
        { name: "token", type: "address" },
        { name: "liquidity", type: "uint256" },
        { name: "amountTokenMin", type: "uint256" },
        { name: "amountETHMin", type: "uint256" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      name: "removeLiquidityETH",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [{ name: "amountETH", type: "uint256" }],
      inputs: [
        { name: "token", type: "address" },
        { name: "liquidity", type: "uint256" },
        { name: "amountTokenMin", type: "uint256" },
        { name: "amountETHMin", type: "uint256" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      name: "removeLiquidityETHSupportingFeeOnTransferTokens",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [
        { name: "amountToken", type: "uint256" },
        { name: "amountETH", type: "uint256" },
      ],
      inputs: [
        { name: "token", type: "address" },
        { name: "liquidity", type: "uint256" },
        { name: "amountTokenMin", type: "uint256" },
        { name: "amountETHMin", type: "uint256" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
        { name: "approveMax", type: "bool" },
        { name: "v", type: "uint8" },
        { name: "r", type: "bytes32" },
        { name: "s", type: "bytes32" },
      ],
      name: "removeLiquidityETHWithPermit",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [{ name: "amountETH", type: "uint256" }],
      inputs: [
        { name: "token", type: "address" },
        { name: "liquidity", type: "uint256" },
        { name: "amountTokenMin", type: "uint256" },
        { name: "amountETHMin", type: "uint256" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
        { name: "approveMax", type: "bool" },
        { name: "v", type: "uint8" },
        { name: "r", type: "bytes32" },
        { name: "s", type: "bytes32" },
      ],
      name: "removeLiquidityETHWithPermitSupportingFeeOnTransferTokens",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [
        { name: "amountA", type: "uint256" },
        { name: "amountB", type: "uint256" },
      ],
      inputs: [
        { name: "tokenA", type: "address" },
        { name: "tokenB", type: "address" },
        { name: "liquidity", type: "uint256" },
        { name: "amountAMin", type: "uint256" },
        { name: "amountBMin", type: "uint256" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
        { name: "approveMax", type: "bool" },
        { name: "v", type: "uint8" },
        { name: "r", type: "bytes32" },
        { name: "s", type: "bytes32" },
      ],
      name: "removeLiquidityWithPermit",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [{ name: "amounts", type: "uint256[]" }],
      inputs: [
        { name: "amountOut", type: "uint256" },
        { name: "path", type: "address[]" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      name: "swapETHForExactTokens",
      stateMutability: "payable",
      type: "function",
    },
    {
      outputs: [{ name: "amounts", type: "uint256[]" }],
      inputs: [
        { name: "amountOutMin", type: "uint256" },
        { name: "path", type: "address[]" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      name: "swapExactETHForTokens",
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        { name: "amountOutMin", type: "uint256" },
        { name: "path", type: "address[]" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      name: "swapExactETHForTokensSupportingFeeOnTransferTokens",
      stateMutability: "payable",
      type: "function",
    },
    {
      outputs: [{ name: "amounts", type: "uint256[]" }],
      inputs: [
        { name: "amountIn", type: "uint256" },
        { name: "amountOutMin", type: "uint256" },
        { name: "path", type: "address[]" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      name: "swapExactTokensForETH",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { name: "amountIn", type: "uint256" },
        { name: "amountOutMin", type: "uint256" },
        { name: "path", type: "address[]" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      name: "swapExactTokensForETHSupportingFeeOnTransferTokens",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [{ name: "amounts", type: "uint256[]" }],
      inputs: [
        { name: "amountIn", type: "uint256" },
        { name: "amountOutMin", type: "uint256" },
        { name: "path", type: "address[]" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      name: "swapExactTokensForTokens",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { name: "amountIn", type: "uint256" },
        { name: "amountOutMin", type: "uint256" },
        { name: "path", type: "address[]" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      name: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [{ name: "amounts", type: "uint256[]" }],
      inputs: [
        { name: "amountOut", type: "uint256" },
        { name: "amountInMax", type: "uint256" },
        { name: "path", type: "address[]" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      name: "swapTokensForExactETH",
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      outputs: [{ name: "amounts", type: "uint256[]" }],
      inputs: [
        { name: "amountOut", type: "uint256" },
        { name: "amountInMax", type: "uint256" },
        { name: "path", type: "address[]" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      name: "swapTokensForExactTokens",
      stateMutability: "nonpayable",
      type: "function",
    },
    { stateMutability: "Payable", type: "Receive" },
  ],
};
export const TRC20_ABI = [
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "symbol", type: "string" },
      { internalType: "uint256", name: "totalSupply", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [],
    name: "MODE_NORMAL",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MODE_TRANSFER_CONTROLLED",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MODE_TRANSFER_RESTRICTED",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_mode",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "subtractedValue", type: "uint256" },
    ],
    name: "decreaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint256", name: "addedValue", type: "uint256" },
    ],
    name: "increaseAllowance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "v", type: "uint256" }],
    name: "setMode",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "from", type: "address" },
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint256", name: "amount", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "newOwner", type: "address" }],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];
