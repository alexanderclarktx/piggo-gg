import { styleButton, World } from "@piggo-gg/core"
import { LoginState } from "@piggo-gg/web"
import { useState } from "react"

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

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [usernameInput, setUsernameInput] = useState("")
  const [error, setError] = useState("")

  let googleSetUp = false

  const handleUsernameSubmit = () => {
    if (usernameInput.trim()) {
      world?.client?.profileCreate(usernameInput, (response) => {
        if ("error" in response) {
          setError(`username taken: ${usernameInput}`)
          setUsernameInput("")
        } else {
          setIsModalOpen(false)
          setUsernameInput("")
          if (world?.client) world.client.busy = false
        }
      })
    } else {
      alert("please enter a valid username")
    }
  }

  const setupGoogle = () => {
    if (!window.google) return

    window.google.accounts.id.initialize({
      client_id: "1064669120093-9727dqiidriqmrn0tlpr5j37oefqdam3.apps.googleusercontent.com",
      callback: (response: { credential: string }) => {
        const jwt = response.credential
        world?.client?.authLogin(jwt, (response) => {
          if ((!("error"! in response)) && response.newUser) {
            setIsModalOpen(true)
            if (world?.client) world.client.busy = true
          }
        })
      }
    })

    window.google.accounts.id.renderButton(document.getElementById("google-signin")!, {
      theme: "filled_black", text: "signin_with", size: "medium", type: "standard", shape: "pill"
    })

    googleSetUp = true
  }

  setInterval(() => {
    if (!googleSetUp) setupGoogle()

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
      {
        isModalOpen && <div
          style={{
            fontFamily: "Courier New",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              border: "2px solid white",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              padding: 20,
              borderRadius: 8,
              width: "300px",
              textAlign: "center"
            }}
          >
            <h2>set username</h2>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              maxLength={15}
              style={{ width: "80%", padding: 8, marginBottom: 10, fontSize: 18, outline: "none", borderRadius: "8px" }}
            />
            <h3 style={{ color: "red", fontSize: 16 }}>
              {error}
            </h3>
            <button
              onClick={handleUsernameSubmit}
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                border: "2px solid #ffffff",
                borderRadius: 8,
                color: "white",
                fontSize: 18,
                fontFamily: "Courier New",
                marginTop: "8px",
                padding: "8px 16px"
              }}
              onPointerEnter={(a) => styleButton(a.currentTarget, true, true)}
              onPointerLeave={(a) => styleButton(a.currentTarget, true, false)}
            >
              <b>submit</b>
            </button>
          </div>
        </div>
      }
    </div>
  )
}
