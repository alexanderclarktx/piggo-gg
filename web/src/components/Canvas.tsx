import { DefaultWorld, isMobile, D3Renderer, World } from "@piggo-gg/core"
import { games } from "@piggo-gg/games"
import { useEffect } from "react"

export type CanvasProps = {
  setWorld: (_: World) => void
}

export const Canvas = ({ setWorld }: CanvasProps) => {

  useEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement

    const mobile = isMobile()
    if (mobile) canvas.style.border = "none"

    const three = D3Renderer(canvas)
    setWorld(DefaultWorld({ games, three }))
  }, [])

  return (
    <div style={{ position: "relative" }}>
      <canvas id="canvas" />
    </div>
  )
}
