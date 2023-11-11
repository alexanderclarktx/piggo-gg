import { ActionMap, Character, Position } from "@piggo-legends/contrib"
import { Entity } from "@piggo-legends/core";

const speed = 1;

export type CharacterMovementCommands = "upleft" | "upright" | "downleft" | "downright" | "up" | "down" | "left" | "right";

export const CharacterMovement: ActionMap<CharacterMovementCommands> = {
  "upleft": (entity: Entity) => {
    const position = entity.components.position as Position;
    position.x -= speed * 1.414213562373095;
    position.y -= speed * 0.7212489168102785;
    position.x = +(position.x.toFixed(2));
    position.y = +(position.y.toFixed(2));

    const character = entity.components.renderable as Character;
    character.setAnimation("ul");
  },
  "upright": (entity: Entity) => {
    const position = entity.components.position as Position;
    position.x += speed * 1.414213562373095;
    position.y -= speed * 0.7212489168102785;
    position.x = +(position.x.toFixed(2));
    position.y = +(position.y.toFixed(2));

    const character = entity.components.renderable as Character;
    character.setAnimation("ur");
  },
  "downleft": (entity: Entity) => {
    const position = entity.components.position as Position;
    position.x -= speed * 1.414213562373095;
    position.y += speed * 0.7212489168102785;
    position.x = +(position.x.toFixed(2));
    position.y = +(position.y.toFixed(2));

    const character = entity.components.renderable as Character;
    character.setAnimation("dl");
  },
  "downright": (entity: Entity) => {
    const position = entity.components.position as Position;
    position.x += speed * 1.414213562373095;
    position.y += speed * 0.7212489168102785;
    position.x = +(position.x.toFixed(2));
    position.y = +(position.y.toFixed(2));

    const character = entity.components.renderable as Character;
    character.setAnimation("dr");
  },
  "up": (entity: Entity) => {
    const position = entity.components.position as Position;
    position.y -= speed

    const character = entity.components.renderable as Character;
    character.setAnimation("u");
  },
  "down": (entity: Entity) => {
    const position = entity.components.position as Position;
    position.y += speed

    const character = entity.components.renderable as Character;
    character.setAnimation("d");
  },
  "left": (entity: Entity) => {
    const position = entity.components.position as Position;
    position.x -= speed;

    const character = entity.components.renderable as Character;
    character.setAnimation("l");
  },
  "right": (entity: Entity) => {
    const position = entity.components.position as Position;
    position.x += speed;

    const character = entity.components.renderable as Character;
    character.setAnimation("r");
  }
}
