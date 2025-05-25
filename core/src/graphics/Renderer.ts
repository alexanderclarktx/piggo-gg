import { Camera, Renderable, isMobile } from "@piggo-gg/core"
import { Application } from "pixi.js"
import { initDevtools } from '@pixi/devtools';

// initDevtools({ app });
// initDevtools({ stage, renderer });

export type Renderer = {
  app: Application
  camera: Camera
  guiRenderables: Renderable[]
  resizedFlag: boolean
  addGui: (renderable: Renderable) => void
  addWorld: (renderable: Renderable) => void
  handleResize: () => void
  init: () => Promise<void>
  setBgColor: (color: number) => void
  wh: () => { width: number, height: number }
}

// Renderer draws the game to a canvas
export const Renderer = (canvas: HTMLCanvasElement): Renderer => {

  const app = new Application()
  initDevtools({ app })

  const renderer: Renderer = {
    app,
    camera: Camera(app),
    guiRenderables: [],
    resizedFlag: false,
    addGui: (renderable: Renderable) => {
      if (renderable) {
        renderer.app.stage.addChild(renderable.c)
        renderer.guiRenderables.push(renderable)
      }
    },
    addWorld: (renderable: Renderable) => {
      if (renderable) renderer.camera?.add(renderable)
    },
    handleResize: () => {
      if (isMobile() || (document.fullscreenElement && renderer.app.renderer)) {
        renderer.app.renderer.resize(window.innerWidth, window.outerHeight)
      } else {
        renderer.app.renderer.resize(window.innerWidth * 0.98, window.innerHeight * 0.91)
      }
      renderer.resizedFlag = true
    },
    init: async () => {

      // create the pixi.js application
      await renderer.app.init({
        canvas,
        resolution: 1,
        antialias: true,
        autoDensity: true,
        backgroundColor: 0x000000,
        preference: "webgl",
        preferWebGLVersion: 2
      })

      renderer.handleResize()

      // set up the camera
      renderer.app.stage.addChild(renderer.camera.root)

      // hide the cursor
      renderer.app.renderer.events.cursorStyles.default = "none"

      // handle screen resize
      window.addEventListener("resize", renderer.handleResize)

      // handle fullscreen change
      document.addEventListener("fullscreenchange", renderer.handleResize)

      // handle orientation change
      screen?.orientation?.addEventListener("change", () => renderer.handleResize)

      // prevent right-click
      canvas.addEventListener("contextmenu", (event) => event.preventDefault())
    },
    setBgColor: (color: number) => {
      renderer.app.renderer.background.color = color
    },
    wh: () => ({
      width: renderer.app.screen.width,
      height: renderer.app.screen.height
    })
  }
  return renderer
}
