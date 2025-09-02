import { World, isMobile } from "@piggo-gg/core"
import { Canvas, Title } from "@piggo-gg/web"
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"
import FPSCounter from "@sethwebster/react-fps-counter"

export type LoginState = "not logged in" | "🟢 Logged In" | ""

export const Root = () => {

  const [world, setWorld] = useState<World | undefined>()
  const [loginState, setLoginState] = useState<LoginState>("")

  const ctx = new AudioContext()

  // expose World to the console
  useEffect(() => {
    (window as any).world = world
  }, [world])

  return (
    <div>
      <Toaster position="bottom-center" containerStyle={{ fontFamily: "sans-serif" }} />
      <div onPointerDown={() => {
        if (!world || world.client?.sound.ready) return

        // play a silent buffer
        const source = ctx.createBufferSource()
        source.buffer = ctx.createBuffer(1, 1, ctx.sampleRate)
        source.connect(ctx.destination)
        source.start(0)
        ctx.resume()

        world.client!.sound.ready = true
      }}>
        <div style={{ width: "fit-content", display: "block", marginLeft: "auto", marginRight: "auto" }}>
          {isMobile() ? null : <Title loginState={loginState} setLoginState={setLoginState} world={world} />}
          <Canvas setWorld={setWorld} />
        </div>
      </div>
      {/* {window.location.hostname === "localhost" && (
        <FPSCounter visible={true} position="bottom-left" targetFrameRate={120} />
      )} */}
    </div>
  )
}
