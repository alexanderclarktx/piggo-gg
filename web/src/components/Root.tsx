import { World, isMobile } from "@piggo-gg/core"
import { Canvas, TitleBar, NetState } from "@piggo-gg/web"
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"

export const Root = () => {

  const [world, setWorld] = useState<World | undefined>()
  const [netState, setNetState] = useState<NetState>("disconnected")

  // expose World to the console
  useEffect(() => {
    (window as any).world = world
  }, [world])

  return (
    <div style={{ userSelect: "none" }}>
      <Toaster position="bottom-center" containerStyle={{ fontFamily: "sans-serif" }} />
      <div>
        <div style={{ width: "fit-content", display: "block", marginLeft: "auto", marginRight: "auto" }}>
          {isMobile() ? null : <TitleBar netState={netState} setNetState={setNetState} world={world} />}
          <Canvas setWorld={setWorld} />
        </div>
      </div>
    </div>
  )
}
