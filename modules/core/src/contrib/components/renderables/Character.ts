import { AnimatedSprite, SCALE_MODES } from "pixi.js";
import { Renderable, RenderableProps } from "@piggo-legends/core";

export type CharacterProps = RenderableProps & {
  animations: {
    d: AnimatedSprite, u: AnimatedSprite, l: AnimatedSprite, r: AnimatedSprite,
    dl: AnimatedSprite, dr: AnimatedSprite, ul: AnimatedSprite, ur: AnimatedSprite
  },
  scale?: number,
  tintColor?: number,
  scaleMode?: SCALE_MODES,
  anchor?: { x: number, y: number }
}

export type AnimationKeys = keyof CharacterProps['animations'];

export class Character extends Renderable<CharacterProps> {
  currentAnimation: AnimatedSprite;

  constructor(props: CharacterProps) {
    super(props);
    this.init();
  }

  init = () => {
    this.c.eventMode = "static";

    // set the animation speed and scale for each sprite
    Object.values(this.props.animations).forEach((animation: AnimatedSprite) => {
      animation.animationSpeed = 0.1;
      animation.scale.set(this.props.scale || 1);
      animation.anchor.set(this.props.anchor?.x ?? 0.5, this.props.anchor?.y ?? 0.5);
      animation.texture.baseTexture.scaleMode = this.props.scaleMode ?? SCALE_MODES.LINEAR;
      if (this.props.tintColor) animation.tint = this.props.tintColor;
    });

    // play the down animation by default
    this.setAnimation("d");
  }

  setAnimation = (animationKey: AnimationKeys) => {
    this.c.removeChild(this.currentAnimation);
    this.currentAnimation = this.props.animations[animationKey];
    this.c.addChild(this.currentAnimation);
    this.currentAnimation.play();
  }
}
