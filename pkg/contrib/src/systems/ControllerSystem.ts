import { Entity, Game, GameProps, Renderer, System } from "@piggo-legends/core";
import { Actions, Controlled, Controller } from "@piggo-legends/contrib";
import { Set } from "typescript";

// checks inputs against the controllable objects in the scene
export const ControllerSystem = (renderer: Renderer, thisPlayerId: string): System => {
  let bufferedDown: Set<string> = new Set([]);
  let bufferedUp: Set<string> = new Set([]);

  const onTick = (entities: Entity[], game: Game<GameProps>) => {
    for (const entity of entities) {
      const controlled = entity.components.controlled as Controlled;
      if (controlled.entityId === thisPlayerId) {
        handleInputForControlledEntity(entity, game);
      }
    }
  }

  const handleInputForControlledEntity = (controlledEntity: Entity, game: Game<GameProps>) => {
    // copy the input buffer
    let buffer: Set<string> = new Set([]);
    bufferedDown.forEach((key) => buffer.add(key));

    // check for actions
    const controller = controlledEntity.components.controller as Controller;
    const actions = controlledEntity.components.actions as Actions;

    // handle standalone and composite (a,b) input controls
    for (const input in controller.map) {
      if (input.includes(",")) {
        const inputKeys = input.split(",");
        if (inputKeys.every((key) => buffer.has(key))) {
          const callback = actions.map[controller.map[input]];
          if (callback) callback(controlledEntity, game);

          // remove all keys from the buffer
          inputKeys.forEach((key) => buffer.delete(key));
        }
      } else {
        if (buffer.has(input)) {
          const callback = actions.map[controller.map[input]];
          if (callback) callback(controlledEntity, game);

          // remove the key from the buffer
          buffer.delete(input);
        }
      }
    }
  }

  const addKeyDownListener = () => {
    document.addEventListener("keydown", (event) => {
      if (document.hasFocus()) { //  && windowFocused
        const keyName = event.key.toLowerCase();
        if (!bufferedDown.has(keyName)) bufferedDown.add(keyName);
      }
    });
  }

  const addKeyUpListener = () => {
    document.addEventListener("keyup", (event) => {
      if (document.hasFocus()) {
        const keyName = event.key.toLowerCase();
        if (!bufferedUp.has(keyName)) bufferedUp.add(keyName);
        bufferedDown.delete(keyName);
      }
    });
  }

  addKeyDownListener();
  addKeyUpListener();

  return ({
    renderer,
    componentTypeQuery: ["controlled"],
    onTick
  })
}
