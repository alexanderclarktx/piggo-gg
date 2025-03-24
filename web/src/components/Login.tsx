import { World } from "@piggo-gg/core"
import { LoginState } from "@piggo-gg/web"
import { useEffect } from "react"

const initGoogleSignIn = (clientId: string, onSuccess: (token: string) => void) => {
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response: { credential: string }) => {
      onSuccess(response.credential)
    }
  })

  window.google.accounts.id.renderButton(document.getElementById("google-signin")!, {
    theme: "filled_black", text: "signin_with", size: "medium", type: "standard", shape: "pill"
  })
}

const loginStateColors: Record<LoginState, string> = {
  "not logged in": "red",
  "🟢 Logged In": "lightgreen",
  "": "black"
}

export type LoginProps = {
  world: World | undefined
  setLoginState: (state: LoginState) => void
  loginState: LoginState
}

export const Login = ({ world, setLoginState, loginState }: LoginProps) => {

  useEffect(() => {
    initGoogleSignIn("1064669120093-9727dqiidriqmrn0tlpr5j37oefqdam3.apps.googleusercontent.com", (jwt) => {
      world?.client!.authLogin(jwt)
    })
  }, [loginState])

  setInterval(() => {
    if (!world?.client) return

    if (loginState !== "🟢 Logged In" && world.client.token) {
      setLoginState("🟢 Logged In")
    } else if (loginState !== "not logged in" && !world.client.token) {
      setLoginState("not logged in")
    }
  }, 200)

  return (
    <div style={{ "paddingTop": 0 }}>
      {loginState === "not logged in" && <div id="google-signin"></div>}
      <div style={{ width: "100%" }}>
        <div style={{ float: "left", marginLeft: 0, paddingLeft: 0, marginTop: 1 }}>
          <span style={{ color: loginStateColors[loginState], fontSize: 15, fontFamily: "sans-serif", paddingTop: 2 }}>
            {loginState === "🟢 Logged In" && loginState}
          </span>
        </div>
      </div>
    </div>
  )
}
