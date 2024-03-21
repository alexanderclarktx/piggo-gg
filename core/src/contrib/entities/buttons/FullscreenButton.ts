import { Button, Clickable, Entity, Position, ValidAction, World } from "@piggo-gg/core";
import { Text } from "pixi.js";

export const FullscreenButton = (id: string = "fullscreenButton") => Entity({
  id: id,
  persists: true,
  components: {
    position: new Position({
      x: 5, y: 5, screenFixed: true
    }),
    clickable: new Clickable({
      active: true,
      width: 32,
      height: 30,
      click: ValidAction((_, world: World) => {
        if (!document.fullscreenElement) {
          const canvas = world.renderer?.app.canvas!;
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          // world.renderer?.app.canvas.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      })
    }),
    renderable: Button({
      dims: { w: 32, textX: 8, textY: 5 },
      zIndex: 4,
      text: (new Text({ text: "⚁", style: { fill: "#FFFFFF", fontSize: 16 } }))
    })
  }
});
