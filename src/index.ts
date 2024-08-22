import "dotenv/config";
import { Collection, MongoClient } from "mongodb";
import TelegramBot from "node-telegram-bot-api";
import {
  buyTokenCallback,
  cancelSnipeCallback,
  changeSlippageCallback,
  changeSlippageSellCallback,
  confirmBuyCallback,
  enterAmountCallback,
  myPositionsCallback,
  mySnipesCallback,
  refreshCallback,
  refreshSellCallback,
  sellCustomTokenCallback,
  sellTokenCallback,
  snipeNowCallback,
  snipeTokenCallback,
  tokenSentCallback,
} from "./callbacks/tokens";
import {
  addWalletCallback,
  genWalletCallback,
  importWalletCallback,
  refreshWalletCallback,
  removeWalletCallback,
  removeWalletIndexCallback,
  walletCallback,
  walletInfoCallback,
  walletInfoIndexCallback,
} from "./callbacks/wallets";
import { startCommand } from "./commands/start";
import { GENERIC_ERROR_MESSAGE } from "./config";
import { processSnipes } from "./server/processSnipes";
import { errorLOG, informationsLOG, successLOG } from "./utils/logs";
import SniperUtils from "./utils/tronWeb";

const token = process.env.TELEGRAM_BOT_TOKEN as string;
const bot = new TelegramBot(token, { polling: true });

const mongoUri = process.env.MONGODB_URI as string;
const client = new MongoClient(mongoUri);

const dbName = process.env.MONGODB_DB_NAME as string;
const usersCollectionName = process.env.MONGODB_COLLECTION_NAME as string;

async function getOrCreateUser(
  chatId: number,
  usersCollection: Collection
): Promise<User | null> {
  let user = (await usersCollection.findOne({ id: chatId })) as User | null;
  if (!user) {
    await usersCollection.insertOne({
      id: chatId,
      wallets: [],
      snipes: [],
    } as User);
    user = (await usersCollection.findOne({ id: chatId })) as User | null;
  }
  return user;
}

async function main() {
  try {
    console.log(`${informationsLOG} Initializing SniperUtils...`);
    await SniperUtils.initialize();
    console.log(`${successLOG} Initialized SniperUtils...`);

    console.log(`${informationsLOG} Connecting to MongoDB...`);
    await client.connect();
    console.log(`${successLOG} Connected to MongoDB...`);

    console.log(`${informationsLOG} Starting processSnipes interval...`);
    setInterval(() => {
      processSnipes(bot, usersCollection);
    }, 5000);
    console.log(`${successLOG} Started processSnipes interval...`);

    const db = client.db(dbName);
    const usersCollection = db.collection(usersCollectionName);
    await usersCollection.createIndex({ id: 1 }, { unique: true });

    console.log(`${informationsLOG} Setting up bot...`);

    bot.onText(/\/start/, async (msg: TelegramBot.Message) => {
      startCommand(msg, bot);
    });

    bot.onText(/\/wallets/, async (msg: TelegramBot.Message) => {
      const chatId = msg.chat.id;

      const user = await getOrCreateUser(chatId, usersCollection);

      if (!user) {
        console.error(`${errorLOG} User not found.`);
        return;
      }

      await walletCallback(user, bot, chatId);
    });

    bot.onText(/\/positions/, async (msg: TelegramBot.Message) => {
      const chatId = msg.chat.id;

      const user = await getOrCreateUser(chatId, usersCollection);

      if (!user) {
        console.error(`${errorLOG} User not found.`);
        return;
      }

      await myPositionsCallback(user, bot, chatId);
    });

    bot.onText(/\/pendingsnipes/, async (msg: TelegramBot.Message) => {
      const chatId = msg.chat.id;

      const user = await getOrCreateUser(chatId, usersCollection);

      if (!user) {
        console.error(`${errorLOG} User not found.`);
        return;
      }

      await mySnipesCallback(user, bot, chatId);
    });

    bot.on("message", async (msg) => {
      try {
        if (!msg.text) return;

        const chatId = msg.chat.id;
        const text = msg.text;

        if (text.startsWith("/")) return;

        if (text.length !== 34) return;

        const user = await getOrCreateUser(chatId, usersCollection);

        if (!user) {
          console.error(`${errorLOG} User not found.`);
          return;
        }

        await tokenSentCallback(bot, chatId, text);
      } catch (error) {
        const chatId = msg.chat.id;
        console.error(`${errorLOG} ${error}`);
        bot.sendMessage(chatId, GENERIC_ERROR_MESSAGE, {
          reply_markup: {
            inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
          },
        });
      }
    });

    bot.on("callback_query", async (callbackQuery) => {
      try {
        const message = callbackQuery.message;

        if (!message) return;

        const chatId = message.chat.id;
        const data = callbackQuery.data;

        if (!data) return;

        const user = await getOrCreateUser(chatId, usersCollection);

        if (!user) {
          console.error(`${errorLOG} User not found.`);
          return;
        }

        if (data.startsWith("remove_wallet_")) {
          const index = parseInt(data.split("_")[2]);
          await removeWalletIndexCallback(
            usersCollection,
            user,
            bot,
            chatId,
            message,
            index
          );
          bot.answerCallbackQuery(callbackQuery.id);
          return;
        } else if (data.startsWith("wallet_info_")) {
          const index = parseInt(data.split("_")[2]);
          await walletInfoIndexCallback(user, bot, chatId, message, index);
          bot.answerCallbackQuery(callbackQuery.id);
          return;
        } else if (data.startsWith("enter_custom_")) {
          const tokenAddress = data.split("_")[2];
          const slippage = parseFloat(data.split("_")[3]);
          await enterAmountCallback(bot, chatId, tokenAddress, slippage);
          bot.answerCallbackQuery(callbackQuery.id);
          return;
        } else if (data.startsWith("change_slippage_")) {
          const tokenAddress = data.split("_")[2];
          await changeSlippageCallback(bot, chatId, tokenAddress, message);
          bot.answerCallbackQuery(callbackQuery.id);
          return;
        } else if (data.startsWith("refreshbuy_")) {
          const tokenAddress = data.split("_")[1];
          const slippage = parseFloat(data.split("_")[2]);
          await refreshCallback(bot, chatId, tokenAddress, slippage, message);
          bot.answerCallbackQuery(callbackQuery.id);
          return;
        } else if (data.startsWith("enter_")) {
          const amount = parseFloat(data.split("_")[1]);
          const tokenAddress = data.split("_")[2];
          const slippage = parseFloat(data.split("_")[3]);
          await buyTokenCallback(
            user,
            bot,
            chatId,
            amount,
            tokenAddress,
            slippage
          );
          bot.answerCallbackQuery(callbackQuery.id);
          return;
        } else if (data.startsWith("buy_")) {
          const index = parseInt(data.split("_")[1]);
          const amount = parseFloat(data.split("_")[2]);
          const tokenAddress = data.split("_")[3];
          const slippage = parseFloat(data.split("_")[4]);
          await confirmBuyCallback(
            user,
            bot,
            chatId,
            index,
            amount,
            tokenAddress,
            slippage
          );
          bot.answerCallbackQuery(callbackQuery.id);
          return;
        } else if (data.startsWith("refreshsell_")) {
          const walletIndex = Number(data.split("_")[1]);
          const tokenAddress = data.split("_")[2];
          const slippage = parseFloat(data.split("_")[3]);
          await refreshSellCallback(
            user,
            bot,
            chatId,
            walletIndex,
            tokenAddress,
            slippage,
            message
          );
          bot.answerCallbackQuery(callbackQuery.id);
          return;
        } else if (data.startsWith("change_slippagesell_")) {
          const walletIndex = Number(data.split("_")[2]);
          const tokenAddress = data.split("_")[3];
          await changeSlippageSellCallback(
            user,
            bot,
            chatId,
            walletIndex,
            tokenAddress,
            message
          );
          bot.answerCallbackQuery(callbackQuery.id);
          return;
        } else if (data.startsWith("sell_")) {
          const percentageToSell = parseFloat(data.split("_")[1]);
          const walletIndex = Number(data.split("_")[2]);
          const tokenAddress = data.split("_")[3];
          const slippage = parseFloat(data.split("_")[4]);
          await sellTokenCallback(
            user,
            bot,
            chatId,
            walletIndex,
            percentageToSell,
            tokenAddress,
            slippage
          );
          bot.answerCallbackQuery(callbackQuery.id);
          return;
        } else if (data.startsWith("sellcustom_")) {
          const walletIndex = Number(data.split("_")[1]);
          const tokenAddress = data.split("_")[2];
          const slippage = parseFloat(data.split("_")[3]);
          await sellCustomTokenCallback(
            user,
            bot,
            chatId,
            walletIndex,
            tokenAddress,
            slippage
          );
          bot.answerCallbackQuery(callbackQuery.id);
          return;
        } else if (data.startsWith("snipe_")) {
          const tokenAddress = data.split("_")[1];
          await snipeTokenCallback(user, bot, chatId, tokenAddress);
          bot.answerCallbackQuery(callbackQuery.id);
          return;
        } else if (data.startsWith("snipenow_")) {
          const walletIndex = Number(data.split("_")[1]);
          const tokenAddress = data.split("_")[2];
          await snipeNowCallback(
            usersCollection,
            user,
            bot,
            chatId,
            walletIndex,
            tokenAddress
          );
          bot.answerCallbackQuery(callbackQuery.id);
          return;
        } else if (data.startsWith("cancel_snipe_")) {
          const tokenAddress = data.split("_")[2];
          await cancelSnipeCallback(usersCollection, bot, chatId, tokenAddress);
          bot.answerCallbackQuery(callbackQuery.id);
          return;
        }

        switch (data) {
          case "wallets":
            await walletCallback(user, bot, chatId);
            break;

          case "add_wallet":
            await addWalletCallback(bot, chatId);
            break;

          case "import_wallet":
            await importWalletCallback(
              usersCollection,
              user,
              bot,
              chatId,
              message
            );
            break;

          case "generate_wallet":
            await genWalletCallback(
              usersCollection,
              user,
              bot,
              chatId,
              message
            );
            break;

          case "mypositions":
            await myPositionsCallback(user, bot, chatId);
            break;

          case "wallet_info":
            await walletInfoCallback(user, bot, chatId, message);
            break;

          case "remove_wallet":
            await removeWalletCallback(user, bot, chatId, message);
            break;

          case "refresh_wallet":
            await refreshWalletCallback(user, bot, chatId, message);
            break;

          case "mypendingsnipes":
            await mySnipesCallback(user, bot, chatId);
            break;

          case "close":
            bot.deleteMessage(chatId, message.message_id);
            break;

          default:
            console.error(`${errorLOG} Unknown command.`);
            bot.sendMessage(chatId, "Unknown command.", {
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
        }

        bot.answerCallbackQuery(callbackQuery.id);
      } catch (error) {
        if (!callbackQuery.message) return;

        const chatId = callbackQuery.message.chat.id;
        console.error(`${errorLOG} ${error}`);
        bot.sendMessage(chatId, GENERIC_ERROR_MESSAGE, {
          reply_markup: {
            inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
          },
        });
      }
    });

    console.log(`${successLOG} TRON Sniper/Trading Bot is running...`);
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
  }
}

main().catch(console.error);
