import { AnimatedSprite, Assets } from "pixi.js";
import { Entity, EntityProps } from "@piggo-legends/core";
import { Character } from "@piggo-legends/contrib";

const assetsLoad = Assets.load("spaceship.json");

export type SpaceshipProps = EntityProps & {}

export class Spaceship extends Entity<SpaceshipProps> {
  constructor(props: SpaceshipProps) {
    super(props);
    this.init();
  }

  init = async () => {
    const assets = await assetsLoad;
    this.renderable = new Character({
      renderer: this.props.renderer,
      animations: {
        d: new AnimatedSprite([assets.textures["spaceship"]]),
        u: new AnimatedSprite([assets.textures["spaceship"]]),
        l: new AnimatedSprite([assets.textures["spaceship"]]),
        r: new AnimatedSprite([assets.textures["spaceship"]]),
        dl: new AnimatedSprite([assets.textures["spaceship"]]),
        dr: new AnimatedSprite([assets.textures["spaceship"]]),
        ul: new AnimatedSprite([assets.textures["spaceship"]]),
        ur: new AnimatedSprite([assets.textures["spaceship"]])
      },
      enableControls: false,
      track: false,
      pos: { x: 100, y: 400 },
      scale: 2,
      zIndex: 1
    });
  }
}
