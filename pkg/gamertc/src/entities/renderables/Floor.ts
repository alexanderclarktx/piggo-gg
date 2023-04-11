import { Sprite, Texture } from "pixi.js";
import { Renderable, RenderableProps } from "../../core/ecs/Renderable";

export type FloorProps = RenderableProps & {
  width: number,
  height: number,
  texture: Texture,
  scale?: number,
  tint?: number
}

export class Floor extends Renderable<FloorProps> {
  constructor(props: FloorProps & RenderableProps) {
    super(props);
    this.init();
  }

  init = () => {
    // align the tiles
    for (let row = 0; row < this.props.width; row++) {
      for (let col = 0; col < this.props.height; col++) {

        // position
        const a = this.props.texture.width / this.props.texture.height;
        const x = (col - row) * (this.props.scale || 1) * this.props.texture.width / 2;
        const y = (col + row) * (this.props.scale || 1) * this.props.texture.height / (2 + (2 - a));
  
        // sprite
        const tile = new Sprite(this.props.texture);
        tile.position.set(x, y);
        tile.anchor.set(0.5);
        tile.alpha = 0.5;
        tile.scale.set(this.props.scale || 1);
        tile.interactive = true;
        tile.tint = this.props.tint || 0x000000;

        // hover
        tile.on("pointerover", () => {
          tile.tint = 0x00ff00;
        });
        tile.on("pointerout", () => {
          tile.tint = this.props.tint || 0x000000;
        });

        // add the tile to the container
        this.addChild(tile);
      }
    }
  }
}
