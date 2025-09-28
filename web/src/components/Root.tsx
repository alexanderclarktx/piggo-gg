import { World, isMobile } from "@piggo-gg/core"
import { Canvas, Title } from "@piggo-gg/web"
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"

export type LoginState = "not logged in" | "🟢 Logged In" | ""

export const Root = () => {

  const [world, setWorld] = useState<World | undefined>()
  const [loginState, setLoginState] = useState<LoginState>("")

  // expose World to the console
  useEffect(() => {
    (window as any).world = world
  }, [world])

  return (
    <div>
      <audio id="sound">
        <source src="data:audio/wav;base64,UklGRqxYAQBXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YYhYAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" type="audio/wav" />
      </audio>
      <Toaster position="bottom-center" containerStyle={{ fontFamily: "sans-serif" }} />
      <div onPointerDown={() => {
        if (!world) return

        const audioElement = document.getElementById("sound") as HTMLAudioElement
        audioElement.play().catch(() => { })

        if (world.client) world.client.sound.ready = true
      }}>
        <div style={{ width: "fit-content", display: "block", marginLeft: "auto", marginRight: "auto" }}>
          {/* {isMobile() ? null : <Title loginState={loginState} setLoginState={setLoginState} world={world} />} */}
          <Canvas setWorld={setWorld} />
        </div>
      </div>
    </div>
  )
}
