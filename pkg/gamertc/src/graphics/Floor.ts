import { Sprite, Texture } from "pixi.js";
import { Renderable } from "./Renderable";
import { Renderer } from "./Renderer";

export type FloorProps = {
  width: number,
  height: number,
  texture: Texture
}

export class Floor extends Renderable {
  constructor(renderer: Renderer, {width, height, texture}: FloorProps) {
    super(renderer);

    for (let row = 0; row < width; row++) {
      for (let col = 0; col < height; col++) {
        // position
        const a = texture.width / texture.height;
        const x = (col - row) * texture.width / 2;
        const y = (col + row) * texture.height / (2 + (2 - a));
  
        // sprite
        const tile = new Sprite(texture);
        tile.position.set(x, y);
        tile.anchor.set(0.5);
        tile.alpha = 0.5;
  
        // add the tile to the container
        this.addChild(tile);
      }
    }
  }
}
