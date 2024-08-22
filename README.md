# TRON Sniper

This bot is designed to help you snipe and trade tokens on the TRON blockchain. It's highly configurable and easy to set up.

## Features

- **Automated Token Sniping**: Monitor specific token contracts and automatically execute trades as soon as a liquidity pair is established on SunSwap.
- **Effortless Trading**: Simplify buying and selling tokens on the TRON network with automated trade execution.
- **Telegram Integration**: Control and monitor the bot directly from your Telegram account with an intuitive interface.
- **Secure Data Storage with MongoDB**: Store user data securely using MongoDB, ensuring privacy and reliability.

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

3. Ensure your MongoDB server is running. You can start it with the following command:

   ```bash
   mongod
   ```

4. Open the `.env` file in the root directory of your project and modify it with your specific configuration.

5. Start the bot:

   ```bash
   npm start
   # or
   yarn start
   ```

The bot will now start and connect to Telegram, MongoDB, and the TRON network.

### Available Commands

- `/start`: Initializes the bot and provides a welcome message.
- `/wallets`: Displays all wallets associated with your account.
- `/positions`: Shows your current token positions.
- `/pendingsnipes`: Lists all your pending sniping operations.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Contributions

Contributions are welcome! If you have ideas for improvements or new features, feel free to fork the repository and submit a pull request.
