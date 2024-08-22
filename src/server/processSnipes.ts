import TelegramBot from "node-telegram-bot-api";
import { confirmBuyCallback } from "../callbacks/tokens";
import { errorLOG } from "../utils/logs";
import SniperUtils from "../utils/tronWeb";

/* ------------------------------ */
/*           SNIPE PART           */
/* ------------------------------ */

export async function processSnipes(bot: TelegramBot, usersCollection: any) {
  try {
    const users = await usersCollection.find().toArray();

    for (const user of users) {
      const { id: chatId, snipes } = user;

      if (!snipes || snipes.length === 0) continue;

      for (const snipe of snipes) {
        const {
          address: tokenAddress,
          amountToInvestInTRX,
          privateKey,
          slippage,
        } = snipe;

        const walletIndex = user.wallets.findIndex(
          (wallet: Wallet) => wallet.privateKey === privateKey
        );

        if (walletIndex === -1) {
          console.log(
            `Wallet with private key ${privateKey} not found for user: ${chatId}`
          );
          continue;
        }

        const pairAddress = await SniperUtils.getPairAddress(tokenAddress);

        if (!pairAddress) {
          console.log(
            `${chatId}: Still waiting for pair address for ${tokenAddress}`
          );
          continue;
        }

        bot.sendMessage(
          chatId,
          `Buying ${amountToInvestInTRX} TRX of ${tokenAddress} with slippage ${slippage}%...`
        );

        await confirmBuyCallback(
          user,
          bot,
          chatId,
          walletIndex,
          amountToInvestInTRX,
          tokenAddress,
          slippage
        );
      }
    }
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
  }
}
