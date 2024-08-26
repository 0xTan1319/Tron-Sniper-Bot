import BigNumber from "bignumber.js";
import dotenv from "dotenv";
import TronWeb from "tronweb";
import {
  SUNSWAP_FACTORY_ABI,
  SUNSWAP_FACTORY_ADDRESS,
  SUNSWAP_PAIR_ABI,
  SUNSWAP_ROUTER_ADDRESS,
  TRC20_ABI,
  WTRX_ADDRESS,
  WTRX_DECIMALS,
} from "../config";
import { errorLOG } from "./logs";

class SniperUtils {
  private static instance: TronWeb;
  private static cachedTRXPrice: number | null = null;
  private static cacheTimestamp: number = 0;

  private constructor() {}

  /* ------------------------------ */
  /*          TRONWEB PART          */
  /* ------------------------------ */

  static getInstance() {
    if (!this.instance) {
      throw new Error("TronWeb instance not initialized");
    }

    return this.instance;
  }

  static async initialize() {
    try {
      const { parsed: env } = dotenv.config();

      if (!env) {
        throw new Error("No .env file found");
      }

      const requiredEnvVariables = ["TRON_FULL_HOST", "API_KEY", "PRIVATE_KEY"];
      for (const variable of requiredEnvVariables) {
        if (!env[variable]) {
          throw new Error(`${variable} is missing in .env file`);
        }
      }

      this.instance = new TronWeb({
        fullHost: env.TRON_FULL_HOST,
        headers: { "TRON-PRO-API-KEY": env.API_KEY },
        privateKey: env.PRIVATE_KEY,
      });
    } catch (error) {
      console.error(`${errorLOG} ${error}`);
      process.exit(1);
    }
  }

  static async setPrivateKey(privateKey: string) {
    this.instance.setPrivateKey(privateKey);
  }

  /* ------------------------------ */
  /*         ACCOUNT PART           */
  /* ------------------------------ */

  static importAccount(privateKey: string) {
    return this.instance.address.fromPrivateKey(privateKey);
  }

  static async createAccount() {
    return await this.instance.createAccount();
  }

  static async getAccount(accountAddress: string) {
    return await this.instance.trx.getAccount(accountAddress);
  }

  static async getBalance(accountAddress: string) {
    return await this.instance.trx.getBalance(accountAddress);
  }

  static async getTokensBalance(accountAddress: string) {
    try {
      const res = await fetch(
        `https://apilist.tronscanapi.com/api/account/tokens?address=${accountAddress}&start=0&limit=150&token=&hidden=0&show=0&sortType=0&sortBy=0`
      );

      const data = await res.json();

      if (!data.data) {
        throw new Error("No data found");
      }

      const tokens = data.data.map((token: any) => {
        const type = token.tokenType;

        if (type === "trc10") return;

        return {
          address: token.tokenId,
          name: token.tokenName,
          symbol: token.tokenAbbr,
          balance: token.balance,
          decimals: token.tokenDecimal,
          type: token.tokenType,
          logo: token.tokenLogo,
          holders: token.nrOfTokenHolders,
        } as Token;
      });

      if (!tokens) throw new Error("No tokens found");

      const finalTokens = tokens.filter((token: Token) => token);

      if (finalTokens.length === 0) return [];

      return finalTokens;
    } catch (error) {
      console.error(`${errorLOG} ${error}`);
      return [];
    }
  }

  /* ------------------------------ */
  /*         CONTRACT PART          */
  /* ------------------------------ */

  static async getContractABI(contractAddress: string) {
    return await this.instance.trx.getContract(contractAddress);
  }

  static async getContractInstance(abi: any, contractAddress: string) {
    return await this.instance.contract(abi, contractAddress);
  }

  /* ------------------------------ */
  /*           SUNSWAP PART         */
  /* ------------------------------ */

  static async getPairAddress(tokenAddress: string) {
    try {
      const contract = await this.getContractInstance(
        SUNSWAP_FACTORY_ABI.entrys,
        SUNSWAP_FACTORY_ADDRESS
      );

      if (!contract) throw new Error("SunSwap factory contract not found");

      const encodedPairAddress = await contract
        .getPair(tokenAddress, WTRX_ADDRESS)
        .call();

      if (
        !encodedPairAddress ||
        encodedPairAddress === "410000000000000000000000000000000000000000"
      )
        return null;

      return this.getAddressFromHex(encodedPairAddress);
    } catch (error) {
      console.error(`${errorLOG} ${error}`);
      return null;
    }
  }

  static async getPairInformations(pairAddress: string) {
    try {
      const contract = await this.getContractInstance(
        SUNSWAP_PAIR_ABI.entrys,
        pairAddress
      );

      if (!contract) throw new Error("No contract found");

      const reserves = (await contract.getReserves().call()) as [
        bigint,
        bigint,
        number
      ];

      if (!reserves) throw new Error("No reserves found");

      const token0 = await contract.token0().call();
      const token1 = await contract.token1().call();

      if (!token0 || !token1) throw new Error("No tokens found");

      if (this.getAddressFromHex(token0) === WTRX_ADDRESS) {
        const tokenAddress = this.getAddressFromHex(token1);

        if (!tokenAddress) throw new Error("No token addresses found");

        const reserveWTRX = new BigNumber(reserves[0].toString());
        const reserveToken = new BigNumber(reserves[1].toString());
        const timestamp = reserves[2];

        return {
          tokenAddress,
          reserveToken,
          reserveWTRX,
          timestamp,
        };
      }

      const tokenAddress = this.getAddressFromHex(token0);

      if (!tokenAddress) throw new Error("No token addresses found");

      const reserveToken = new BigNumber(reserves[0].toString());
      const reserveWTRX = new BigNumber(reserves[1].toString());
      const timestamp = reserves[2];

      return {
        tokenAddress,
        reserveToken,
        reserveWTRX,
        timestamp,
      };
    } catch (error) {
      console.error(`${errorLOG} ${error}`);
      return null;
    }
  }

  static async getAmountOutMinUsingWTRX(
    pairAddress: string,
    amountIn: number,
    slippagePercentage: number
  ) {
    const reserves = await this.getPairInformations(pairAddress);

    if (!reserves) {
      throw new Error("No reserves found");
    }

    const tokenContract = await this.getContractInstance(
      TRC20_ABI,
      reserves.tokenAddress
    );

    if (!tokenContract) {
      throw new Error("No token contract found");
    }

    const tokenDecimals = await tokenContract.decimals().call();

    if (!tokenDecimals) {
      throw new Error("No token decimals found");
    }

    const reserveToken = reserves.reserveToken.div(
      new BigNumber(10).pow(tokenDecimals)
    );

    const reserveWTRX = reserves.reserveWTRX.div(
      new BigNumber(10).pow(WTRX_DECIMALS)
    );

    const amountOutMin = reserveToken
      .multipliedBy(new BigNumber(amountIn))
      .div(reserveWTRX);

    const slippageAmount = amountOutMin
      .multipliedBy(new BigNumber(slippagePercentage))
      .div(new BigNumber(100));

    return amountOutMin.minus(slippageAmount).toFixed(0);
  }

  static async getAmountOutMinUsingToken(
    pairAddress: string,
    amountIn: number,
    slippagePercentage: number
  ) {
    const reserves = await this.getPairInformations(pairAddress);

    if (!reserves) {
      throw new Error("No reserves found");
    }

    const tokenContract = await this.getContractInstance(
      TRC20_ABI,
      reserves.tokenAddress
    );

    if (!tokenContract) {
      throw new Error("No token contract found");
    }

    const tokenDecimals = await tokenContract.decimals().call();

    if (!tokenDecimals) {
      throw new Error("No token decimals found");
    }

    const reserveToken = reserves.reserveToken.div(
      new BigNumber(10).pow(tokenDecimals)
    );

    const reserveWTRX = reserves.reserveWTRX.div(
      new BigNumber(10).pow(WTRX_DECIMALS)
    );

    const amountOutMin = reserveWTRX
      .multipliedBy(new BigNumber(amountIn))
      .div(reserveToken);

    const slippageAmount = amountOutMin
      .multipliedBy(new BigNumber(slippagePercentage))
      .div(new BigNumber(100));

    return amountOutMin.minus(slippageAmount).toFixed(0);
  }

  static async buyToken(
    tokenAddress: string,
    pairAddress: string,
    amountInWTRX: number,
    slippagePercentage: number,
    walletAddress: string,
    privateKey: string
  ) {
    try {
      const amountOutMin = await this.getAmountOutMinUsingWTRX(
        pairAddress,
        amountInWTRX,
        slippagePercentage
      );

      if (!amountOutMin) throw new Error("No amount found");

      const deadline = this.getDeadline();

      if (!deadline) throw new Error("No deadline found");

      const wrtxAddressInHEX = this.getAddressInHex(WTRX_ADDRESS, true);
      const tokenAddressInHEX = this.getAddressInHex(tokenAddress, true);
      const routerAddressInHEX = this.getAddressInHex(
        SUNSWAP_ROUTER_ADDRESS,
        false
      );
      const walletAddressInHEX = this.getAddressInHex(walletAddress, false);

      if (!tokenAddressInHEX || !wrtxAddressInHEX)
        throw new Error("No address found");

      const options = {
        callValue: new BigNumber(amountInWTRX)
          .multipliedBy(new BigNumber(10).pow(WTRX_DECIMALS))
          .toNumber(),
      } as unknown as Options;

      const parameter = [
        { type: "uint256", value: amountOutMin.toString() },
        { type: "address[]", value: [wrtxAddressInHEX, tokenAddressInHEX] },
        { type: "address", value: walletAddress },
        { type: "uint256", value: deadline },
      ];

      const { transaction } =
        await this.getInstance().transactionBuilder.triggerSmartContract(
          routerAddressInHEX,
          "swapExactETHForTokens(uint256,address[],address,uint256)",
          options,
          parameter,
          walletAddressInHEX
        );

      if (!transaction) throw new Error("No transaction found");

      const signedTransaction = await this.getInstance().trx.sign(
        transaction,
        privateKey
      );

      if (!signedTransaction) throw new Error("No signed transaction found");

      const broadcast = await this.getInstance().trx.sendRawTransaction(
        signedTransaction
      );

      if (!broadcast) throw new Error("No broadcast found");

      console.log(
        `The user bought ${amountInWTRX} WTRX of ${tokenAddress}`,
        broadcast
      );

      const result = broadcast.result;
      const tx = broadcast.transaction;

      if (!result || !tx) throw new Error("No result or transaction found");

      const tokenContract = await this.getContractInstance(
        TRC20_ABI,
        tokenAddress
      );

      if (!tokenContract) throw new Error("No token contract found");

      const decimals = await tokenContract.decimals().call();

      if (!decimals) throw new Error("No decimals found");

      const approve = await this.approveToken(
        tokenAddress,
        walletAddress,
        SUNSWAP_ROUTER_ADDRESS,
        privateKey
      );

      if (!approve) throw new Error("No approve found");

      return tx.txID;
    } catch (error) {
      console.error(`${errorLOG} ${error}`);
      return null;
    }
  }

  static async sellToken(
    tokenAddress: string,
    pairAddress: string,
    amountInTokens: number,
    slippagePercentage: number,
    walletAddress: string,
    privateKey: string
  ) {
    try {
      const tokenContract = await this.getContractInstance(
        TRC20_ABI,
        tokenAddress
      );

      if (!tokenContract) throw new Error("No token contract found");

      const decimals = await tokenContract.decimals().call();

      if (!decimals) throw new Error("No decimals found");

      const roundedAmountInTokens = Math.floor(amountInTokens * 10) / 10;

      const amountToSend = new BigNumber(roundedAmountInTokens)
        .multipliedBy(new BigNumber(10).pow(decimals))
        .toFixed(0);

      const tokenBalance = await tokenContract.balanceOf(walletAddress).call();

      if (new BigNumber(tokenBalance).lt(amountToSend))
        throw new Error("Insufficient balance");

      const amountOutMin = await this.getAmountOutMinUsingToken(
        pairAddress,
        roundedAmountInTokens,
        slippagePercentage
      );

      if (!amountOutMin) throw new Error("No amount found");

      const deadline = this.getDeadline();

      if (!deadline) throw new Error("No deadline found");

      const allowance = await this.getAllowance(
        tokenAddress,
        walletAddress,
        SUNSWAP_ROUTER_ADDRESS
      );

      if (!allowance || new BigNumber(allowance).lt(amountToSend)) {
        const approve = await this.approveToken(
          tokenAddress,
          walletAddress,
          SUNSWAP_ROUTER_ADDRESS,
          privateKey
        );

        if (!approve) throw new Error("No approve found");

        await new Promise((resolve) => setTimeout(resolve, 10000));
      }

      const wrtxAddressInHEX = this.getAddressInHex(WTRX_ADDRESS, true);
      const tokenAddressInHEX = this.getAddressInHex(tokenAddress, true);
      const routerAddressInHEX = this.getAddressInHex(
        SUNSWAP_ROUTER_ADDRESS,
        false
      );
      const walletAddressInHEX = this.getAddressInHex(walletAddress, false);

      if (!tokenAddressInHEX || !wrtxAddressInHEX)
        throw new Error("No address found");

      const parameter = [
        { type: "uint256", value: amountToSend.toString() },
        { type: "uint256", value: amountOutMin.toString() },
        { type: "address[]", value: [tokenAddressInHEX, wrtxAddressInHEX] },
        { type: "address", value: walletAddress },
        { type: "uint256", value: deadline },
      ];

      const { transaction } =
        await this.getInstance().transactionBuilder.triggerSmartContract(
          routerAddressInHEX,
          "swapExactTokensForETH(uint256,uint256,address[],address,uint256)",
          {},
          parameter,
          walletAddressInHEX
        );

      if (!transaction) throw new Error("No transaction found");

      const signedTransaction = await this.getInstance().trx.sign(
        transaction,
        privateKey
      );

      if (!signedTransaction) throw new Error("No signed transaction found");

      const broadcast = await this.getInstance().trx.sendRawTransaction(
        signedTransaction
      );

      if (!broadcast) throw new Error("No broadcast found");

      console.log(
        `The user sold ${amountInTokens} of ${tokenAddress}`,
        broadcast
      );

      const result = broadcast.result;
      const tx = broadcast.transaction;

      if (!result || !tx) throw new Error("No result or transaction found");

      return tx.txID;
    } catch (error) {
      console.error(`${errorLOG} ${error}`);
      return null;
    }
  }

  /* ------------------------------ */
  /*           TOKEN PART           */
  /* ------------------------------ */

  static async getAllowance(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string
  ) {
    try {
      const tokenContract = await this.getContractInstance(
        TRC20_ABI,
        tokenAddress
      );

      if (!tokenContract) throw new Error("No token contract found");

      const allowance = await tokenContract
        .allowance(ownerAddress, spenderAddress)
        .call();

      if (!allowance) throw new Error("No allowance found");

      return new BigNumber(allowance.toString());
    } catch (error) {
      console.error(`${errorLOG} ${error}`);
      return null;
    }
  }

  static async approveToken(
    tokenAddress: string,
    walletAddress: string,
    ownerAddress: string,
    privateKey: string
  ) {
    try {
      const tokenContract = await this.getContractInstance(
        TRC20_ABI,
        tokenAddress
      );

      if (!tokenContract) throw new Error("No token contract found");

      const parameter = [
        { type: "address", value: ownerAddress },
        {
          type: "uint256",
          value:
            "115792089237316195423570985008687907853269984665640564039457584007913129639935",
        },
      ];

      const { transaction } =
        await this.getInstance().transactionBuilder.triggerSmartContract(
          tokenAddress,
          "approve(address,uint256)",
          {},
          parameter,
          walletAddress
        );

      if (!transaction) throw new Error("No transaction found");

      const signedTransaction = await this.getInstance().trx.sign(
        transaction,
        privateKey
      );

      if (!signedTransaction) throw new Error("No signed transaction found");

      const broadcast = await this.getInstance().trx.sendRawTransaction(
        signedTransaction
      );

      if (!broadcast) throw new Error("No broadcast found");

      console.log(`The user approved ${tokenAddress}`, broadcast);

      const result = broadcast.result;
      const tx = broadcast.transaction;

      if (!result || !tx) throw new Error("No result or transaction found");

      return tx.txID;
    } catch (error) {
      console.error(`${errorLOG} ${error}`);
      return null;
    }
  }

  static async getPriceOfTRX() {
    const CACHE_DURATION = 60 * 1000;
    if (
      this.cachedTRXPrice &&
      Date.now() - this.cacheTimestamp < CACHE_DURATION
    )
      return this.cachedTRXPrice;

    try {
      const res = await fetch(
        "https://apilist.tronscanapi.com/api/token/price?token=trx"
      );
      const data = await res.json();

      if (!data || !data.price_in_usd) throw new Error("No data found");

      this.cachedTRXPrice = data.price_in_usd;
      this.cacheTimestamp = Date.now();

      return this.cachedTRXPrice;
    } catch (error) {
      console.error(`${errorLOG} ${error}`);
      return 0;
    }
  }

  static async getTokenInformations(pairAddress: string) {
    try {
      const res = await fetch(
        `https://api.dexscreener.com/latest/dex/pairs/tron/${pairAddress}`
      );

      const data = (await res.json()) as {
        pair: {
          baseToken: {
            name: string;
            symbol: string;
          };
          priceNative: string;
          priceUsd: string;
          volume: {
            h24: number;
          };
          liquidity: {
            usd: number;
            base: number;
            quote: number;
          };
          fdv: number;
          pairCreatedAt: number;
        };
      };

      if (!data || !data.pair) throw new Error("No data found");

      const pair = data.pair;

      const price = await this.getPriceOfTRX();

      if (!price) throw new Error("No price found");

      const marketCapInUSD = pair.fdv * price;

      return {
        name: pair.baseToken.name,
        symbol: pair.baseToken.symbol,
        tokenPriceInUSD: Number(pair.priceUsd),
        volumeInUSD: pair.volume.h24,
        liquidityInUSD: pair.liquidity.usd,
        marketCapInUSD,
        pairCreatedAt: pair.pairCreatedAt,
      };
    } catch (error) {
      console.error(`${errorLOG} ${error}`);
      return null;
    }
  }

  /* ------------------------------ */
  /*           UTILS PART           */
  /* ------------------------------ */

  static getAddressFromHex(hex: string) {
    return this.instance.address.fromHex(hex);
  }

  static getAddressInHex(address: string, withPrefix: boolean) {
    const addressInHex = this.instance.address.toHex(address);
    return withPrefix ? "0x" + addressInHex.slice(2) : addressInHex;
  }

  static getDeadline() {
    return Math.floor(Date.now() / 1000) + 60 * 2;
  }
}

export default SniperUtils;
