import BigNumber from "bignumber.js";
import TelegramBot from "node-telegram-bot-api";
import { TRC20_ABI, WTRX_DECIMALS } from "../config";
import { formatElapsedTime, formatNumber } from "../utils/format";
import { errorLOG } from "../utils/logs";
import SniperUtils from "../utils/tronWeb";

/* ------------------------------ */
/*            BUY PART            */
/* ------------------------------ */

export async function tokenSentCallback(
  bot: TelegramBot,
  chatId: number,
  tokenAddress: string
) {
  try {
    const tokenContract = await SniperUtils.getContractInstance(
      TRC20_ABI,
      tokenAddress
    );

    if (!tokenContract) {
      bot.sendMessage(chatId, "Invalid token address.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const testContract = await tokenContract.name().call();

    if (!testContract) {
      bot.sendMessage(chatId, "Invalid token address.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const pairAddress = await SniperUtils.getPairAddress(tokenAddress);

    if (!pairAddress) {
      bot.sendMessage(chatId, `Would you like to snipe ${testContract}?`, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔥 Snipe",
                callback_data: `snipe_${tokenAddress}`,
              },
            ],
            [
              {
                text: "❌ Close",
                callback_data: "close",
              },
            ],
          ],
        },
      });
      return;
    }

    const tokenInformations = await SniperUtils.getTokenInformations(
      pairAddress
    );

    if (!tokenInformations) {
      bot.sendMessage(chatId, "Invalid token address.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const slippagePercentage = 10;

    bot.sendMessage(
      chatId,
      `💎 *${tokenInformations.name}* (${
        tokenInformations.symbol
      }) | ⏰ ${formatElapsedTime(new Date(tokenInformations.pairCreatedAt))}

💰 *Market Cap*: $${formatNumber(tokenInformations.marketCapInUSD)}
💧 *Liquidity*: $${formatNumber(tokenInformations.liquidityInUSD)}
📊 *24h Volume*: $${formatNumber(tokenInformations.volumeInUSD)}

💵 *Price*: $${tokenInformations.tokenPriceInUSD.toLocaleString()}

⚖️ *Slippage*: ${slippagePercentage}%`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔹 Buy 100 TRX",
                callback_data: `enter_10_${tokenAddress}_${slippagePercentage}`,
              },
              {
                text: "🔹 Buy 1,000 TRX",
                callback_data: `enter_100_${tokenAddress}_${slippagePercentage}`,
              },
            ],
            [
              {
                text: "🔹 Buy 10,000 TRX",
                callback_data: `enter_1000_${tokenAddress}_${slippagePercentage}`,
              },
              {
                text: "🔸 Buy custom amount",
                callback_data: `enter_custom_${tokenAddress}_${slippagePercentage}`,
              },
            ],
            [
              {
                text: "🔄 Refresh",
                callback_data: `refreshbuy_${tokenAddress}_${slippagePercentage}`,
              },
            ],
            [
              {
                text: "⚙️ Change slippage",
                callback_data: `change_slippage_${tokenAddress}`,
              },
            ],
          ],
        },
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "Invalid token address.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function enterAmountCallback(
  bot: TelegramBot,
  chatId: number,
  tokenAddress: string,
  slippage: number
) {
  try {
    const text = `Enter the amount of TRX you want to spend on this token.`;

    bot
      .sendMessage(chatId, text, {
        reply_markup: {
          force_reply: true,
        },
      })
      .then((msg) => {
        bot.onReplyToMessage(chatId, msg.message_id, (reply) => {
          const amount = reply.text;

          if (!amount) {
            bot.sendMessage(chatId, "Invalid amount.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
            return;
          }

          const parsedNumber = parseInt(amount);

          if (isNaN(parsedNumber)) {
            bot.sendMessage(chatId, "Invalid amount.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
            return;
          }

          if (parsedNumber <= 0) {
            bot.sendMessage(chatId, "Amount must be greater than 0.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
            return;
          }

          bot.sendMessage(
            chatId,
            `You will spend ${parsedNumber} TRX on this token. Confirm?`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "✅ Confirm",
                      callback_data: `enter_${parsedNumber}_${tokenAddress}_${slippage}`,
                    },
                    {
                      text: "❌ Cancel",
                      callback_data: `close`,
                    },
                  ],
                ],
              },
            }
          );
        });
      });
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while entering the amount.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function changeSlippageCallback(
  bot: TelegramBot,
  chatId: number,
  tokenAddress: string,
  message: TelegramBot.Message
) {
  try {
    const text = `Enter the slippage percentage you want to use.`;

    bot
      .sendMessage(chatId, text, {
        reply_markup: {
          force_reply: true,
        },
      })
      .then((msg) => {
        bot.onReplyToMessage(chatId, msg.message_id, async (reply) => {
          const slippageText = reply.text;

          if (!slippageText) {
            bot.sendMessage(chatId, "Invalid slippage.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
            return;
          }

          const slippage = parseInt(slippageText);

          if (isNaN(slippage)) {
            bot.sendMessage(chatId, "Invalid slippage.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
            return;
          }

          if (slippage < 0 || slippage > 100) {
            bot.sendMessage(chatId, "Slippage must be between 0 and 100.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
            return;
          }

          const pairAddress = await SniperUtils.getPairAddress(tokenAddress);

          if (!pairAddress) {
            bot.sendMessage(chatId, "No pair found for this token.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
            return;
          }

          const tokenInformations = await SniperUtils.getTokenInformations(
            pairAddress
          );

          if (!tokenInformations) {
            bot.sendMessage(chatId, "Token informations not found.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
            return;
          }

          bot.editMessageText(
            `💎 *${tokenInformations.name}* (${
              tokenInformations.symbol
            }) | ⏰ ${formatElapsedTime(
              new Date(tokenInformations.pairCreatedAt)
            )}

💰 *Market Cap*: $${formatNumber(tokenInformations.marketCapInUSD)}
💧 *Liquidity*: $${formatNumber(tokenInformations.liquidityInUSD)}
📊 *24h Volume*: $${formatNumber(tokenInformations.volumeInUSD)}

💵 *Price*: $${tokenInformations.tokenPriceInUSD.toLocaleString()}

⚖️ *Slippage*: ${slippage}%`,
            {
              chat_id: chatId,
              message_id: message.message_id,
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "🔹 Buy 100 TRX",
                      callback_data: `enter_10_${tokenAddress}_${slippage}`,
                    },
                    {
                      text: "🔹 Buy 1,000 TRX",
                      callback_data: `enter_100_${tokenAddress}_${slippage}`,
                    },
                  ],
                  [
                    {
                      text: "🔹 Buy 10,000 TRX",
                      callback_data: `enter_1000_${tokenAddress}_${slippage}`,
                    },
                    {
                      text: "🔸 Buy custom amount",
                      callback_data: `enter_custom_${tokenAddress}_${slippage}`,
                    },
                  ],
                  [
                    {
                      text: "🔄 Refresh",
                      callback_data: `refreshbuy_${tokenAddress}_${slippage}`,
                    },
                  ],
                  [
                    {
                      text: "⚙️ Change slippage",
                      callback_data: `change_slippage_${tokenAddress}`,
                    },
                  ],
                ],
              },
              parse_mode: "Markdown",
            }
          );

          bot.sendMessage(
            chatId,
            "Slippage changed successfully to " + slippage + "%",
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            }
          );
        });
      });
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while changing the slippage.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function refreshCallback(
  bot: TelegramBot,
  chatId: number,
  tokenAddress: string,
  slippage: number,
  message: TelegramBot.Message
) {
  try {
    const pairAddress = await SniperUtils.getPairAddress(tokenAddress);

    if (!pairAddress) {
      bot.sendMessage(chatId, "No pair found for this token.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const tokenInformations = await SniperUtils.getTokenInformations(
      pairAddress
    );

    if (!tokenInformations) {
      bot.sendMessage(chatId, "Token informations not found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    bot.editMessageText(
      `💎 *${tokenInformations.name}* (${
        tokenInformations.symbol
      }) | ⏰ ${formatElapsedTime(new Date(tokenInformations.pairCreatedAt))}

💰 *Market Cap*: $${formatNumber(tokenInformations.marketCapInUSD)}
💧 *Liquidity*: $${formatNumber(tokenInformations.liquidityInUSD)}
📊 *24h Volume*: $${formatNumber(tokenInformations.volumeInUSD)}

💵 *Price*: $${tokenInformations.tokenPriceInUSD.toLocaleString()}

⚖️ *Slippage*: ${slippage}%`,
      {
        chat_id: chatId,
        message_id: message.message_id,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔹 Buy 100 TRX",
                callback_data: `enter_10_${tokenAddress}_${slippage}`,
              },
              {
                text: "🔹 Buy 1,000 TRX",
                callback_data: `enter_100_${tokenAddress}_${slippage}`,
              },
            ],
            [
              {
                text: "🔹 Buy 10,000 TRX",
                callback_data: `enter_1000_${tokenAddress}_${slippage}`,
              },
              {
                text: "🔸 Buy custom amount",
                callback_data: `enter_custom_${tokenAddress}_${slippage}`,
              },
            ],
            [
              {
                text: "🔄 Refresh",
                callback_data: `refreshbuy_${tokenAddress}_${slippage}`,
              },
            ],
            [
              {
                text: "⚙️ Change slippage",
                callback_data: `change_slippage_${tokenAddress}`,
              },
            ],
          ],
        },
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while refreshing the token.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function buyTokenCallback(
  user: User,
  bot: TelegramBot,
  chatId: number,
  amount: number,
  tokenAddress: string,
  slippage: number
) {
  try {
    const wallets = user.wallets;

    if (wallets.length === 0) {
      bot.sendMessage(chatId, "You have no wallets added.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
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

    const text = `Select a wallet to use:
    
${balances.join("\n")}`;

    bot
      .sendMessage(chatId, text, {
        reply_markup: {
          inline_keyboard: wallets.map((wallet, index) => [
            {
              text: wallet.address,
              callback_data: `buy_${index}_${amount}_${tokenAddress}_${slippage}`,
            },
          ]),
        },
        parse_mode: "Markdown",
      })
      .then((msg) => {
        setTimeout(() => {
          bot.deleteMessage(chatId, msg.message_id);
        }, 60000);
      });
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while buying the token.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function confirmBuyCallback(
  user: User,
  bot: TelegramBot,
  chatId: number,
  walletIndex: number,
  amount: number,
  tokenAddress: string,
  slippage: number
) {
  try {
    const wallet = user.wallets[walletIndex];

    if (!wallet) {
      bot.sendMessage(chatId, "Invalid wallet.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const balance = await SniperUtils.getBalance(wallet.address);

    const balanceTRX = new BigNumber(balance)
      .div(new BigNumber(10).pow(WTRX_DECIMALS))
      .toNumber();

    if (balanceTRX < amount) {
      bot.sendMessage(chatId, "Insufficient balance.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    } else if (balanceTRX < amount + 75) {
      bot.sendMessage(
        chatId,
        "Insufficient balance to pay for fees. (Balance < Amount + ~75 TRX)",
        {
          reply_markup: {
            inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
          },
        }
      );
      return;
    }

    const pairAddress = await SniperUtils.getPairAddress(tokenAddress);

    if (!pairAddress) {
      bot.sendMessage(chatId, "No pair found for this token.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const txID = await SniperUtils.buyToken(
      tokenAddress,
      pairAddress,
      amount,
      slippage,
      wallet.address,
      wallet.privateKey
    );

    if (!txID) {
      bot.sendMessage(chatId, "No TXID found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    bot.sendMessage(
      chatId,
      `Transaction sent: [View on Tronscan](https://tronscan.org/#/transaction/${txID})`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      }
    );
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while confirming the buy.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function snipeTokenCallback(
  user: User,
  bot: TelegramBot,
  chatId: number,
  tokenAddress: string
) {
  try {
    const wallets = user.wallets;

    if (wallets.length === 0) {
      bot.sendMessage(chatId, "You have no wallets added.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
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

    const text = `Select a wallet to use:

${balances.join("\n")}`;

    bot
      .sendMessage(chatId, text, {
        reply_markup: {
          inline_keyboard: wallets.map((wallet, index) => [
            {
              text: wallet.address,
              callback_data: `snipenow_${index}_${tokenAddress}`,
            },
          ]),
        },
        parse_mode: "Markdown",
      })
      .then((msg) => {
        setTimeout(() => {
          bot.deleteMessage(chatId, msg.message_id);
        }, 60000);
      });
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while sniping the token.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function snipeNowCallback(
  usersCollection: any,
  user: User,
  bot: TelegramBot,
  chatId: number,
  walletIndex: number,
  tokenAddress: string
) {
  try {
    const wallet = user.wallets[walletIndex];

    if (!wallet) {
      bot.sendMessage(chatId, "Invalid wallet.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const text = `Enter the slippage percentage you want to use.`;

    bot
      .sendMessage(chatId, text, {
        reply_markup: {
          force_reply: true,
        },
      })
      .then((msg) => {
        bot.onReplyToMessage(chatId, msg.message_id, async (reply) => {
          const slippageText = reply.text;

          if (!slippageText) {
            bot.sendMessage(chatId, "Invalid slippage.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
            return;
          }

          const slippage = parseInt(slippageText);

          if (isNaN(slippage)) {
            bot.sendMessage(chatId, "Invalid slippage.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
            return;
          }

          if (slippage < 0 || slippage > 100) {
            bot.sendMessage(chatId, "Slippage must be between 0 and 100.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
            return;
          }

          const text = `Enter the amount of TRX you want to spend on this token.`;

          bot
            .sendMessage(chatId, text, {
              reply_markup: {
                force_reply: true,
              },
            })
            .then((msg) => {
              bot.onReplyToMessage(chatId, msg.message_id, async (reply) => {
                const amount = reply.text;

                if (!amount) {
                  bot.sendMessage(chatId, "Invalid amount.", {
                    reply_markup: {
                      inline_keyboard: [
                        [{ text: "❌ Close", callback_data: "close" }],
                      ],
                    },
                  });
                  return;
                }

                const parsedNumber = parseInt(amount);

                if (isNaN(parsedNumber)) {
                  bot.sendMessage(chatId, "Invalid amount.", {
                    reply_markup: {
                      inline_keyboard: [
                        [{ text: "❌ Close", callback_data: "close" }],
                      ],
                    },
                  });
                  return;
                }

                if (parsedNumber <= 0) {
                  bot.sendMessage(chatId, "Amount must be greater than 0.", {
                    reply_markup: {
                      inline_keyboard: [
                        [{ text: "❌ Close", callback_data: "close" }],
                      ],
                    },
                  });
                  return;
                }

                const balance = await SniperUtils.getBalance(wallet.address);

                const balanceTRX = new BigNumber(balance)
                  .div(new BigNumber(10).pow(WTRX_DECIMALS))
                  .toNumber();

                if (balanceTRX < parsedNumber) {
                  bot.sendMessage(chatId, "Insufficient balance.", {
                    reply_markup: {
                      inline_keyboard: [
                        [{ text: "❌ Close", callback_data: "close" }],
                      ],
                    },
                  });
                  return;
                } else if (balanceTRX < parsedNumber + 75) {
                  bot.sendMessage(
                    chatId,
                    "Insufficient balance to pay for fees. (Balance < Amount + ~75 TRX)",
                    {
                      reply_markup: {
                        inline_keyboard: [
                          [{ text: "❌ Close", callback_data: "close" }],
                        ],
                      },
                    }
                  );
                  return;
                }

                const dataToInsert = {
                  address: tokenAddress,
                  amountToInvestInTRX: parsedNumber,
                  privateKey: wallet.privateKey,
                  slippage: slippage,
                } as Snipe;

                await usersCollection.updateOne(
                  { id: chatId },
                  {
                    $push: {
                      snipes: dataToInsert,
                    },
                  }
                );

                bot.sendMessage(
                  chatId,
                  `Snipe added successfully. You will snipe ${parsedNumber} TRX on this token with ${slippage}% slippage.`,
                  {
                    parse_mode: "Markdown",
                    reply_markup: {
                      inline_keyboard: [
                        [
                          {
                            text: "❌ Cancel Snipe",
                            callback_data: `cancel_snipe_${tokenAddress}`,
                          },
                        ],
                        [{ text: "❌ Close", callback_data: "close" }],
                      ],
                    },
                  }
                );
              });
            });
        });
      });
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while sniping the token.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function cancelSnipeCallback(
  usersCollection: any,
  bot: TelegramBot,
  chatId: number,
  tokenAddress: string
) {
  try {
    const dataToDelete = {
      address: tokenAddress,
    } as Snipe;

    await usersCollection.updateOne(
      { id: chatId },
      {
        $pull: {
          snipes: dataToDelete,
        },
      }
    );

    bot.sendMessage(chatId, "Snipe canceled successfully.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while canceling the snipe.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function mySnipesCallback(
  user: User,
  bot: TelegramBot,
  chatId: number
) {
  try {
    const snipes = user.snipes;

    if (snipes.length === 0) {
      bot.sendMessage(chatId, "You have no pending snipes.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    for (const snipe of snipes) {
      const tokenContract = await SniperUtils.getContractInstance(
        TRC20_ABI,
        snipe.address
      );

      if (!tokenContract) continue;

      const name = await tokenContract.name().call();
      const symbol = await tokenContract.symbol().call();

      bot.sendMessage(
        chatId,
        `🎯 *${name}* (${symbol}) | 💰 ${snipe.amountToInvestInTRX} TRX | ⚖️ ${snipe.slippage}%`,
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "❌ Cancel",
                  callback_data: `cancel_snipe_${snipe.address}`,
                },
              ],
            ],
          },
          parse_mode: "Markdown",
        }
      );
    }
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while fetching your snipes.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

/* ------------------------------ */
/*            SELL PART           */
/* ------------------------------ */

export async function myPositionsCallback(
  user: User,
  bot: TelegramBot,
  chatId: number
) {
  try {
    const wallets = user.wallets;

    if (wallets.length === 0) {
      bot.sendMessage(chatId, "You have no wallets added.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    let positionsFound = false;
    for (const walletIndex in wallets) {
      const wallet = wallets[walletIndex];
      const positions = (await SniperUtils.getTokensBalance(
        wallet.address
      )) as Token[];

      if (positions.length === 0) continue;

      for (const position of positions) {
        const positionContract = await SniperUtils.getContractInstance(
          TRC20_ABI,
          position.address
        );

        if (!positionContract) continue;

        const decimals = await positionContract.decimals().call();

        if (!decimals) continue;

        const balance = new BigNumber(position.balance)
          .div(new BigNumber(10).pow(decimals))
          .toNumber()
          .toFixed(3);

        if (Number(balance) === 0) continue;

        const pairAddress = await SniperUtils.getPairAddress(position.address);

        if (!pairAddress) {
          bot.sendMessage(
            chatId,
            `Pair not found for ${position.name} (${position.symbol}).`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            }
          );
          continue;
        }

        const tokenInformations = await SniperUtils.getTokenInformations(
          pairAddress
        );

        if (!tokenInformations) {
          bot.sendMessage(
            chatId,
            `Unable to retrieve information for ${position.name} (${position.symbol}).`,
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            }
          );
          continue;
        }

        const slippagePercentage = 10;

        bot.sendMessage(
          chatId,
          `💎 *${tokenInformations.name}* (${
            tokenInformations.symbol
          }) | ⏰ ${formatElapsedTime(
            new Date(tokenInformations.pairCreatedAt)
          )}

💰 *Market Cap*: $${formatNumber(tokenInformations.marketCapInUSD)}
💧 *Liquidity*: $${formatNumber(tokenInformations.liquidityInUSD)}
📊 *24h Volume*: $${formatNumber(tokenInformations.volumeInUSD)}

💵 *Price*: $${tokenInformations.tokenPriceInUSD.toLocaleString()}
🎒 *Your Balance*: ${balance} ${position.symbol}

⚖️ *Slippage*: ${slippagePercentage}%`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "🔻 Sell 100%",
                    callback_data: `sell_100_${walletIndex}_${position.address}_${slippagePercentage}`,
                  },
                  {
                    text: "🔻 Sell 50%",
                    callback_data: `sell_50_${walletIndex}_${position.address}_${slippagePercentage}`,
                  },
                ],
                [
                  {
                    text: "🔻 Sell Custom %",
                    callback_data: `sellcustom_${walletIndex}_${position.address}_${slippagePercentage}`,
                  },
                ],
                [
                  {
                    text: "🔄 Refresh",
                    callback_data: `refreshsell_${walletIndex}_${position.address}_${slippagePercentage}`,
                  },
                ],
                [
                  {
                    text: "⚙️ Change slippage",
                    callback_data: `change_slippagesell_${walletIndex}_${position.address}`,
                  },
                ],
              ],
            },
            parse_mode: "Markdown",
          }
        );

        positionsFound = true;
      }
    }

    if (!positionsFound) {
      bot.sendMessage(chatId, "No positions found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
    }
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(
      chatId,
      "An error occurred while fetching your positions.",
      {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      }
    );
  }
}

export async function refreshSellCallback(
  user: User,
  bot: TelegramBot,
  chatId: number,
  walletIndex: number,
  tokenAddress: string,
  slippage: number,
  message: TelegramBot.Message
) {
  try {
    const wallets = user.wallets;
    const wallet = wallets[walletIndex];

    const positions = (await SniperUtils.getTokensBalance(
      wallet.address
    )) as Token[];

    if (positions.length === 0) {
      bot.sendMessage(chatId, "No positions found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const position = positions.find(
      (position) => position.address === tokenAddress
    );

    if (!position) {
      bot.sendMessage(chatId, "Position not found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const positionContract = await SniperUtils.getContractInstance(
      TRC20_ABI,
      position.address
    );

    if (!positionContract) {
      bot.sendMessage(chatId, "No contract found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const decimals = await positionContract.decimals().call();

    if (!decimals) {
      bot.sendMessage(chatId, "No decimals found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const balance = new BigNumber(position.balance)
      .div(new BigNumber(10).pow(decimals))
      .toNumber()
      .toFixed(3);

    const pairAddress = await SniperUtils.getPairAddress(position.address);

    if (!pairAddress) {
      bot.sendMessage(chatId, "No pair found for this token.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const tokenInformations = await SniperUtils.getTokenInformations(
      pairAddress
    );

    if (!tokenInformations) {
      bot.sendMessage(chatId, "No token informations found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    bot.editMessageText(
      `💎 *${tokenInformations.name}* (${
        tokenInformations.symbol
      }) | ⏰ ${formatElapsedTime(new Date(tokenInformations.pairCreatedAt))}

💰 *Market Cap*: $${formatNumber(tokenInformations.marketCapInUSD)}
💧 *Liquidity*: $${formatNumber(tokenInformations.liquidityInUSD)}
📊 *24h Volume*: $${formatNumber(tokenInformations.volumeInUSD)}

💵 *Price*: $${tokenInformations.tokenPriceInUSD.toLocaleString()}
🎒 *Your Balance*: ${balance} ${position.symbol}

⚖️ *Slippage*: ${slippage}%`,
      {
        chat_id: chatId,
        message_id: message.message_id,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔻 Sell 100%",
                callback_data: `sell_100_${walletIndex}_${tokenAddress}_${slippage}`,
              },
              {
                text: "🔻 Sell 50%",
                callback_data: `sell_50_${walletIndex}_${tokenAddress}_${slippage}`,
              },
            ],
            [
              {
                text: "🔻 Sell Custom %",
                callback_data: `sellcustom_${walletIndex}_${tokenAddress}_${slippage}`,
              },
            ],
            [
              {
                text: "🔄 Refresh",
                callback_data: `refreshsell_${walletIndex}_${tokenAddress}_${slippage}`,
              },
            ],
            [
              {
                text: "⚙️ Change slippage",
                callback_data: `change_slippagesell_${walletIndex}_${tokenAddress}`,
              },
            ],
          ],
        },
        parse_mode: "Markdown",
      }
    );
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while refreshing the token.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function changeSlippageSellCallback(
  user: User,
  bot: TelegramBot,
  chatId: number,
  walletIndex: number,
  tokenAddress: string,
  message: TelegramBot.Message
) {
  try {
    const wallets = user.wallets;
    const wallet = wallets[walletIndex];

    const positions = (await SniperUtils.getTokensBalance(
      wallet.address
    )) as Token[];

    if (positions.length === 0) {
      bot.sendMessage(chatId, "No positions found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const position = positions.find(
      (position) => position.address === tokenAddress
    );

    if (!position) {
      bot.sendMessage(chatId, "Position not found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const positionContract = await SniperUtils.getContractInstance(
      TRC20_ABI,
      position.address
    );

    if (!positionContract) {
      bot.sendMessage(chatId, "No contract found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const decimals = await positionContract.decimals().call();

    if (!decimals) {
      bot.sendMessage(chatId, "No decimals found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const balance = new BigNumber(position.balance)
      .div(new BigNumber(10).pow(decimals))
      .toNumber()
      .toFixed(3);

    const pairAddress = await SniperUtils.getPairAddress(position.address);

    if (!pairAddress) {
      bot.sendMessage(chatId, "No pair found for this token.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const tokenInformations = await SniperUtils.getTokenInformations(
      pairAddress
    );

    if (!tokenInformations) {
      bot.sendMessage(chatId, "No token informations found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const text = `Enter the slippage percentage you want to use.`;

    bot
      .sendMessage(chatId, text, {
        reply_markup: {
          force_reply: true,
        },
      })
      .then((msg) => {
        bot.onReplyToMessage(chatId, msg.message_id, async (reply) => {
          const slippageText = reply.text;

          if (!slippageText) {
            bot.sendMessage(chatId, "Invalid slippage.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
            return;
          }

          const slippage = parseInt(slippageText);

          if (isNaN(slippage)) {
            bot.sendMessage(chatId, "Invalid slippage.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
            return;
          }

          if (slippage < 0 || slippage > 100) {
            bot.sendMessage(chatId, "Slippage must be between 0 and 100.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
            return;
          }

          bot.editMessageText(
            `💎 *${tokenInformations.name}* (${
              tokenInformations.symbol
            }) | ⏰ ${formatElapsedTime(
              new Date(tokenInformations.pairCreatedAt)
            )}

💰 *Market Cap*: $${formatNumber(tokenInformations.marketCapInUSD)}
💧 *Liquidity*: $${formatNumber(tokenInformations.liquidityInUSD)}
📊 *24h Volume*: $${formatNumber(tokenInformations.volumeInUSD)}

💵 *Price*: $${tokenInformations.tokenPriceInUSD.toLocaleString()}
🎒 *Your Balance*: ${balance} ${position.symbol}

⚖️ *Slippage*: ${slippage}%`,
            {
              chat_id: chatId,
              message_id: message.message_id,
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "🔻 Sell 100%",
                      callback_data: `sell_100_${walletIndex}_${tokenAddress}_${slippage}`,
                    },
                    {
                      text: "🔻 Sell 50%",
                      callback_data: `sell_50_${walletIndex}_${tokenAddress}_${slippage}`,
                    },
                  ],
                  [
                    {
                      text: "🔻 Sell Custom %",
                      callback_data: `sellcustom_${walletIndex}_${tokenAddress}_${slippage}`,
                    },
                  ],
                  [
                    {
                      text: "🔄 Refresh",
                      callback_data: `refreshsell_${walletIndex}_${tokenAddress}_${slippage}`,
                    },
                  ],
                  [
                    {
                      text: "⚙️ Change slippage",
                      callback_data: `change_slippagesell_${walletIndex}_${tokenAddress}`,
                    },
                  ],
                ],
              },
              parse_mode: "Markdown",
            }
          );

          bot.sendMessage(
            chatId,
            "Slippage changed successfully to " + slippage + "%",
            {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            }
          );
        });
      });
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while changing the slippage.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function sellTokenCallback(
  user: User,
  bot: TelegramBot,
  chatId: number,
  walletIndex: number,
  percentageToSell: number,
  tokenAddress: string,
  slippage: number
) {
  try {
    const wallet = user.wallets[walletIndex];

    if (!wallet) {
      bot.sendMessage(chatId, "Invalid wallet.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const positions = (await SniperUtils.getTokensBalance(
      wallet.address
    )) as Token[];

    if (positions.length === 0) {
      bot.sendMessage(chatId, "No positions found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const position = positions.find(
      (position) => position.address === tokenAddress
    );

    if (!position) {
      bot.sendMessage(chatId, "Position not found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const positionContract = await SniperUtils.getContractInstance(
      TRC20_ABI,
      position.address
    );

    if (!positionContract) {
      bot.sendMessage(chatId, "No contract found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const decimals = await positionContract.decimals().call();

    if (!decimals) {
      bot.sendMessage(chatId, "No decimals found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const balance = new BigNumber(position.balance)
      .div(new BigNumber(10).pow(decimals))
      .toNumber();

    const amount = (balance * percentageToSell) / 100;

    if (balance < amount) {
      bot.sendMessage(chatId, "Insufficient balance.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const balanceTRX = await SniperUtils.getBalance(wallet.address);
    const balanceTRXNumber = new BigNumber(balanceTRX)
      .div(new BigNumber(10).pow(WTRX_DECIMALS))
      .toNumber();

    if (balanceTRXNumber < 75) {
      bot.sendMessage(
        chatId,
        "Insufficient balance to pay for fees. (Balance < ~75 TRX)",
        {
          reply_markup: {
            inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
          },
        }
      );
      return;
    }

    const pairAddress = await SniperUtils.getPairAddress(tokenAddress);

    if (!pairAddress) {
      bot.sendMessage(chatId, "No pair found for this token.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const sellingMessage = await bot.sendMessage(chatId, `Selling...`);

    const txID = await SniperUtils.sellToken(
      tokenAddress,
      pairAddress,
      amount,
      slippage,
      wallet.address,
      wallet.privateKey
    );

    if (!txID) {
      bot.sendMessage(chatId, "No TXID found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    bot.sendMessage(
      chatId,
      `Transaction sent: [View on Tronscan](https://tronscan.org/#/transaction/${txID})`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      }
    );
    bot.deleteMessage(chatId, sellingMessage.message_id);
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while selling the token.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}

export async function sellCustomTokenCallback(
  user: User,
  bot: TelegramBot,
  chatId: number,
  walletIndex: number,
  tokenAddress: string,
  slippage: number
) {
  try {
    const wallet = user.wallets[walletIndex];

    if (!wallet) {
      bot.sendMessage(chatId, "Invalid wallet.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const positions = (await SniperUtils.getTokensBalance(
      wallet.address
    )) as Token[];

    if (positions.length === 0) {
      bot.sendMessage(chatId, "No positions found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const position = positions.find(
      (position) => position.address === tokenAddress
    );

    if (!position) {
      bot.sendMessage(chatId, "Position not found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const positionContract = await SniperUtils.getContractInstance(
      TRC20_ABI,
      position.address
    );

    if (!positionContract) {
      bot.sendMessage(chatId, "No contract found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const decimals = await positionContract.decimals().call();

    if (!decimals) {
      bot.sendMessage(chatId, "No decimals found.", {
        reply_markup: {
          inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
        },
      });
      return;
    }

    const balance = new BigNumber(position.balance)
      .div(new BigNumber(10).pow(decimals))
      .toNumber();

    const text = `Enter the percentage of ${position.symbol} you want to sell.`;

    bot
      .sendMessage(chatId, text, {
        reply_markup: {
          force_reply: true,
        },
      })
      .then((msg) => {
        bot.onReplyToMessage(chatId, msg.message_id, (reply) => {
          const amount = reply.text;

          if (!amount) {
            bot.sendMessage(chatId, "Invalid amount.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
            return;
          }

          const percentageNumber = parseFloat(amount);

          if (isNaN(percentageNumber)) {
            bot.sendMessage(chatId, "Invalid amount.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
            return;
          }

          if (percentageNumber < 0 || percentageNumber > 100) {
            bot.sendMessage(
              chatId,
              "The percentage must be between 0 and 100.",
              {
                reply_markup: {
                  inline_keyboard: [
                    [{ text: "❌ Close", callback_data: "close" }],
                  ],
                },
              }
            );
            return;
          }

          const parsedNumber = balance * (percentageNumber / 100);

          if (balance < parsedNumber) {
            bot.sendMessage(chatId, "Insufficient balance.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
            return;
          }

          const pairAddress = SniperUtils.getPairAddress(tokenAddress);

          if (!pairAddress) {
            bot.sendMessage(chatId, "No pair found for this token.", {
              reply_markup: {
                inline_keyboard: [
                  [{ text: "❌ Close", callback_data: "close" }],
                ],
              },
            });
            return;
          }

          bot.sendMessage(
            chatId,
            `You will sell ${parsedNumber} ${position.symbol}. Confirm?`,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: "✅ Confirm",
                      callback_data: `sell_${percentageNumber}_${walletIndex}_${tokenAddress}_${slippage}`,
                    },
                    {
                      text: "❌ Cancel",
                      callback_data: `close`,
                    },
                  ],
                ],
              },
            }
          );
        });
      });
  } catch (error) {
    console.error(`${errorLOG} ${error}`);
    bot.sendMessage(chatId, "An error occurred while selling the token.", {
      reply_markup: {
        inline_keyboard: [[{ text: "❌ Close", callback_data: "close" }]],
      },
    });
  }
}
