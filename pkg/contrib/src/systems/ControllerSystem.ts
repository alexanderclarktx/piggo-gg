import { Entity,  Game, GameProps, System, SystemProps } from "@piggo-legends/core";
import { Actions, Controlled, Controller } from "@piggo-legends/contrib";
import { Set } from "typescript";

export type ControllerSystemProps = SystemProps & {
  player: string,
}

// checks inputs against the controllable objects in the scene
export class ControllerSystem extends System<ControllerSystemProps> {
  componentTypeQuery = ["controlled"];

  player: string;
  bufferedDown: Set<string> = new Set([]);
  bufferedUp: Set<string> = new Set([]);

  constructor(props: ControllerSystemProps) {
    super(props);
    this.player = props.player;
    this.init();
  }

  init = () => {
    this.addKeyDownListener();
    this.addKeyUpListener();
  }

  onTick = (entities: Entity[], game: Game<GameProps>) => {
    for (const entity of entities) {
      const controlled = entity.components.controlled as Controlled;
      if (controlled.entityId === this.player) {
        this.handleInputForControlledEntity(entity, game);
      }
    }
  }

  handleInputForControlledEntity = (controlledEntity: Entity, game: Game<GameProps>) => {
    // copy the input buffer
    let buffer: Set<string> = new Set([]);
    this.bufferedDown.forEach((key) => buffer.add(key));

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

  addKeyDownListener = () => {
    document.addEventListener("keydown", (event) => {
      if (document.hasFocus()) { //  && this.windowFocused
        const keyName = event.key.toLowerCase();
        if (!this.bufferedDown.has(keyName)) this.bufferedDown.add(keyName);
      }
    });
  }

  addKeyUpListener = () => {
    document.addEventListener("keyup", (event) => {
      if (document.hasFocus()) { // && this.windowFocused
        const keyName = event.key.toLowerCase();
        if (!this.bufferedUp.has(keyName)) this.bufferedUp.add(keyName);
        this.bufferedDown.delete(keyName);
      }
    });
  }
}
