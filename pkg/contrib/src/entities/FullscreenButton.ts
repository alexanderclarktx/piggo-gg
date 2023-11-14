import { Entity, Renderer } from "@piggo-legends/core";
import { Position, TapButton } from "@piggo-legends/contrib";
import { Text } from "pixi.js";

export const FullscreenButton = (renderer: Renderer, id: string = "fullscreenButton"): Entity => ({
  id: id,
  components: {
    position: new Position(0, 0),
    renderable: new TapButton({
      renderer: renderer,
      dims: { w: 32, textX: 8, textY: 5 },
      cameraPos: { x: 40, y: 5 },
      zIndex: 1,
      text: (new Text("⚁", { fill: "#FFFFFF", fontSize: 16 })),
      onPress: (b: TapButton) => {
        console.log(document.fullscreenElement);
        if (!document.fullscreenElement) {
          //@ts-ignore
          b.props.renderer.app.view.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    })
  }
});
