import { Entity, Game, GameProps, Renderer, System } from "@piggo-legends/core";
import { Actions, Controlled, Controller } from "@piggo-legends/contrib";
import { Set } from "typescript";

export var chatBuffer: string[] = [];
export var chatHistory: string[] = [];
export var chatIsOpen = false;

export const validChatCharacters: Set<string> = new Set("abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()_+-=[]{}\\|;:'\",./<>?`~ ");
export const charactersPreventDefault = new Set("/'");

// InputSystem handles all keyboard inputs
export const InputSystem = (renderer: Renderer, thisPlayerId: string): System => {
  let bufferedDown: Set<string> = new Set([]);
  let bufferedUp: Set<string> = new Set([]);

  let chatBackspacing = false;

  const onTick = (entities: Entity[], game: Game<GameProps>) => {

    // handle inputs for controlled entities
    for (const entity of entities) {
      const controlled = entity.components.controlled as Controlled;
      if (controlled.entityId === thisPlayerId) {
        handleInputForControlledEntity(entity, game);
      }
    }

    // handle buffered backspace
    if (chatIsOpen && chatBackspacing) {
      if (game.tick % 8 === 0) chatBuffer.pop();
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
    for (const input in controller.controllerMap) {
      if (input.includes(",")) {
        const inputKeys = input.split(",");
        if (inputKeys.every((key) => buffer.has(key))) {
          const callback = actions.actionMap[controller.controllerMap[input]];
          if (callback) callback(controlledEntity, game);

          // remove all keys from the buffer
          inputKeys.forEach((key) => buffer.delete(key));
        }
      } else {
        if (buffer.has(input)) {
          const callback = actions.actionMap[controller.controllerMap[input]];
          if (callback) callback(controlledEntity, game);

          // remove the key from the buffer
          buffer.delete(input);
        }
      }
    }
  }

  const addKeyDownListener = () => {
    document.addEventListener("keydown", (event) => {
      if (document.hasFocus()) {
        const keyName = event.key.toLowerCase();
        if (charactersPreventDefault.has(keyName)) event.preventDefault();

        if (!bufferedDown.has(keyName)) {

          // toggle chat
          if (keyName === "enter" && !chatIsOpen) {
            console.log("chat open");
            chatIsOpen = true;
          } else if (chatIsOpen && (keyName === "enter" || keyName === "escape")) {
            console.log("chat closed");
            chatIsOpen = false;
            if (chatBuffer.length > 0) {
              chatHistory.push(chatBuffer.join(""));
            }
            chatBuffer = [];
          }

          // handle backspace
          if (chatIsOpen && keyName === "backspace") {
            chatBackspacing = true;
          }

          // push to chatBuffer or bufferedDown
          if (chatIsOpen && validChatCharacters.has(keyName)) {
            chatBuffer.push(keyName);
          } else {
            bufferedDown.add(keyName);
          }
        }
      }
    });
  }

  const addKeyUpListener = () => {
    document.addEventListener("keyup", (event) => {
      if (document.hasFocus()) {
        const keyName = event.key.toLowerCase();

        // handle released backspace
        if (chatIsOpen && keyName === "backspace") chatBackspacing = false;

        // remove from bufferedDown and add to bufferedUp
        bufferedUp.add(keyName);
        bufferedDown.delete(keyName);
      }
    });
  }

  addKeyDownListener();
  addKeyUpListener();

  return {
    renderer,
    componentTypeQuery: ["controlled"],
    onTick,
  }
}
