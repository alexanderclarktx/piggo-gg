import { Entity, EntityProps, Game, GameProps, Renderer, System, SystemProps } from "@piggo-legends/core";
import { Actions, Controller } from "@piggo-legends/contrib";
import { Set } from "typescript";

// checks inputs against the controllable objects in the scene
export class InputSystem extends System<SystemProps> {
  componentTypeQuery = ["controller", "actions"];

  bufferedDown: Set<string> = new Set([]);
  bufferedUp: Set<string> = new Set([]);

  constructor(props: SystemProps) {
    super(props);
    this.init();
  }

  init = () => {
    document.addEventListener("keydown", (event) => {
      if (document.hasFocus()) { //  && this.windowFocused
        const keyName = event.key.toLowerCase();
        this.bufferedDown.add(keyName);
      }
    });

    document.addEventListener("keyup", (event) => {
      if (document.hasFocus()) { // && this.windowFocused
        const keyName = event.key.toLowerCase();
        this.bufferedUp.add(keyName);
        this.bufferedDown.delete(keyName);
      }
    });
  }

  onTick = (entities: Entity<EntityProps>[], game: Game<GameProps>) => {
    for (const entity of entities) {
      // copy the input buffer
      let buffer: Set<string> = new Set([]);
      this.bufferedDown.forEach((key) => buffer.add(key));

      // check for actions
      const controller = entity.props.components.controller as Controller;
      const actions = entity.props.components.actions as Actions;
      if (controller.active) {
        for (const input in controller.map) {
          if (input.includes(",")) {
            const inputKeys = input.split(",");
            if (inputKeys.every((key) => buffer.has(key))) {
              const callback = actions.map[controller.map[input]];
              if (callback) callback(entity, game);

              // remove all keys from the buffer
              inputKeys.forEach((key) => buffer.delete(key));
            }
          } else {
            if (buffer.has(input)) {
              const callback = actions.map[controller.map[input]];
              if (callback) callback(entity, game);

              // remove the key from the buffer
              buffer.delete(input);
            }
          }
        }
      }
    }
  }
}
