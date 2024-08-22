import TelegramBot from "node-telegram-bot-api";
import { GENERIC_ERROR_MESSAGE } from "../config.js";
import { errorLOG } from "../utils/logs.js";

/* ------------------------------ */
/*          START COMMAND         */
/* ------------------------------ */

export function startCommand(msg: TelegramBot.Message, bot: TelegramBot) {
  try {
    const chatId = msg.chat.id;

    const text = `Welcome to TRON Sniper Bot

🔹 The ultimate bot for sniping and trading on TRON.

💡 _Enter the token address below to get started_

[X](https://x.com/impredmet)`;

    bot.sendPhoto(chatId, `https://i.ibb.co/CBFZwn2/TRANCHESBOT-BANNER.png`, {
      caption: text,
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, GENERIC_ERROR_MESSAGE, {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}
