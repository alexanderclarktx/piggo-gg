import { Entity, Renderer } from "@piggo-legends/core";
import { Position, TextBox, Networked, Clickable, Renderable, Actions } from "@piggo-legends/contrib";
import { Text } from "pixi.js";

export const Ball = (renderer: Renderer, id: string = "ball"): Entity => ({
  id: id,
  components: {
    position: new Position(400, 500),
    networked: new Networked({ isNetworked: true }),
    clickable: new Clickable({
      width: 32,
      height: 32,
      active: true,
      onPress: "click"
    }),
    actions: new Actions({
      "click": (entity: Entity) => {
        const t = (entity.components.renderable as TextBox).c as Text;
        t.text = "🙃";
      }
    }),
    renderable: new Renderable({
      renderer: renderer,
      debuggable: true,
      zIndex: 1,
      container: new Text("🏀", { fill: "#FFFFFF", fontSize: 16 }),
    })
  }
});
