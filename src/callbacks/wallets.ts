import BigNumber from "bignumber.js";
import TelegramBot from "node-telegram-bot-api";
import { WTRX_DECIMALS } from "../config";
import { errorLOG } from "../utils/logs";
import SniperUtils from "../utils/tronWeb";

export async function walletCallback(
  user: User,
  bot: TelegramBot,
  chatId: number
) {
  try {
    const wallets = user.wallets as Wallet[];

    if (wallets.length === 0) {
      bot.sendMessage(chatId, "You don't have any wallets yet.", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "➕ Add Wallet",
                callback_data: "add_wallet",
              },
            ],
            [
              {
                text: "🔄 Refresh",
                callback_data: "refresh_wallet",
              },
              {
                text: "🔙 Back",
                callback_data: "close",
              },
            ],
          ],
        },
      });

      return;
    }

    const balances = await Promise.all(
      wallets.map(async (wallet) => {
        const balance = await SniperUtils.getBalance(wallet.address);

        const balanceTRX = new BigNumber(balance).div(
          new BigNumber(10).pow(WTRX_DECIMALS)
        );

        return `💰 *${balanceTRX.toFixed(2)} TRX* in \`${wallet.address}\`\n`;
      })
    );

    const balancesText = balances.map((balance) => balance);

    const text = `🔑 *Wallets*

${balancesText.join("")}
💣 Number of wallets: ${wallets.length}/10`;

    bot.sendMessage(chatId, text, {
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "➕ Add Wallet",
              callback_data: "add_wallet",
            },
          ],
          [
            {
              text: "🔍 Wallet Info",
              callback_data: "wallet_info",
            },
            {
              text: "🗑 Remove Wallet",
              callback_data: "remove_wallet",
            },
          ],
          [
            {
              text: "🔄 Refresh",
              callback_data: "refresh_wallet",
            },
            {
              text: "🔙 Back",
              callback_data: "close",
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while fetching the wallets.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function addWalletCallback(bot: TelegramBot, chatId: number) {
  try {
    const text = `🔑 *Add Wallet*

How would you like to add your wallet?`;

    bot.sendMessage(chatId, text, {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "🔑 Import Wallet",
              callback_data: "import_wallet",
            },
          ],
          [
            {
              text: "🔑 Generate Wallet",
              callback_data: "generate_wallet",
            },
          ],
          [
            {
              text: "🔙 Back",
              callback_data: "close",
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while adding the wallet.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function genWalletCallback(
  usersCollection: any,
  user: User,
  bot: TelegramBot,
  chatId: number,
  message: TelegramBot.Message
) {
  try {
    if (user.wallets.length >= 10) {
      bot.sendMessage(chatId, "You can't have more than 10 wallets.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });

      return;
    }

    const wallet = (await SniperUtils.createAccount()) as {
      privateKey: string;
      publicKey: string;
      address: {
        base58: string;
        hex: string;
      };
    };

    if (!wallet) throw new Error("Error while creating the wallet.");

    await usersCollection.updateOne(
      { id: chatId },
      {
        $push: {
          wallets: {
            privateKey: wallet.privateKey,
            address: wallet.address.base58,
          },
        },
      }
    );

    bot.deleteMessage(chatId, message.message_id);

    const textNewWallet = `💣 *New Taproot (P2TR) Wallet Generated*

Your wallet address is: \`${wallet.address.base58}\`

Your wallet private key is: \`${wallet.privateKey}\``;

    bot.sendMessage(chatId, textNewWallet, {
      reply_markup: {
        inline_keyboard: [[{ text: "🔙 Back", callback_data: "close" }]],
      },
      parse_mode: "Markdown",
    });
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while generating the wallet.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function importWalletCallback(
  usersCollection: any,
  user: User,
  bot: TelegramBot,
  chatId: number,
  message: TelegramBot.Message
) {
  try {
    if (user.wallets.length >= 10) {
      bot.sendMessage(chatId, "You can't have more than 10 wallets.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });

      return;
    }

    const text = `🔑 *Import Wallet*

Please enter your private key.`;

    bot.deleteMessage(chatId, message.message_id);

    bot
      .sendMessage(chatId, text, {
        parse_mode: "Markdown",
        reply_markup: {
          force_reply: true,
          selective: true,
        },
      })
      .then((msg) => {
        bot.onReplyToMessage(chatId, msg.message_id, async (reply) => {
          try {
            const privateKey = reply.text;

            if (!privateKey) {
              bot.sendMessage(chatId, "Invalid private key.", {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: "❌ Close", callback_data: "close" }],
                  ],
                },
              });

              return;
            }

            const address = SniperUtils.importAccount(privateKey);

            if (!address) throw new Error("Error while importing the wallet.");

            const wallets = user.wallets as Wallet[];

            if (wallets.some((wallet) => wallet.address === address)) {
              bot.sendMessage(chatId, "This wallet already exists.", {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: "❌ Close", callback_data: "close" }],
                  ],
                },
              });

              return;
            }

            await usersCollection.updateOne(
              { id: chatId },
              {
                $push: {
                  wallets: {
                    privateKey,
                    address,
                  },
                },
              }
            );

            const textNewWallet = `💣 *New Taproot (P2TR) Wallet Imported*

Your wallet address is: \`${address}\`

Your wallet private key is: \`${privateKey}\``;

            bot.sendMessage(chatId, textNewWallet, {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔙 Back", callback_data: "close" }],
                ],
              },
              parse_mode: "Markdown",
            });
          } catch (error) {
            console.error(`${errorLOG} ${error}`);
            bot.sendMessage(
              chatId,
              "An error occurred while importing the wallet.",
              {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: "❌ Close", callback_data: "close" }],
                  ],
                },
              }
            );
          }
        });
      });
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while importing the wallet.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function walletInfoCallback(
  user: User,
  bot: TelegramBot,
  chatId: number,
  message: TelegramBot.Message
) {
  try {
    const wallets = user.wallets;

    if (wallets.length === 0) {
      bot.editMessageText("You don't have any wallets yet.", {
        chat_id: chatId,
        message_id: message.message_id,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "➕ Add Wallet",
                callback_data: "add_wallet",
              },
            ],
            [
              {
                text: "🔄 Refresh",
                callback_data: "refresh_wallet",
              },
              {
                text: "🔙 Back",
                callback_data: "close",
              },
            ],
          ],
        },
      });

      return;
    }

    const walletsText = wallets.map((wallet: Wallet, index: number) => {
      const address = wallet.address;

      return `💰 *${index + 1}* · \`${address}\`\n\n`;
    });

    const text = `🔑 *Wallets*

Which wallet would you like to view?

${walletsText.join("")}`;

    bot.editMessageText(text, {
      chat_id: chatId,
      message_id: message.message_id,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: wallets.map((_: any, index: number) => [
          {
            text: `🔍 Wallet ${index + 1}`,
            callback_data: `wallet_info_${index}`,
          },
        ]),
      },
    });
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while fetching the wallets.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function walletInfoIndexCallback(
  user: User,
  bot: TelegramBot,
  chatId: number,
  message: TelegramBot.Message,
  index: number
) {
  try {
    const wallets = user.wallets;

    if (wallets.length === 0) {
      bot.editMessageText("You don't have any wallets yet.", {
        chat_id: chatId,
        message_id: message.message_id,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "➕ Add Wallet",
                callback_data: "add_wallet",
              },
            ],
            [
              {
                text: "🔄 Refresh",
                callback_data: "refresh_wallet",
              },
              {
                text: "🔙 Back",
                callback_data: "close",
              },
            ],
          ],
        },
      });

      return;
    }

    const wallet = wallets[index];

    const address = wallet.address;

    bot.editMessageText(
      `💰 *Wallet Info*

Your wallet address is: \`${address}\`

Your wallet private key is: \`${wallet.privateKey}\``,
      {
        chat_id: chatId,
        message_id: message.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔙 Back",
                callback_data: "close",
              },
            ],
          ],
        },
      }
    );
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while fetching the wallets.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function removeWalletCallback(
  user: User,
  bot: TelegramBot,
  chatId: number,
  message: TelegramBot.Message
) {
  try {
    const wallets = user.wallets;

    if (wallets.length === 0) {
      bot.editMessageText("You don't have any wallets yet.", {
        chat_id: chatId,
        message_id: message.message_id,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "➕ Add Wallet",
                callback_data: "add_wallet",
              },
            ],
            [
              {
                text: "🔄 Refresh",
                callback_data: "refresh_wallet",
              },
              {
                text: "🔙 Back",
                callback_data: "close",
              },
            ],
          ],
        },
      });

      return;
    }

    const walletsText = wallets.map((wallet: Wallet, index: number) => {
      const address = wallet.address;

      return `💰 *${index + 1}* · \`${address}\`\n\n`;
    });

    const text = `🔑 *Remove Wallet*

Which wallet would you like to remove?

${walletsText.join("")}`;

    bot.editMessageText(text, {
      chat_id: chatId,
      message_id: message.message_id,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: wallets.map((_: any, index: number) => [
          {
            text: `❌ Remove Wallet ${index + 1}`,
            callback_data: `remove_wallet_${index}`,
          },
        ]),
      },
    });
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while removing the wallet.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function removeWalletIndexCallback(
  usersCollection: any,
  user: User,
  bot: TelegramBot,
  chatId: number,
  message: TelegramBot.Message,
  index: number
) {
  try {
    const wallets = user.wallets;

    if (wallets.length === 0) {
      bot.editMessageText("You don't have any wallets yet.", {
        chat_id: chatId,
        message_id: message.message_id,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "➕ Add Wallet",
                callback_data: "add_wallet",
              },
            ],
            [
              {
                text: "🔄 Refresh",
                callback_data: "refresh_wallet",
              },
              {
                text: "🔙 Back",
                callback_data: "close",
              },
            ],
          ],
        },
      });

      return;
    }

    const wallet = wallets[index];

    await usersCollection.updateOne(
      { id: chatId },
      {
        $pull: {
          wallets: {
            address: wallet.address,
          },
        },
      }
    );

    bot.editMessageText(
      `💣 *Wallet Removed*

Your wallet address was: \`${wallet.address}\`

Your wallet private key (WIF format) was: \`${wallet.privateKey}\``,
      {
        chat_id: chatId,
        message_id: message.message_id,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔙 Back",
                callback_data: "close",
              },
            ],
          ],
        },
      }
    );
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while removing the wallet.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function refreshWalletCallback(
  user: User,
  bot: TelegramBot,
  chatId: number,
  message: TelegramBot.Message
) {
  try {
    const wallets = user.wallets;

    if (wallets.length === 0) {
      bot.editMessageText("You don't have any wallets yet.", {
        chat_id: chatId,
        message_id: message.message_id,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "➕ Add Wallet",
                callback_data: "add_wallet",
              },
            ],
            [
              {
                text: "🔄 Refresh",
                callback_data: "refresh_wallet",
              },
              {
                text: "🔙 Back",
                callback_data: "close",
              },
            ],
          ],
        },
      });

      return;
    }

    const balances = await Promise.all(
      wallets.map(async (wallet) => {
        const balance = await SniperUtils.getBalance(wallet.address);

        const balanceTRX = new BigNumber(balance).div(
          new BigNumber(10).pow(WTRX_DECIMALS)
        );

        return `💰 *${balanceTRX.toFixed(2)} TRX* in \`${wallet.address}\`\n`;
      })
    );

    const balancesText = balances.map((balance) => balance);

    const text = `🔑 *Wallets*

${balancesText.join("")}
💣 Number of wallets: ${wallets.length}/10`;

    bot.editMessageText(text, {
      chat_id: chatId,
      message_id: message.message_id,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "➕ Add Wallet",
              callback_data: "add_wallet",
            },
          ],
          [
            {
              text: "🔍 Wallet Info",
              callback_data: "wallet_info",
            },
            {
              text: "🗑 Remove Wallet",
              callback_data: "remove_wallet",
            },
          ],
          [
            {
              text: "🔄 Refresh",
              callback_data: "refresh_wallet",
            },
            {
              text: "🔙 Back",
              callback_data: "close",
            },
          ],
        ],
      },
    });
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while refreshing the wallets.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}
