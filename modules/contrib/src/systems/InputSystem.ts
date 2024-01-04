import { Entity, Game, SystemBuilder } from "@piggo-legends/core";
import { Actions, Ball, Controlled, Controller, Spaceship, Zombie, localCommandBuffer } from "@piggo-legends/contrib";

export var chatBuffer: string[] = [];
export var chatHistory: string[] = [];
export var chatIsOpen = false;

export const validChatCharacters: Set<string> = new Set("abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()_+-=[]{}\\|;:'\",./<>?`~ ");
export const charactersPreventDefault = new Set(["'", "/", " "]);

// InputSystem handles all keyboard inputs
export const InputSystem: SystemBuilder = ({ thisPlayerId, game }) => {
  let bufferedDown: Set<string> = new Set([]);
  let bufferedUp: Set<string> = new Set([]);
  let backspaceOn = false;

  let commandRegexes: { regex: RegExp, callback: (match: RegExpMatchArray) => Promise<void> }[] = [
    {
      regex: new RegExp(`/spawn (\\w+)`),
      callback: async (match: RegExpMatchArray) => {
        switch (match[1]) {
          case "spaceship":
            game.addEntity(await Spaceship());
            break;
          case "ball":
            game.addEntity(Ball());
            break;
          case "zombie":
            game.addEntity(await Zombie());
            break;
        }
      }
    }
  ];

  document.addEventListener("keyup", (event: KeyboardEvent) => {
    if (document.hasFocus()) {
      const keyName = event.key.toLowerCase();

      // handle released backspace
      if (chatIsOpen && keyName === "backspace") backspaceOn = false;

      // remove from bufferedDown and add to bufferedUp
      bufferedUp.add(keyName);
      bufferedDown.delete(keyName);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (document.hasFocus()) {
      const keyName = event.key.toLowerCase();
      if (charactersPreventDefault.has(keyName)) event.preventDefault();

      if (!bufferedDown.has(keyName)) {

        // toggle chat
        if (keyName === "enter" && !chatIsOpen) {
          chatIsOpen = true;
        } else if (chatIsOpen && (keyName === "enter" || keyName === "escape")) {

          // push the message to chatHistory
          if (chatBuffer.length > 0) {
            const message = chatBuffer.join("");
            chatHistory.push(message);
            processMessage(message);
          }

          chatBuffer = [];
          chatIsOpen = false;
        }

        // handle backspace
        if (chatIsOpen && keyName === "backspace") backspaceOn = true;

        // push to chatBuffer or bufferedDown
        (chatIsOpen && validChatCharacters.has(keyName)) ? chatBuffer.push(keyName) : bufferedDown.add(keyName);
      }
    }
  });

  const onTick = (entities: Entity[]) => {

    // handle inputs for controlled entities
    entities.forEach((entity) => {
      const controlled = entity.components.controlled as Controlled;
      if (controlled.entityId === thisPlayerId) handleInputForControlledEntity(entity, game);
    });

    // handle buffered backspace
    if (chatIsOpen && backspaceOn && game.tick % 3 === 0) chatBuffer.pop();
  }

  const handleInputForControlledEntity = (controlledEntity: Entity, game: Game) => {
    // copy the input buffer
    let buffer: Set<string> = new Set(bufferedDown);

    // check for actions
    const { controller, actions } = controlledEntity.components as { controller: Controller, actions: Actions };

    // handle standalone and composite (a,b) input controls
    for (const input in controller.controllerMap) {
      if (input.includes(",")) {
        const inputKeys = input.split(",");
        if (inputKeys.every((key) => buffer.has(key))) {
          // run the callback
          if (actions.actionMap[controller.controllerMap[input]]) {
            localCommandBuffer.push({
              tick: game.tick + 1,
              entityId: controlledEntity.id,
              actionId: controller.controllerMap[input]
            });
          }

          // remove all keys from the buffer
          inputKeys.forEach((key) => buffer.delete(key));
        }
      } else if (buffer.has(input)) {

        if (actions.actionMap[controller.controllerMap[input]]) {
          localCommandBuffer.push({
            tick: game.tick + 1,
            entityId: controlledEntity.id,
            actionId: controller.controllerMap[input]
          });
        }

        // remove the key from the buffer
        buffer.delete(input);
      }
    }
  }

  const processMessage = (message: string) => {
    commandRegexes.forEach(({ regex, callback }) => {
      const match = message.match(regex);
      if (match) callback(match);
    });
  }

  return {
    componentTypeQuery: ["controlled"],
    onTick,
  }
}
