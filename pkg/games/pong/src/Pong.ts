import { Entity, Game, Renderer, System } from "@piggo-legends/gamertc";
import { Container, Text, Texture, Sprite, Assets, Spritesheet, Graphics } from "pixi.js";

const stoneTexture = Texture.from('stone.png');
const dirtTexture = Texture.from('dirt.png');

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

    // load the character spritesheet
    Assets.load("chars.json").then((assets: Spritesheet) => {
      this.addTiles(assets.textures["walk4"]);
    });

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

  addTiles = (texture: Texture) => {
    // Define the map data
    const mapData = [
      [1, 1, 1, 1],
      [1, 1, 1, 1],
      [1, 1, 0, 1],
      [1, 1, 1, 1],
    ];

    // Create a container for the tiles
    const tilesContainer = new Container();
    tilesContainer.position.set(300, 0);
    this.renderer.addContainer(tilesContainer);

    // Create a graphics object to draw the bounding box
    const graphics = new Graphics();
    this.renderer.app.ticker.add(() => {
      const center = tilesContainer.position;
      graphics.clear();
      graphics.lineStyle(1, 0xFF0000);
      graphics.drawCircle(center.x, center.y, 1);
      const bounds = tilesContainer.getBounds();
      graphics.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);
    });
    this.renderer.addContainer(new Container().addChild(graphics));

    // Loop through the map data and create tiles
    for (let row = 0; row < mapData.length; row++) {
        for (let col = 0; col < mapData[row].length; col++) {
            // Calculate the tile position
            const x = (col - row) * texture.width / 2;
            const y = (col + row) * texture.height / 8; // todo this is dependent on aspect ratio

            // Create the tile sprite
            const tile = new Sprite(texture);
            tile.position.set(x, y);
            tile.anchor.set(0.5);

            // Add the tile to the container
            tilesContainer.addChild(tile);
        }
    }
  }
}
