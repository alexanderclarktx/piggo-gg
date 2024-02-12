import { Actions, Character, Clickable, Collider, Debug, Entity, Game, Health, NPC, Networked, Position, Renderable, ZombieMovement, ZombieMovementCommands } from "@piggo-legends/core";
import { AnimatedSprite, Assets, SCALE_MODES } from "pixi.js";

export const Zombie = (id: string): Entity => {

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
      position: new Position({ renderMode: "isometric", x: 100 + Math.random() * 600, y: 100 + Math.random() * 600 }),
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
        "click": (entity: Entity, game: Game) => {
          const health = entity.components.health as Health;
          health.data.health -= 50;
          if (health.data.health <= 0) {
            game.removeEntity(entity.id);
          }
        }
      }),
      collider: new Collider({ radius: 8 }),
      debug: new Debug(),
      renderable: new Renderable({
        zIndex: 2,
        children: async () => [await render()]
      })
    }
  }
}
