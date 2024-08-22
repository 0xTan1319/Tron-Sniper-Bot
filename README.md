# TRON Sniper

Welcome to the **TRON Sniper**! This bot is designed to help you snipe and trade tokens on the TRON blockchain using SunSwap. It's highly configurable and easy to set up.

## Features

- **Automated Token Sniping**: Snipe newly listed tokens on SunSwap.
- **Trading**: Easily buy and sell tokens on the TRON network.
- **Telegram Integration**: Interact with the bot directly from your Telegram account.
- **MongoDB**: Store user data securely in a MongoDB database.

## Getting Started

### Prerequisites

Make sure you have the following installed on your machine:

- Node.js (v16 or higher)
- npm or yarn
- [MongoDB](https://www.mongodb.com/docs/manual/administration/install-community/)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/impredmet/tron-sniper.git
   cd tron-sniper
   ```

2. Install the dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Open the `.env` file in the root directory of your project and modify it with your specific configuration.

4. Start the bot:

   ```bash
   npm start
   # or
   yarn start
   ```

The bot will now start and connect to Telegram, MongoDB, and the TRON network.

### Project Structure

- `src/index.ts`: The main entry point of the bot.
- `src/config.ts`: Configuration file for the bot.
- `src/callbacks/`: Contains all the Telegram callback handlers.
- `src/commands/`: Contains the command handlers for the bot.
- `src/server/`: Contains server-related logic such as sniping processes.
- `src/utils/`: Utility functions and classes.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Contributions

Contributions are welcome! If you have ideas for improvements or new features, feel free to fork the repository and submit a pull request.
