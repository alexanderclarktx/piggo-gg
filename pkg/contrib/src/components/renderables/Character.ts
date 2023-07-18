import { AnimatedSprite } from "pixi.js";
import { Renderable, RenderableProps } from "@piggo-legends/contrib";

export type CharacterProps = RenderableProps & {
  animations: {
    d: AnimatedSprite, u: AnimatedSprite, l: AnimatedSprite, r: AnimatedSprite,
    dl: AnimatedSprite, dr: AnimatedSprite, ul: AnimatedSprite, ur: AnimatedSprite
  },
  track?: boolean,
  scale?: number
}

export class Character extends Renderable<CharacterProps> {
  currentAnimation: AnimatedSprite;
  windowFocused: boolean = true;

  constructor(props: CharacterProps) {
    super({
      ...props,
      debuggable: props.debuggable || true,
    });
    this.init();
  }

  init = () => {
    this.c.eventMode = "static";

    // set the animation speed and scale for each sprite
    Object.values(this.props.animations).forEach((animation: AnimatedSprite) => {
      animation.animationSpeed = 0.1;
      animation.scale.set(this.props.scale || 1);
      animation.anchor.set(0.5);
    });

    // play the down animation by default
    this.setAnimation("d");

    // follow the character with the camera
    if (this.props.track) {
      this.props.renderer.trackCamera(this);
    }
  }

  setAnimation = (animationKey: keyof CharacterProps['animations']) => {
    this.c.removeChild(this.currentAnimation);
    this.currentAnimation = this.props.animations[animationKey];
    this.c.addChild(this.currentAnimation);
    this.currentAnimation.play();
  }
}
