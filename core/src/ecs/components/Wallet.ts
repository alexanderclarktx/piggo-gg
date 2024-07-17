import { Component } from "@piggo-gg/core";

export type Wallet = Component<"wallet", { dollars: number }> & {
  deposit: (amount: number) => void
  withdraw: (amount: number) => boolean
}

export const Wallet = (dollars: number = 0): Wallet => {
  const wallet: Wallet = {
    type: "wallet",
    data: { dollars },
    deposit: (amount: number) => {
      wallet.data.dollars += amount;
    },
    withdraw: (amount: number) => {
      if (wallet.data.dollars >= amount) {
        wallet.data.dollars -= amount;
        return true;
      }
      return false;
    }
  }
  return wallet;
}
