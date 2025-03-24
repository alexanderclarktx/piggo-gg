import { World } from "@piggo-gg/core"
import { LoginState } from "@piggo-gg/web"

const initGoogleSignIn = (clientId: string, onSuccess: (token: string) => void) => {
  window.google.accounts.id.initialize({
    client_id: clientId,
    callback: (response: { credential: string }) => {
      onSuccess(response.credential)
    }
  })

  window.google.accounts.id.renderButton(document.getElementById("google-signin")!, {
    theme: "filled_black",
    text: "signin_with",
    size: "medium",
    type: "standard",
    shape: "pill"
  })
}

const loginStateColors: Record<LoginState, string> = {
  "not logged in": "red",
  "🟢 Logged In": "lightgreen"
}

export type LoginProps = {
  world: World | undefined
  setLoginState: (state: LoginState) => void
  loginState: LoginState
}

export const Login = ({ world, setLoginState, loginState }: LoginProps) => {

  initGoogleSignIn("1064669120093-9727dqiidriqmrn0tlpr5j37oefqdam3.apps.googleusercontent.com", (token) => {
    console.log(token)
  })

  // setInterval(() => {
  //   provider = window.ethereum
  //   world?.client?.token ? setLoginState("🟢 Logged In") : setLoginState("not logged in")
  // }, 200)

  // let provider = window.ethereum

  // const onClick = async () => {


  // // login
  // world?.client?.authLogin(address, message, signature)
  // }

  return (
    <div style={{ "paddingTop": 0 }}>
      <div id="google-signin"></div>
      {/* <div style={{ width: "100%" }}>
        <div style={{ float: "left", marginLeft: 0, paddingLeft: 0, marginTop: 1 }}>
          {loginState === "not logged in" &&
            <button
              // disabled={!Boolean(provider)}
              style={{ fontSize: 14, marginLeft: 0, marginRight: 5 }}
              onClick={onClick}
            >
              Login
            </button>
          }
          <span style={{ color: loginStateColors[loginState], fontSize: 15, fontFamily: "sans-serif", paddingTop: 2 }}>
            {loginState}
          </span>
        </div>
      </div> */}
    </div>
  )
}
