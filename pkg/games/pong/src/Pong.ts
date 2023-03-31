import { Entity, Game, Renderer, System } from "@piggo-legends/gamertc";
import { Container, Text, Texture, Sprite, Assets, Spritesheet, Graphics } from "pixi.js";

const floorTextureFetch = Texture.fromURL('floor_small.png');
const stoneTextureFetch = Texture.fromURL('stone.png');
const dirtTextureFetch = Texture.fromURL('dirt.png');

export class Pong extends Game {

  constructor(renderer: Renderer) {
    super({
      renderer: renderer,
      entities: [
        new Entity({
          name: "paddle1",
          components: []
        }),
        new Entity({
          name: "paddle2",
          components: []
        }),
      ],
      systems: [
        new System({
          name: "systemForUpdatingPaddlePositionBasedOnInput",
          onTick: (entities: Entity[]) => {
            console.log("systemForUpdatingPaddlePositionBasedOnInput", entities);
          }
        })
      ]
    });
    this.init();
  }

  init = async () => {
    // add the tiles
    const floorTexture = await stoneTextureFetch;
    const floorContainer = await this.addFloor(floorTexture, 50, 50);
    this.debugContainer(floorContainer);

    // add the character
    const characterAssets = await Assets.load("chars.json");
    const characterContainer = this.addCharacter(characterAssets.textures["walk4"]);
    this.debugContainer(characterContainer);
    this.addControls(characterContainer);

    // add fps text
    this.addFpsText();
  }

  addFpsText = () => {
    const fpsContainer = new Container();

    // position the container
    fpsContainer.y = 5;
    fpsContainer.x = this.renderer.app.screen.width - 35;

    // dynamic text
    const fpsText = new Text();
    fpsText.style = { fill: 0xFFFF11, fontSize: 16 };
    this.renderer.app.ticker.add(() => {
      fpsText.text = Math.round(this.renderer.app.ticker.FPS);
    });

    // add text to container
    fpsContainer.addChild(fpsText);

    // add container to renderer
    this.renderer.addContainer(fpsContainer);
  }

  addCharacter = (texture: Texture): Container => {
    const characterContainer = new Container();
    characterContainer.position.set(300, 0);
    this.renderer.addContainer(characterContainer);

    const character = new Sprite(texture);
    character.scale.set(2);
    character.roundPixels = true;
    characterContainer.addChild(character);

    return characterContainer;
  }

  addFloor = async (texture: Texture, width: number, height: number): Promise<Container> => {
    // Create a container for the tiles
    const tilesContainer = new Container();
    tilesContainer.position.set(300, 0);
    this.renderer.addContainer(tilesContainer);

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

  debugContainer = (container: Container) => {
    const graphics = new Graphics();
    this.renderer.app.ticker.add(() => {
      graphics.clear();
      graphics.lineStyle(1, 0xFF0000);

      // draw a circle at the center of the container and a rectangle around it
      const bounds = container.getBounds();
      graphics.drawCircle(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, 3);
      graphics.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
    });
    this.renderer.addContainer(new Container().addChild(graphics));
  }

  addControls = (container: Container) => {
    const inputs = {
      w: false,
      a: false,
      s: false,
      d: false,
    };

    document.addEventListener('keydown', (event) => {
      const keyName = event.key.toLowerCase();
      if (keyName in inputs) {
        inputs[keyName] = true;
      }
    });

    document.addEventListener('keyup', (event) => {
      const keyName = event.key.toLowerCase();
      if (keyName in inputs) {
        inputs[keyName] = false;
      }
    });

    const speed = 2;

    this.renderer.app.ticker.add(() => {
      if (inputs.w) {
        container.y -= speed;
      }
      if (inputs.a) {
        container.x -= speed;
      }
      if (inputs.s) {
        container.y += speed;
      }
      if (inputs.d) {
        container.x += speed;
      }
    });
  }
}
