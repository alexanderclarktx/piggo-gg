import { AnimatedSprite, Resource, Texture } from "pixi.js";
import { Renderable } from "./Renderable";
import { Renderer } from "./Renderer";

export type CharacterOptions = {
  animations: {
    d: AnimatedSprite, u: AnimatedSprite, l: AnimatedSprite, r: AnimatedSprite,
    dl: AnimatedSprite, dr: AnimatedSprite, ul: AnimatedSprite, ur: AnimatedSprite
  },
  enableControls?: boolean,
  track?: boolean
}

export class Character extends Renderable {
  animations: CharacterOptions["animations"];
  currentAnimation: AnimatedSprite;

  constructor(renderer: Renderer, options: CharacterOptions) {
    super(renderer);
    this.position.set(300, 0);

    this.animations = options.animations;

    for (const key in this.animations) {
      this.animations[key].animationSpeed = 0.1;
      this.animations[key].scale.set(2);
    }

    // for now, play the down animation
    this.currentAnimation = this.animations.d;
    this.addChild(this.currentAnimation);
    this.currentAnimation.play();

    if (options.enableControls) {
      this.addControls();
    }

    if (options.track) {
      this.renderer.trackCamera(this);
    }
  }

  addControls = () => {
    const inputs = { w: false, a: false, s: false, d: false };

    document.addEventListener("keydown", (event) => {
      const keyName = event.key.toLowerCase();
      if (keyName in inputs) {
        inputs[keyName] = true;
      }
    });

    document.addEventListener("keyup", (event) => {
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
      this.x += 4 * xMovement;
      this.y += 4 * yMovement;

      if (!(xMovement === 0 && yMovement === 0)) {
        const animationToUse =
          (yMovement > 0 ? "d" : "") + (yMovement < 0 ? "u" : "") +
          (xMovement > 0 ? "r" : "") + (xMovement < 0 ? "l" : "");

        if (this.currentAnimation !== this.animations[animationToUse]) {
          if (this.currentAnimation) {
            this.removeChild(this.currentAnimation);
          }
          this.currentAnimation = this.animations[animationToUse];
          this.addChild(this.currentAnimation);
          this.currentAnimation.play();
        } else {
          this.currentAnimation.play();
        }
      }
    });
  }
}
