import { Actions, Ball, Controlled, Controller, Entity, Game, Spaceship, SystemBuilder, Zombie, addToLocalCommandBuffer } from "@piggo-legends/core";

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
            game.addEntity(Zombie('zombie-SPAWNED'));
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

  const onTick = (entities: Entity<Controlled | Controller | Actions>[]) => {

    // handle inputs for controlled entities
    entities.forEach((entity) => {
      const controlled = entity.components.controlled;
      if (controlled.data.entityId === thisPlayerId) handleInputForControlledEntity(entity, game);
    });

    // handle buffered backspace
    if (chatIsOpen && backspaceOn && game.tick % 2 === 0) chatBuffer.pop();
  }

  const handleInputForControlledEntity = (controlledEntity: Entity<Controlled | Controller | Actions>, game: Game) => {
    // copy the input buffer
    let buffer: Set<string> = new Set(bufferedDown);

    // check for actions
    const { controller, actions } = controlledEntity.components;

    let didAction = false;

    // handle standalone and composite (a,b) input controls
    for (const input in controller.controllerMap) {
      if (input.includes(",")) {
        const inputKeys = input.split(",");
        if (inputKeys.every((key) => buffer.has(key))) {
          // run the callback
          const controllerInput = controller.controllerMap[input];
          if (controllerInput != null) {
            if (actions.actionMap[controllerInput]) {
              addToLocalCommandBuffer(game.tick, controlledEntity.id, controllerInput);
              didAction = true;
            }
          }

          // remove all keys from the buffer
          inputKeys.forEach((key) => buffer.delete(key));
        }
      } else if (buffer.has(input)) {

        const controllerInput = controller.controllerMap[input];
        if (controllerInput != null) {
          if (actions.actionMap[controllerInput]) {
            addToLocalCommandBuffer(game.tick, controlledEntity.id, controllerInput);
            didAction = true;
          }
        }

        // remove the key from the buffer
        buffer.delete(input);
      }
    }
    if (!didAction) {
      // addToLocalCommandBuffer(game.tick, controlledEntity.id, "");
    }
  }

  const processMessage = (message: string) => {
    commandRegexes.forEach(({ regex, callback }) => {
      const match = message.match(regex);
      if (match) callback(match);
    });
  }

  return {
    componentTypeQuery: ["controlled", "controller", "actions"],
    onTick,
    skipOnRollback: true
  }
}
