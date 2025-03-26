import { World } from "@piggo-gg/core"
import { LoginState } from "@piggo-gg/web"
import { useEffect, useState } from "react"

const initGoogleSignIn = (onSuccess: (token: string) => void) => {
  window.google.accounts.id.initialize({
    client_id: "1064669120093-9727dqiidriqmrn0tlpr5j37oefqdam3.apps.googleusercontent.com",
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

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [usernameInput, setUsernameInput] = useState("")
  const [error, setError] = useState("")

  const handleUsernameSubmit = () => {
    if (usernameInput.trim()) {
      world?.client?.profileCreate(usernameInput, (response) => {
        if ("error" in response) {
          setError(`username taken: ${usernameInput}`)
          setUsernameInput("")
        } else {
          setIsModalOpen(false)
          setUsernameInput("")
        }
      })
    } else {
      alert("please enter a valid username")
    }
  }

  useEffect(() => {
    if (window.google) initGoogleSignIn((jwt) => {
      world?.client?.authLogin(jwt, (response) => {
        if ((!("error" !in response)) && response.newUser) setIsModalOpen(true)
      })
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
              border: "1px solid white",
              backgroundColor: "black",
              padding: 20,
              borderRadius: 8,
              width: "300px",
              textAlign: "center",
            }}
          >
            <h2>Set Your Username</h2>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="noob"
              style={{ width: "80%", padding: 8, marginBottom: 10 }}
            />
            <h3 style={{ color: "red", fontSize: 16 }}>
              {error}
            </h3>
            <button
              onClick={handleUsernameSubmit}
              style={{ padding: "8px 16px", marginTop: "8px", backgroundColor: "#cc00cc", color: "white", border: "none", borderRadius: 4 }}
            >
              Submit
            </button>
          </div>
        </div>
      }
    </div>
  )
}
