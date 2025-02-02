import { World } from "@piggo-gg/core"
import { NetState } from "@piggo-gg/web"
import React from "react"

const colors: Record<NetState, string> = {
  "disconnected": "red",
  "offering": "yellow",
  "answering": "orange",
  "connected": "lightgreen"
}

export type LoginProps = {
  world: World | undefined
  setNetState: (state: NetState) => void
  netState: NetState
}

export const Login = ({ world, setNetState, netState }: LoginProps) => {

  setInterval(() => {
    world?.client?.connected ? setNetState("connected") : setNetState("disconnected")
  }, 200)

  const onClick = async () => {
    // if (world && world.client) world.client.joinLobby("hub", () => { })

    // @ts-expect-error
    if (!window.ethereum) {
      alert("MetaMask is not installed!")
      return
    }

    // @ts-expect-error
    const provider = window.ethereum
    const accounts = await provider.request({ method: "eth_requestAccounts" })
    const address = accounts[0]

    const message = `Login to Piggo\n\nWallet: ${address}\n\nTimestamp: ${Date.now()}`
    const signature = await provider.request({
      method: "personal_sign",
      params: [message, address],
    })

    console.log(`address: ${address} signature: ${signature}`)

    // Send to backend for verification
    // const response = await fetch("/api/auth", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ address, message, signature }),
    // })

    // const result = await response.json()
    // console.log("Server response:", result)
  }

  return (
    <div style={{ "paddingTop": 0 }}>
      <div style={{ width: "100%" }}>
        <div style={{ float: "left", marginLeft: 0, paddingLeft: 0, marginTop: 1 }}>
          <button style={{ fontSize: 12, marginLeft: 0 }} onClick={onClick}>Login</button>
          <span style={{ color: colors[netState], fontSize: 14, fontFamily: "sans-serif", paddingTop: 2 }}>{netState}</span>
        </div>
      </div>
    </div>
  )
}
