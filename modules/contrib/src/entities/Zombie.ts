import { Actions, Character, CharacterMovementCommands, CharacterMovementScreenPixels, CharacterMovementWorldPixels, Clickable, Controlling, NPC, Networked, Position, Renderable } from "@piggo-legends/contrib";
import { Entity, Game } from "@piggo-legends/core";
import { AnimatedSprite, Assets, SCALE_MODES } from "pixi.js";

export const Zombie = async (id: string): Promise<Entity> => {

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
      scaleMode: SCALE_MODES.NEAREST
    });

    return character;
  }

  return {
    id: id,
    components: {
      position: new Position({ x: Math.random() * 800, y: Math.random() * 600 }),
      networked: new Networked({ isNetworked: true }),
      clickable: new Clickable({
        width: 32,
        height: 32,
        active: true,
        onPress: "click"
      }),
      npc: new NPC<CharacterMovementCommands>({
        onTick: (entity: Entity, game: Game) => {

          // find the closest player
          const player = game.entities[game.thisPlayerId] as Entity & { components: { controlling: Controlling } };

          const zp = entity.components.position as Position;

          // move toward closest player
          if (player && player.components.controlling) {

            const playerControlledEntity = game.entities[player.components.controlling.entityId];
            const pp = playerControlledEntity.components.position as Position;

            // if (Math.abs(pp.y - zp.y) < 2) {
            //   if (pp.x > zp.x) return "right";
            //   if (pp.x < zp.x) return "left";
            // }

            // if (Math.abs(pp.x - zp.x) < 2) {
            //   if (pp.y > zp.y) return "down";
            //   if (pp.y < zp.y) return "up";
            // }

            if (pp.x > zp.x && pp.y < zp.y) return "upright";
            if (pp.x < zp.x && pp.y < zp.y) return "upleft";
            if (pp.x > zp.x && pp.y > zp.y) return "downright";
            if (pp.x < zp.x && pp.y > zp.y) return "downleft";
            if (pp.x === zp.x && pp.y < zp.y) return "up";
            if (pp.x === zp.x && pp.y > zp.y) return "down";
            if (pp.x < zp.x && pp.y === zp.y) return "left";
            if (pp.x > zp.x && pp.y === zp.y) return "right";
          }
          return null;
        }
      }),
      actions: new Actions(CharacterMovementWorldPixels),
      renderable: new Renderable({
        debuggable: true,
        zIndex: 1,
        renderable: render
      })
    }
  }
}
