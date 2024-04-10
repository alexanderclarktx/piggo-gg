import { Actions, ClientSystemBuilder, Controlled, Controller, Entity, World, currentJoystickPosition, screenToWorld } from "@piggo-gg/core";

// TODO these are dependencies of Chat
export var chatBuffer: string[] = [];
export var chatIsOpen = false;

type KeyMouse = { key: string, mouse: { x: number, y: number } };

const KeyBuffer = (b?: KeyMouse[]) => {
  let buffer: KeyMouse[] = b ? [...b] : [];

  return {
    contains: (key: string) => buffer.find((b) => b.key === key),
    copy: () => KeyBuffer(buffer),
    push: (km: KeyMouse) => { if (!buffer.find((b) => b.key === km.key)) return buffer.push(km) },
    remove: (key: string) => buffer = buffer.filter((b) => b.key !== key)
  }
}

// InputSystem handles all keyboard/joystick inputs
export const InputSystem = ClientSystemBuilder({
  id: "InputSystem",
  init: ({ clientPlayerId, world, renderer }) => {

    const validChatCharacters: Set<string> = new Set("abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()_+-=[]{}\\|;:'\",./<>?`~ ");
    const charactersPreventDefault = new Set(["'", "/", " "]);

    let bufferedDown = KeyBuffer();
    let backspaceOn = false;
    let mouse = { x: 0, y: 0 };

    renderer?.app.canvas.addEventListener('mousemove', function (event) {
      mouse = screenToWorld(renderer.camera.toWorldCoords({ x: event.offsetX, y: event.offsetY }))
    });

    document.addEventListener("keyup", (event: KeyboardEvent) => {
      if (document.hasFocus()) {
        const keyName = event.key.toLowerCase();

        // handle released backspace
        if (chatIsOpen && keyName === "backspace") backspaceOn = false;

        // remove from bufferedDown and add to bufferedUp
        bufferedDown.remove(keyName);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (document.hasFocus()) {
        const keyName = event.key.toLowerCase();

        // prevent defaults
        if (charactersPreventDefault.has(keyName)) event.preventDefault();

        // add to buffer
        if (!bufferedDown.contains(keyName)) {

          // toggle chat
          if (keyName === "enter" && !chatIsOpen) chatIsOpen = true
          else if (chatIsOpen && (keyName === "enter" || keyName === "escape")) {

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
          (chatIsOpen && validChatCharacters.has(keyName)) ?
            chatBuffer.push(keyName) :
            bufferedDown.push({ key: keyName, mouse });
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
      let buffer = bufferedDown.copy();

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
          if (inputKeys.every((key) => buffer.contains(key))) {
            // run the callback
            const controllerInput = controller.controllerMap.keyboard[input];
            if (controllerInput != null) {
              const invocation = controllerInput(mouse);
              if (invocation && actions.actionMap[invocation.action ?? ""]) {
                world.actionBuffer.push(world.tick + 1, controlledEntity.id, invocation);
              }
            }

            // remove all keys from the buffer
            inputKeys.forEach((key) => buffer.remove(key));
          }
        } else if (buffer.contains(input)) {

          // check for single key pressed
          const controllerInput = controller.controllerMap.keyboard[input];
          if (controllerInput != null) {
            const invocation = controllerInput(mouse);
            if (invocation && actions.actionMap[invocation.action ?? ""]) {
              world.actionBuffer.push(world.tick + 1, controlledEntity.id, invocation);
            }
          }

          // remove the key from the buffer
          buffer.remove(input);
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
