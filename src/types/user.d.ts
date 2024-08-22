interface User {
  id: number;
  wallets: Wallet[];
  snipes: Snipe[];
}

interface Wallet {
  privateKey: string;
  address: string;
}

interface Snipe {
  address: string;
  amountToInvestInTRX: number;
  privateKey: string;
  slippage: number;
}
