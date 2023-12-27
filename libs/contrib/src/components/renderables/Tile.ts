import { Renderable, RenderableProps } from "@piggo-legends/contrib";
import { Sprite, Texture, Resource } from "pixi.js";

export type TileProps = RenderableProps & {
  texture: Texture<Resource>,
  tint?: number
}

export class Tile extends Renderable<TileProps> {

  constructor(props: TileProps) {
    super({
      ...props,
      // init: this.makeTile
    });
  }

  makeTile = () => {
    const tile = new Sprite(this.props.texture);
    tile.position.set(0, 0);
    tile.anchor.set(0.5, 0.5);
    tile.scale.set(2);
    tile.eventMode = "static";
    tile.tint = this.props.tint ?? 0xffffff;

    // TODO this should be done by mouse handler
    tile.on("pointerover", () => {
      tile.tint = 0x00ff00;
    });
    tile.on("pointerout", () => {
      tile.tint = this.props.tint || 0x000000;
    });

    return tile;
  }
}
