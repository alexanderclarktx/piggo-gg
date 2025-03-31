import { DefaultWorld, isMobile, Renderer, World } from "@piggo-gg/core"
import { games } from "@piggo-gg/games"
import { useEffect } from "react"

export type CanvasProps = {
  setWorld: (_: World) => void
}

export const Canvas = ({ setWorld }: CanvasProps) => {

  let playedAudio = false

  useEffect(() => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement

    const mobile = isMobile()
    if (mobile) canvas.style.border = "none"

    const renderer = Renderer(canvas)

    renderer.init().then(() => {
      setWorld(DefaultWorld({ renderer, games }))
    })
  }, [])

  return (
    <div>
      <audio>
        <source src="/silent.mp3" type="audio/mp3"/>
      </audio>
      <canvas id="canvas" onPointerDown={() => {
        if (playedAudio) return

        const audioElement = document.querySelector("audio") as HTMLAudioElement
        audioElement.play()

        playedAudio = true
      }}/>
    </div>
  )
}
