import { World } from "@piggo-gg/core"
import { LoginState } from "@piggo-gg/web"
import { useEffect, useState } from "react"

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

  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");

  const handleUsernameSubmit = () => {
    if (usernameInput.trim()) {
      // Assuming world.client has a method to set username
      // Replace with your actual API call (e.g., world.client.setUsername(usernameInput))
      console.log("Setting username:", usernameInput); // Placeholder
      setIsUsernameModalOpen(false); // Close modal
      setUsernameInput(""); // Reset input
      world?.client?.profileCreate(usernameInput, (response) => {
        if ("error" in response) {
          alert("username taken");
        } else {
          setIsUsernameModalOpen(false);
          console.log("username set successfully");
        }
      });
    } else {
      alert("please enter a valid username");
    }
  };

  useEffect(() => {
    initGoogleSignIn("1064669120093-9727dqiidriqmrn0tlpr5j37oefqdam3.apps.googleusercontent.com", (jwt) => {
      world?.client?.authLogin(jwt, (response) => {
        if (!("error" in response)) {
          if (response.newUser) {
            setIsUsernameModalOpen(true)
          }
        }
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
        isUsernameModalOpen && <div
          style={{
            fontFamily: "Courier New",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000, // Ensure it’s on top
          }}
        >
          <div
            style={{
              border: "1px solid white",
              // backgroundColor: "white",
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
              placeholder="Enter username"
              style={{ width: "80%", padding: 8, marginBottom: 10 }}
            />
            <button
              onClick={handleUsernameSubmit}
              style={{ padding: "16px 16px", backgroundColor: "#00aaff", color: "white", border: "none", borderRadius: 4 }}
            >
              Submit
            </button>
          </div>
        </div>
      }
    </div>
  )
}
