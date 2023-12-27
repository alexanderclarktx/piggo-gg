import { Entity, Game, Renderer } from "@piggo-legends/core";
import { Actions, Clickable, Position, TapButton } from "@piggo-legends/contrib";
import { Text } from "pixi.js";

export const FullscreenButton = (id: string = "fullscreenButton"): Entity => ({
  id: id,
  components: {
    // TODO camera position component
    position: new Position({
      x: 40, y: 5, screenFixed: true
    }),
    clickable: new Clickable({
      onPress: "click",
      active: true,
      width: 32,
      height: 30,
    }),
    actions: new Actions<"click">({
      "click": (_, game: Game) => {
        console.log("CLICK");
        if (!document.fullscreenElement) {
          // @ts-expect-error
          game.renderer?.app.view.requestFullscreen();
        } else {
          document.exitFullscreen();
        }
      }
    }),
    renderable: new TapButton({
      dims: { w: 32, textX: 8, textY: 5 },
      zIndex: 1,
      text: (new Text("⚁", { fill: "#FFFFFF", fontSize: 16 }))
    })
  }
});
