import { DefaultWorld, isMobile, Renderer, World } from "@piggo-gg/core"
import { games } from "@piggo-gg/games"
import { useEffect } from "react"

export type CanvasProps = {
  setWorld: (_: World) => void
}

export const Canvas = ({ setWorld }: CanvasProps) => {

  let playedAudio = false

  useEffect(() => {
    const mobile = isMobile()
    const canvas = document.getElementById("canvas") as HTMLCanvasElement

    const [width, height] = mobile ?
      [window.innerWidth, window.innerHeight] :
      [window.innerWidth * 0.98, window.innerHeight * 0.90]

    if (mobile) canvas.style.border = "none"

    const renderer = Renderer({ canvas, width, height })

    renderer.init().then(() => {
      const world = DefaultWorld({ renderer, games })
      setWorld(world)
      renderer.handleResize()
    })
  }, [])

  return (
    <div>
      <audio>
        <source src="/silent.mp3" type="audio/mp3"></source>
      </audio>
      <canvas id="canvas" onPointerDown={
        () => {
          if (playedAudio) return

          const audioElement = document.querySelector("audio") as HTMLAudioElement
          audioElement.play()

          playedAudio = true
        }
      }>
      </canvas>
    </div>
  )
}
