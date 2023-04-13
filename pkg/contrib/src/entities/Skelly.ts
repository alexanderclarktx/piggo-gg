import { Entity, EntityProps } from "@piggo-legends/core";
import { Character } from "@piggo-legends/contrib";
import { AnimatedSprite, Assets, SCALE_MODES } from 'pixi.js';

const assets = Assets.load("chars.json");

export type SkellyProps = EntityProps & {
  enableControls?: boolean,
  track?: boolean
}

export class Skelly extends Entity<SkellyProps> {
  constructor(props: SkellyProps) {
    super(props);
    this.init();
  }

  init = async () => {
    const char = await assets;
    for (const key in char.textures) {
      char.textures[key].baseTexture.scaleMode = SCALE_MODES.NEAREST;
    }
    this.renderable = new Character({
      renderer: this.props.renderer,
      animations: {
        d: new AnimatedSprite([char.textures["d1"], char.textures["d2"], char.textures["d3"]]),
        u: new AnimatedSprite([char.textures["u1"], char.textures["u2"], char.textures["u3"]]),
        l: new AnimatedSprite([char.textures["l1"], char.textures["l2"], char.textures["l3"]]),
        r: new AnimatedSprite([char.textures["r1"], char.textures["r2"], char.textures["r3"]]),
        dl: new AnimatedSprite([char.textures["dl1"], char.textures["dl2"], char.textures["dl3"]]),
        dr: new AnimatedSprite([char.textures["dr1"], char.textures["dr2"], char.textures["dr3"]]),
        ul: new AnimatedSprite([char.textures["ul1"], char.textures["ul2"], char.textures["ul3"]]),
        ur: new AnimatedSprite([char.textures["ur1"], char.textures["ur2"], char.textures["ur3"]])
      },
      enableControls: this.props.enableControls || false,
      track: this.props.track || false,
      pos: { x: 300, y: 400 },
      scale: 2,
      zIndex: 1
    });
  }
}
