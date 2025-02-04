import { World } from "@piggo-gg/core"
import { NetState } from "@piggo-gg/web"
import { MetaMaskInpageProvider } from '@metamask/providers'

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider
  }
}

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
    provider = window.ethereum
    world?.client?.connected ? setNetState("connected") : setNetState("disconnected")
  }, 200)

  let provider = window.ethereum

  const onClick = async () => {
    if (!provider) return

    // get first account in metamask
    const accounts = await provider.request<string[]>({ method: "eth_requestAccounts" })
    if (!accounts || accounts.length === 0 || !accounts[0]) {
      alert("failed to find metamask wallet")
      return
    }

    // sign message
    const address = accounts[0]
    const message = `Login to Piggo\n\nWallet: ${address}\n\nTimestamp: ${Date.now()}`
    const signature = await provider.request<string>({
      method: "personal_sign",
      params: [message, address]
    })

    if (!signature) {
      alert("failed to sign message")
      return
    }

    // login
    world?.client?.authLogin(address, message, signature)
  }

  return (
    <div style={{ "paddingTop": 0 }}>
      <div style={{ width: "100%" }}>
        <div style={{ float: "left", marginLeft: 0, paddingLeft: 0, marginTop: 1 }}>
          {/* <Button disabled={!Boolean(provider)} onClick={onClick} size="sm" colorScheme="blue">Login</Button> */}
          <button
            disabled={!Boolean(provider)}
            style={{ fontSize: 14, marginLeft: 0, marginRight: 5 }}
            onClick={onClick}>
            Login
          </button>
          <span style={{ color: colors[netState], fontSize: 14, fontFamily: "sans-serif", paddingTop: 2 }}>{netState}</span>
        </div>
      </div>
    </div>
  )
}
