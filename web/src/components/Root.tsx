import { World, isMobile } from "@piggo-gg/core"
import { Canvas, TitleBar } from "@piggo-gg/web"
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"

export type LoginState = "not logged in" | "🟢 Logged In"

export const Root = () => {

  const [world, setWorld] = useState<World | undefined>()
  const [loginState, setLoginState] = useState<LoginState>("not logged in")

  // expose World to the console
  useEffect(() => {
    (window as any).world = world
  }, [world])

  return (
    <div style={{ userSelect: "none" }}>
      <Toaster position="bottom-center" containerStyle={{ fontFamily: "sans-serif" }} />
      <div>
        <div style={{ width: "fit-content", display: "block", marginLeft: "auto", marginRight: "auto" }}>
          {isMobile() ? null : <TitleBar loginState={loginState} setLoginState={setLoginState} world={world} />}
          <Canvas setWorld={setWorld} />
        </div>
      </div>
    </div>
  )
}
