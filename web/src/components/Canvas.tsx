import { DefaultWorld, isMobile, D3Renderer, World, DDE } from "@piggo-gg/core"
import { useEffect } from "react"

export type CanvasProps = {
  setWorld: (_: World) => void
}

export const Canvas = ({ setWorld }: CanvasProps) => {

  useEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement
    canvas.ontouchend = (e) => e.preventDefault()

    const mobile = isMobile()
    if (mobile) canvas.style.border = "none"

    const three = D3Renderer(canvas)
    setWorld(DefaultWorld({ games: [ DDE ], three }))
  }, [])

  return (
    <div style={{ position: "relative" }}>
      <canvas id="canvas" />
    </div>
  )
}
