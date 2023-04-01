import { Entity, Game, Renderer, System, Button } from "@piggo-legends/gamertc";
import { Container, Text, Texture, Sprite, AnimatedSprite, Assets, Graphics } from "pixi.js";

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
    window["renderer"] = this.renderer;
  }

  init = async () => {
    // add the tiles
    const floorTexture = await stoneTextureFetch;
    const floorContainer = await this.addFloor(floorTexture, 10, 10);
    this.debugContainer(floorContainer);

    // add the character
    const characterAssets = await Assets.load("chars.json");
    const characterContainer = this.addCharacter([
      characterAssets.textures["down1"],
      characterAssets.textures["down2"],
      characterAssets.textures["down3"]
    ]);
    this.debugContainer(characterContainer);
    this.addControls(characterContainer, 4);
    this.renderer.trackCamera(characterContainer);

    // add fps text
    this.addFpsText();

    // add fullscreen button
    this.renderer.addHUD(new Button({
      dims: {x: 690, y: 5, w: 37, lx: 10, ly: 5},
      text: (new Text("⚁", { fill: '#FFFFFF', fontSize: 16 })),
      onPress: () => {
        //@ts-ignore
        this.renderer.app.view.requestFullscreen();
      },
      onDepress: () => {}
    }));

    // add debug button
    this.renderer.addHUD(new Button({
      dims: {x: 735, y: 5, w: 60, lx: 10, ly: 7},
      text: (new Text("debug", { fill: '#FFFFFF', fontSize: 14 })),
      onPress: () => {
        this.renderer.debug = true;
      },
      onDepress: () => {
        this.renderer.debug = false;
      }
    }));
  }

  addFpsText = () => {
    // create the container
    const fpsContainer = new Container();
    fpsContainer.position.set(5, 5);

    // dynamic text
    const fpsText = new Text();
    fpsText.style = { fill: 0xFFFF11, fontSize: 16 };
    this.renderer.app.ticker.add(() => {
      fpsText.text = Math.round(this.renderer.app.ticker.FPS);
    });

    // add text to container
    fpsContainer.addChild(fpsText);

    // add container to the HUD
    this.renderer.addHUD(fpsContainer);
  }

  addCharacter = (textures: Texture[]): Container => {
    // Create a container for the character
    const characterContainer = new Container();
    characterContainer.position.set(300, 0);
    this.renderer.addWorld(characterContainer);

    // const character = new Sprite(texture);
    const animatedSprite = new AnimatedSprite(textures);
    animatedSprite.animationSpeed = 0.1;
    animatedSprite.play();
    animatedSprite.scale.set(2);
    characterContainer.addChild(animatedSprite);

    return characterContainer;
  }

  addFloor = async (texture: Texture, width: number, height: number): Promise<Container> => {
    // Create a container for the tiles
    const tilesContainer = new Container();
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

  debugContainer = (container: Container) => {
    // get the bounds of the container
    const bounds = container.getLocalBounds();

    // set up graphics
    const graphics = new Graphics();
    graphics.clear();
    graphics.lineStyle(1, 0xFF0000);

    // draw the bounds
    graphics.drawRect(bounds.x, bounds.y, bounds.width, bounds.height);

    // draw the center circle
    graphics.beginFill(0xFFFF00);
    graphics.drawCircle(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2, 2);

    // add the graphics to the container
    container.addChild(graphics);

    // // if debug is disabled, hide the graphics
    this.renderer.app.ticker.add(() => {
      graphics.visible = this.renderer.debug;
    });
  }

  addControls = (container: Container, speed: number) => {
    const inputs = { w: false, a: false, s: false, d: false };

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

    this.renderer.app.ticker.add(() => {
      var xMovement = (inputs.d ? 1 : 0) - (inputs.a ? 1 : 0);
      var yMovement = (inputs.s ? 1 : 0) - (inputs.w ? 1 : 0);

      // Calculate the length of the movement vector
      const length = Math.sqrt(xMovement * xMovement + yMovement * yMovement);

      // Normalize the movement vector if it has a length greater than 1
      if (length > 1) {
        xMovement /= length;
        yMovement /= length;
      }

      // Update the container position based on the normalized movement vector
      container.x += speed * xMovement;
      container.y += speed * yMovement;
    });
  }
}
