import { Entity, Renderer } from "@piggo-legends/core";
import { Position, SwitchButton } from "@piggo-legends/contrib";
import { Text } from "pixi.js";

export const DebugButton = (renderer: Renderer, id: string = "debugButton"): Entity => ({
  id: id,
  components: {
    position: new Position({}),
    renderable: new SwitchButton({
      renderer: renderer,
      dims: { w: 32, textX: 8, textY: 5 },
      cameraPos: { x: 5, y: 5 },
      zIndex: 1,
      text: (new Text("🐞", { fill: "#FFFFFF", fontSize: 16 })),
      onPress: () => {
        renderer.debug = true;
        renderer.events.emit("debug");
      },
      onDepress: () => {
        renderer.debug = false;
        renderer.events.emit("debug");
      }
    })
  }
});
