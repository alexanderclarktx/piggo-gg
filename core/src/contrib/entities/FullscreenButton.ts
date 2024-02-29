import { Button, Clickable, Entity, Position, World } from "@piggo-legends/core";
import { Text } from "pixi.js";

export const FullscreenButton = (id: string = "fullscreenButton"): Entity => ({
  id: id,
  components: {
    position: new Position({
      x: 5, y: 5, screenFixed: true
    }),
    clickable: new Clickable({
      active: true,
      width: 32,
      height: 30,
      click: {
        validate: () => true,
        apply: (_, world: World) => {
          if (!document.fullscreenElement) {
            // @ts-expect-error
            world.renderer?.app.view.requestFullscreen();
          } else {
            document.exitFullscreen();
          }
        }
      }
    }),
    renderable: new Button({
      dims: { w: 32, textX: 8, textY: 5 },
      zIndex: 1,
      text: (new Text("⚁", { fill: "#FFFFFF", fontSize: 16 }))
    })
  }
});
