import { Camera, Renderable } from "@piggo-gg/core";
import { Application } from "pixi.js";
import 'pixi.js/unsafe-eval';

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

  window.onresize = () => {
    console.log("RESIZE");
    app.renderer.resize(window.innerWidth, window.innerHeight);
  };

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
        backgroundColor: 0x000000,
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

      // prevent right-click
      canvas.addEventListener("contextmenu", (event) => event.preventDefault());

      // handle zoom
      canvas.addEventListener("wheel", (event) => {
        renderer.camera?.rescaleDelta(-event.deltaY / 1000);
      });
    },
    handleResize: () => {
      console.log("resize");
      if (process.versions.hasOwnProperty('electron') || (document.fullscreenElement && renderer.app.renderer)) {
        renderer.app.renderer.resize(window.innerWidth, window.innerHeight);
      } else {
        const computedCanvasStyle = window.getComputedStyle(renderer.props.canvas);
        const width = Math.min(parseInt(computedCanvasStyle.width), renderer.props.width ?? 800);
        const height = Math.min(parseInt(computedCanvasStyle.height), renderer.props.height ?? 600);
        renderer.app.renderer.resize(width, height);
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
