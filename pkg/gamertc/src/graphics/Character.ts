import { AnimatedSprite, Point } from "pixi.js";
import { Renderable, RenderableProps } from "./Renderable";
import { Renderer } from "./Renderer";

export type CharacterProps = {
  animations: {
    d: AnimatedSprite, u: AnimatedSprite, l: AnimatedSprite, r: AnimatedSprite,
    dl: AnimatedSprite, dr: AnimatedSprite, ul: AnimatedSprite, ur: AnimatedSprite
  },
  enableControls?: boolean,
  track?: boolean
}

export class Character extends Renderable {
  animations: CharacterProps["animations"];
  currentAnimation: AnimatedSprite;

  constructor(renderer: Renderer, options: CharacterProps & RenderableProps) {
    super(renderer, options);

    this.animations = options.animations;

    for (const key in this.animations) {
      this.animations[key].animationSpeed = 0.1;
      this.animations[key].scale.set(2);
      this.animations[key].anchor.set(0.5);
      this.animations[key].alpha = 0.5;
    }

    // for now, play the down animation
    this.currentAnimation = this.animations.d;
    this.addChild(this.currentAnimation);
    this.currentAnimation.play();

    if (options.enableControls) {
      this.addCarControls();
    }

    if (options.track) {
      this.renderer.trackCamera(this);
    }
  }

  addCarControls = () => {
    let velocity = new Point(0, 0);
    const MAX_VELOCITY = 100;
    const ACCELERATION = 0.2;
    const FRICTION = 0.05;
    const TURN_SPEED = 0.015;
    const SLIDE_FACTOR = 2;
    const SLIDE_ACCELERATION = 0.3;

    const inputs = { w: false, a: false, s: false, d: false, shift: false };

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
      // Apply friction
      velocity.x -= velocity.x * FRICTION;
      velocity.y -= velocity.y * FRICTION;
  
      // Handle acceleration
      if (inputs.w && !inputs.s) {
        const acceleration = inputs.shift ? SLIDE_ACCELERATION : ACCELERATION;
        velocity.x += Math.sin(this.rotation) * acceleration;
        velocity.y -= Math.cos(this.rotation) * acceleration;
      } else if (inputs.s && !inputs.w) {
        const acceleration = inputs.shift ? SLIDE_ACCELERATION : ACCELERATION;
        velocity.x -= Math.sin(this.rotation) * acceleration;
        velocity.y += Math.cos(this.rotation) * acceleration;
      }

      // Handle turning
      const slide_multiplier = inputs.shift ? SLIDE_FACTOR : 1;
      if (inputs.a && !inputs.d) {
        this.rotation -= TURN_SPEED * slide_multiplier;
      } else if (inputs.d && !inputs.a) {
        this.rotation += TURN_SPEED * slide_multiplier;
      }

      // Handle maximum velocity
      const currentVelocity = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      if (currentVelocity > MAX_VELOCITY) {
        const maxVelocityRatio = MAX_VELOCITY / currentVelocity;
        velocity.x *= maxVelocityRatio;
        velocity.y *= maxVelocityRatio;
      }

      // Update the container position based on the velocity
      this.x += velocity.x;
      this.y += velocity.y;

      // Play the correct animation
      if (currentVelocity > 0) {
        const animationToUse =
          (velocity.y > 0 ? "d" : "") + (velocity.y < 0 ? "u" : "") +
          (velocity.x > 0 ? "r" : "") + (velocity.x < 0 ? "l" : "");

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

      // if character is moving, play the correct animation
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
