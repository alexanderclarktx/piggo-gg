import { Renderable, RenderableProps } from "@piggo-legends/contrib";
import { Graphics, MSAA_QUALITY, Matrix, RenderTexture, Resource, Sprite, Renderer, Texture } from "pixi.js";

export type TileProps = RenderableProps & {
  texture: Texture<Resource>,
  tint?: number
}

let sprite: Sprite | null = null;

export class Tile2 extends Renderable<TileProps> {

  constructor(props: TileProps) {
    super({
      ...props
    });
    this.init();
  }

  init = async () => {
    if (!this.renderer) {
      setTimeout(() => {
        this.init();
      }, 100);
      return;
    }


    const tile = new Sprite(this.props.texture);
    tile.position.set(0, 0);
    tile.anchor.set(0.5, 0.5);
    tile.scale.set(2);
    tile.eventMode = "static";
    tile.tint = this.props.tint ?? 0xffffff;

    // const tile = new Graphics()
    //   .beginFill(0xffffff)
    //   .lineStyle({ width: 1, color: 0x333333, alignment: 0 })
    //   .drawCircle(2, 2, 20);

    const { width, height } = tile;

    const renderTexture = RenderTexture.create({
      width,
      height,
      multisample: MSAA_QUALITY.HIGH,
      resolution: window.devicePixelRatio
    });

    if (!this.renderer) {
      console.error("Renderer not found");
      throw new Error("Renderer not found");
    }

    this.renderer.app.renderer.render(tile, {
      renderTexture,
      transform: new Matrix(1, 0, 0, 1, width / 2, height / 2)
    });

    (this.renderer.app.renderer as Renderer).framebuffer.blit();

    sprite = new Sprite(renderTexture);

    // tile.destroy(true);

    // this.renderer.app.stage.addChild(new Sprite(renderTexture));

    this.c.addChild(sprite);

    // TODO this should be done by mouse handler
    // tile.on("pointerover", () => {
    //   tile.tint = 0x00ff00;
    // });
    // tile.on("pointerout", () => {
    //   tile.tint = this.props.tint || 0x000000;
    // });

    // return tile;
  }
}
