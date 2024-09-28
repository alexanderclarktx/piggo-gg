import { Camera, Renderable, isMobile } from "@piggo-gg/core";
import { Application } from "pixi.js";

export type RendererProps = {
  canvas: HTMLCanvasElement;
  width?: number;
  height?: number;
}

export type Renderer = {
  props: RendererProps
  app: Application
  camera: Camera
  guiRenderables: Renderable[]
  resizedFlag: boolean
  init: () => Promise<void>
  handleResize: () => void
  addGui: (renderable: Renderable) => void
  addWorld: (renderable: Renderable) => void
}

// Renderer draws the game to a canvas
export const Renderer = (props: RendererProps): Renderer => {

  const app = new Application();

  const renderer: Renderer = {
    props: props,
    app,
    camera: Camera(app),
    guiRenderables: [],
    resizedFlag: false,
    init: async () => {
      const { canvas } = props;

      // create the pixi.js application
      await renderer.app.init({
        canvas,
        resolution: 1,
        antialias: true,
        autoDensity: true,
        backgroundColor: 0x006633,
        width: renderer.props.width ?? 800,
        height: renderer.props.height ?? 600
      });

      // set up the camera
      renderer.app.stage.addChild(renderer.camera.c);

      // hide the cursor
      renderer.app.renderer.events.cursorStyles.default = "none";

      // handle screen resize
      window.addEventListener("resize", renderer.handleResize);

      // handle fullscreen change
      document.addEventListener("fullscreenchange", renderer.handleResize);

      // handle orientation change
      screen?.orientation?.addEventListener("change", () => renderer.handleResize);

      // prevent right-click
      canvas.addEventListener("contextmenu", (event) => event.preventDefault());

      // handle zoom
      canvas.addEventListener("wheel", (event) => {
        renderer.camera?.rescaleDelta(-event.deltaY / 1000);
      });
    },
    handleResize: () => {
      if (isMobile() || (document.fullscreenElement && renderer.app.renderer)) {
        console.log("resizing to fullscreen");
        renderer.app.renderer.resize(window.innerWidth, window.outerHeight);
      } else {
        renderer.app.renderer.resize(window.innerWidth * 0.98, window.innerHeight * 0.90);
      }
      renderer.resizedFlag = true;
    },
    addGui: (renderable: Renderable) => {
      if (renderable) {
        renderer.app.stage.addChild(renderable.c);
        renderer.guiRenderables.push(renderable);
      }
    },
    addWorld: (renderable: Renderable) => {
      if (renderable) renderer.camera?.add(renderable);
    }
  }
  return renderer;
}
