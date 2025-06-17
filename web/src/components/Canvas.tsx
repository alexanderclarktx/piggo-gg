import { DefaultWorld, isMobile, Renderer, Three, World } from "@piggo-gg/core"
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

    const three = Three(canvas)
    const renderer = Renderer(canvas)

    renderer.init().then(() => {
      setWorld(DefaultWorld({ renderer, games, three }))
    })
  }, [])

  return (
    <div>
      <canvas id="canvas" />
    </div>
  )
}
