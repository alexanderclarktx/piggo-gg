import { Actions, Character, Clickable, ColliderRJS, Debug, Entity, World, Health, NPC, Networked, Position, Renderable, ZombieMovement, ZombieMovementCommands, PositionProps } from "@piggo-legends/core";
import { AnimatedSprite, Assets, SCALE_MODES } from "pixi.js";

export type ZombieProps = {
  id: string,
  positionProps?: PositionProps
}

export const Zombie = ({ id, positionProps = {renderMode: "isometric", x: 100, y: 100}}: ZombieProps): Entity => {

  const render = async () => {
    const textures = (await Assets.load("chars.json")).textures;

    const character = new Character({
      animations: {
        d: new AnimatedSprite([textures["d1"], textures["d2"], textures["d3"]]),
        u: new AnimatedSprite([textures["u1"], textures["u2"], textures["u3"]]),
        l: new AnimatedSprite([textures["l1"], textures["l2"], textures["l3"]]),
        r: new AnimatedSprite([textures["r1"], textures["r2"], textures["r3"]]),
        dl: new AnimatedSprite([textures["dl1"], textures["dl2"], textures["dl3"]]),
        dr: new AnimatedSprite([textures["dr1"], textures["dr2"], textures["dr3"]]),
        ul: new AnimatedSprite([textures["ul1"], textures["ul2"], textures["ul3"]]),
        ur: new AnimatedSprite([textures["ur1"], textures["ur2"], textures["ur3"]])
      },
      scale: 2,
      zIndex: 2,
      tintColor: 0x00ff00,
      scaleMode: SCALE_MODES.NEAREST,
      anchor: { x: 0.5, y: 0.7 }
    });

    return character;
  }

  return {
    id,
    components: {
      position: new Position(positionProps),
      networked: new Networked({ isNetworked: true }),
      clickable: new Clickable({
        width: 32,
        height: 32,
        active: true
      }),
      health: new Health(100, 100),
      npc: new NPC<ZombieMovementCommands>({
        onTick: (_) => "chase"
      }),
      actions: new Actions({
        ...ZombieMovement,
        "click": (entity: Entity, world: World) => {
          const health = entity.components.health as Health;
          health.data.health -= 50;
          if (health.data.health <= 0) {
            world.removeEntity(entity.id);
          } else if (entity.components.renderable?.children) {  
            const character = entity.components.renderable.children[0] as Character;
            character.applyColor(0xff5533);
            // // @ts-expect-error
            // entity.components.renderable.c.children[0].tint = 0xff5533;
          }
        }
      }),
      colliderRJS: new ColliderRJS({ radius: 8 }),
      debug: new Debug(),
      renderable: new Renderable({
        zIndex: 2,
        // container: render,
        children: async () => [await render()]
      })
    }
  }
}
