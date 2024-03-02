import { Button, Clickable, Entity, Position, ValidAction, World, WsClientSystem } from "@piggo-legends/core";
import { Text } from "pixi.js";

export const ConnectButton = (): Entity => ({
  id: "connectButton",
  components: {
    position: new Position({ x: 75, y: 5, screenFixed: true }),
    clickable: new Clickable({
      width: 80, height: 32, active: true,
      click: ValidAction((_, world: World) => {
        if (world) world.addSystemBuilders([WsClientSystem]);
      })
    }),
    renderable: new Button({
      dims: { w: 72, textX: 8, textY: 5 },
      zIndex: 1,
      text: new Text("connect", { fill: "#FFFFFF", fontSize: 16 }),
    })
  }
})
