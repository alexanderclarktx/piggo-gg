import { Component } from "@piggo-gg/core"

export type Money = Component<"money", { balance: number }> & {
  deposit: (amount: number) => void
  withdraw: (amount: number) => boolean
}

export const Money = (balance: number = 0): Money => {
  const money: Money = {
    type: "money",
    data: { balance },
    deposit: (amount: number) => {
      money.data.balance += amount
    },
    withdraw: (amount: number) => {
      if (money.data.balance >= amount) {
        money.data.balance -= amount
        return true
      }
      return false
    }
  }
  return money
}
