import { Entity } from "@piggo-legends/core";
import { Position, SwitchButton } from "@piggo-legends/contrib";
import { Text } from "pixi.js";

export const DebugButton = (): Entity => ({
  id: "debugButton",
  components: {
    position: new Position({ x: 5, y: 5, screenFixed: true }),
    renderable: new SwitchButton({
      dims: { w: 32, textX: 6, textY: 5 },
      zIndex: 1,
      text: (new Text("🐞", { fill: "#FFFFFF", fontSize: 16 })),
      onPress: () => {
        // renderer.debug = true;
        // renderer.events.emit("debug");
      },
      onDepress: () => {
        // renderer.debug = false;
        // renderer.events.emit("debug");
      }
    })
  }
});
