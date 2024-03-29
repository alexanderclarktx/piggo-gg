import { Actions, ClientSystemBuilder, Controlled, Controller, Entity, World, currentJoystickPosition } from "@piggo-gg/core";

export var chatBuffer: string[] = [];
export var chatIsOpen = false;

export const validChatCharacters: Set<string> = new Set("abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()_+-=[]{}\\|;:'\",./<>?`~ ");
export const charactersPreventDefault = new Set(["'", "/", " "]);

// InputSystem handles all keyboard/joystick inputs
export const InputSystem = ClientSystemBuilder({
  id: "InputSystem",
  init: ({ clientPlayerId, world }) => {
    let bufferedDown: Set<string> = new Set([]);
    let bufferedUp: Set<string> = new Set([]);
    let backspaceOn = false;

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
              world.chatHistory.push(world.tick + 1, world.clientPlayerId ?? "", message);
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
        if (entity.components.controlled.data.entityId === clientPlayerId) handleInputForControlledEntity(entity, world);
      });

      // handle buffered backspace
      if (chatIsOpen && backspaceOn && world.tick % 2 === 0) chatBuffer.pop();
    }

    const handleInputForControlledEntity = (controlledEntity: Entity<Controlled | Controller | Actions>, world: World) => {
      // copy the input buffer
      let buffer: Set<string> = new Set(bufferedDown);

      // check for actions
      const { controller, actions } = controlledEntity.components;

      // handle joystick input
      if (currentJoystickPosition.power > 0.1 && controller.controllerMap.joystick) {
        const joystickAction = controller.controllerMap.joystick();
        if (joystickAction) world.actionBuffer.push(world.tick + 1, controlledEntity.id, joystickAction);
      }

      // handle standalone and composite (a,b) input controls
      for (const input in controller.controllerMap.keyboard) {
        if (input.includes(",")) {
          const inputKeys = input.split(",");

          // check for multiple keys pressed at once
          if (inputKeys.every((key) => buffer.has(key))) {
            // run the callback
            const controllerInput = controller.controllerMap.keyboard[input];
            if (controllerInput != null) {
              if (actions.actionMap[controllerInput.action ?? ""]) {
                world.actionBuffer.push(world.tick + 1, controlledEntity.id, controllerInput);
              }
            }

            // remove all keys from the buffer
            inputKeys.forEach((key) => buffer.delete(key));
          }
        } else if (buffer.has(input)) {

          // check for single key pressed
          const controllerInput = controller.controllerMap.keyboard[input];
          if (controllerInput != null) {
            if (actions.actionMap[controllerInput.action ?? ""]) {
              world.actionBuffer.push(world.tick + 1, controlledEntity.id, controllerInput);
            }
          }

          // remove the key from the buffer
          buffer.delete(input);
        }
      }
    }

    return {
      id: "InputSystem",
      query: ["controlled", "controller", "actions"],
      onTick,
      skipOnRollback: true
    }
  }
});
