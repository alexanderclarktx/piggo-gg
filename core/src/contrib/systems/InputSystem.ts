import { Actions, Ball, Controlled, Controller, Entity, World, Spaceship, SystemBuilder, Zombie } from "@piggo-legends/core";

export var chatBuffer: string[] = [];
export var chatHistory: string[] = [];
export var chatIsOpen = false;

export const validChatCharacters: Set<string> = new Set("abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()_+-=[]{}\\|;:'\",./<>?`~ ");
export const charactersPreventDefault = new Set(["'", "/", " "]);

// InputSystem handles all keyboard inputs
export const InputSystem: SystemBuilder = ({ clientPlayerId, world }) => {
  let bufferedDown: Set<string> = new Set([]);
  let bufferedUp: Set<string> = new Set([]);
  let backspaceOn = false;

  // TODO this should be handled separately to make it work in netcode
  let actionRegexes: { regex: RegExp, callback: (match: RegExpMatchArray) => Promise<void> }[] = [
    {
      regex: new RegExp(`/spawn (\\w+)`),
      callback: async (match: RegExpMatchArray) => {
        switch (match[1]) {
          case "spaceship":
            world.addEntity(await Spaceship());
            break;
          case "ball":
            world.addEntity(Ball());
            break;
          case "zombie":
            world.addEntity(Zombie({ id: 'zombie-SPAWNED' }));
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
      if (world.actionBuffer.buffer[world.tick + 1][entity.id]) {
        console.log("skip duplicate input");
        return;
      }
      if (controlled.data.entityId === clientPlayerId) handleInputForControlledEntity(entity, world);
    });

    // handle buffered backspace
    if (chatIsOpen && backspaceOn && world.tick % 2 === 0) chatBuffer.pop();
  }

  const handleInputForControlledEntity = (controlledEntity: Entity<Controlled | Controller | Actions>, world: World) => {
    // copy the input buffer
    let buffer: Set<string> = new Set(bufferedDown);

    // check for actions
    const { controller, actions } = controlledEntity.components;

    // handle standalone and composite (a,b) input controls
    for (const input in controller.controllerMap) {
      if (input.includes(",")) {
        const inputKeys = input.split(",");

        // check for multiple keys pressed at once
        if (inputKeys.every((key) => buffer.has(key))) {
          // run the callback
          const controllerInput = controller.controllerMap[input];
          if (controllerInput != null) {
            if (actions.actionMap[controllerInput]) {
              world.actionBuffer.addAction(world.tick, controlledEntity.id, controllerInput);
            }
          }

          // remove all keys from the buffer
          inputKeys.forEach((key) => buffer.delete(key));
        }
      } else if (buffer.has(input)) {

        // check for single key pressed
        const controllerInput = controller.controllerMap[input];
        if (controllerInput != null) {
          if (actions.actionMap[controllerInput]) {
            world.actionBuffer.addAction(world.tick, controlledEntity.id, controllerInput);
          }
        }

        // remove the key from the buffer
        buffer.delete(input);
      }
    }
  }

  const processMessage = (message: string) => {
    actionRegexes.forEach(({ regex, callback }) => {
      const match = message.match(regex);
      if (match) callback(match);
    });
  }

  return {
    id: "InputSystem",
    query: ["controlled", "controller", "actions"],
    onTick,
    skipOnRollback: true
  }
}
