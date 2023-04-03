import { Sprite, Texture } from "pixi.js";
import { Renderable } from "./Renderable";
import { Renderer } from "./Renderer";

export type FloorProps = {
  width: number,
  height: number,
  texture: Texture,
  scale?: number,
  tint?: number
}

export class Floor extends Renderable {
  constructor(renderer: Renderer, {width, height, texture, scale, tint}: FloorProps) {
    super(renderer);

    // align the tiles
    for (let row = 0; row < width; row++) {
      for (let col = 0; col < height; col++) {

        // position
        const a = texture.width / texture.height;
        const x = (col - row) * (scale || 1) * texture.width / 2;
        const y = (col + row) * (scale || 1) * texture.height / (2 + (2 - a));
  
        // sprite
        const tile = new Sprite(texture);
        tile.position.set(x, y);
        tile.anchor.set(0.5);
        tile.alpha = 0.5;
        tile.scale.set(scale || 1);
        tile.interactive = true;
        tile.tint = tint || 0x000000;

        // hover
        tile.on("pointerover", () => {
          tile.tint = 0x00ff00;
        });
        tile.on("pointerout", () => {
          tile.tint = tint || 0x000000;
        });

        // add the tile to the container
        this.addChild(tile);
      }
    }
  }
}
