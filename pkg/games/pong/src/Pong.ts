import { Entity, Game, Renderer, System, Button, Renderable, Character } from "@piggo-legends/gamertc";
import { Container, Text, Texture, Sprite, AnimatedSprite, Assets } from "pixi.js";

export class Pong extends Game {

  constructor(renderer: Renderer) {
    super({
      renderer: renderer,
      systems: [],
      entities: []
    });
    this.init();
    window["renderer"] = this.renderer;
  }

  init = async () => {
    // add the tiles
    const floorTexture = await Texture.fromURL("stone.png");;
    await this.addFloor(floorTexture, 10, 10);

    // add the character
    const characterAssets = await Assets.load("chars.json");
    this.renderer.addWorld(new Character(this.renderer, {
      animations: {
        d: new AnimatedSprite([
          characterAssets.textures["d1"], characterAssets.textures["d2"], characterAssets.textures["d3"]
        ]),
        u: new AnimatedSprite([
          characterAssets.textures["u1"], characterAssets.textures["u2"], characterAssets.textures["u3"]
        ]),
        l: new AnimatedSprite([
          characterAssets.textures["l1"], characterAssets.textures["l2"], characterAssets.textures["l3"]
        ]),
        r: new AnimatedSprite([
          characterAssets.textures["r1"], characterAssets.textures["r2"], characterAssets.textures["r3"]
        ]),
        dl: new AnimatedSprite([
          characterAssets.textures["dl1"], characterAssets.textures["dl2"], characterAssets.textures["dl3"]
        ]),
        dr: new AnimatedSprite([
          characterAssets.textures["dr1"], characterAssets.textures["dr2"], characterAssets.textures["dr3"]
        ]),
        ul: new AnimatedSprite([
          characterAssets.textures["ul1"], characterAssets.textures["ul2"], characterAssets.textures["ul3"]
        ]),
        ur: new AnimatedSprite([
          characterAssets.textures["ur1"], characterAssets.textures["ur2"], characterAssets.textures["ur3"]
        ])
      },
      enableControls: true,
      track: true
    }));

    // add fps text
    this.addFpsText();

    // add fullscreen button
    this.renderer.addHUD(new Button(this.renderer, {
      dims: {x: 690, y: 5, w: 37, lx: 10, ly: 5},
      text: (new Text("⚁", { fill: "#FFFFFF", fontSize: 16 })),
      onPress: () => {
        //@ts-ignore
        this.renderer.app.view.requestFullscreen();
      },
      onDepress: () => {}
    }));

    // add debug button
    this.renderer.addHUD(new Button(this.renderer, {
      dims: {x: 735, y: 5, w: 60, lx: 10, ly: 7},
      text: (new Text("debug", { fill: "#FFFFFF", fontSize: 14 })),
      onPress: () => {
        this.renderer.debug = true;
        this.renderer.events.emit("debug");
      },
      onDepress: () => {
        this.renderer.debug = false;
        this.renderer.events.emit("debug");
      }
    }));
  }

  addFpsText = () => {
    // create the container
    const fpsContainer = new Renderable(this.renderer, { debuggable: false });
    fpsContainer.position.set(5, 5);

    // dynamic text
    const fpsText = new Text("", { fill: 0x55FF00, fontSize: 16, dropShadow: true, dropShadowColor: 0x000000, dropShadowBlur: 0, dropShadowDistance: 2 });
    this.renderer.app.ticker.add(() => {
      fpsText.text = Math.round(this.renderer.app.ticker.FPS);
    });

    // add text to container
    fpsContainer.addChild(fpsText);

    // add container to the HUD
    this.renderer.addHUD(fpsContainer);
  }

  addFloor = async (texture: Texture, width: number, height: number): Promise<Container> => {
    // Create a container for the tiles
    const tilesContainer = new Renderable(this.renderer);
    tilesContainer.position.set(300, 0);
    this.renderer.addWorld(tilesContainer);

    // Loop through the map data and create tiles
    for (let row = 0; row < width; row++) {
      for (let col = 0; col < height; col++) {
        // tile position
        const a = texture.width / texture.height;
        const x = (col - row) * texture.width / 2;
        const y = (col + row) * texture.height / (2 + (2 - a));

        // tile sprite
        const tile = new Sprite(texture);
        tile.position.set(x, y);
        tile.anchor.set(0.5);

        // add the tile to the container
        tilesContainer.addChild(tile);
      }
    }
    return tilesContainer;
  }
}
