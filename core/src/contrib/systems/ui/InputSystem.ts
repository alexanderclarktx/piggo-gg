import { Actions, ClientSystemBuilder, Controlled, Controller, Entity, World, currentJoystickPosition } from "@piggo-gg/core";

// TODO these are global dependencies
export var chatBuffer: string[] = [];
export var chatIsOpen = false;
export var mouse = { x: 0, y: 0 };

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
  init: ({ world }) => {
    if (!world.renderer) return undefined;

    const renderer = world.renderer;

    const validChatCharacters: Set<string> = new Set("abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()_+-=[]{}\\|;:'\",./<>?`~ ");
    const charactersPreventDefault = new Set(["'", "/", " ", "escape", "tab", "enter"]);

    let bufferedDown = KeyBuffer();
    let backspaceOn = false;
    let mouseEvent = { x: 0, y: 0 };

    renderer?.app.canvas.addEventListener('mousemove', (event) => {
      mouseEvent = { x: event.offsetX, y: event.offsetY };
      mouse = renderer.camera.toWorldCoords({ x: event.offsetX, y: event.offsetY })
    });

    renderer?.app.canvas.addEventListener('pointerdown', (event) => {
      const key = event.button === 0 ? "mb1" : "mb2";

      mouseEvent = { x: event.offsetX, y: event.offsetY };
      mouse = renderer.camera.toWorldCoords({ x: event.offsetX, y: event.offsetY })
      if (!currentJoystickPosition.active) bufferedDown.push({ key, mouse });
    });

    renderer?.app.canvas.addEventListener('pointerup', (event) => {
      const key = event.button === 0 ? "mb1" : "mb2";
      bufferedDown.remove(key);
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
              world.chatHistory.push(world.tick + 1, world.client?.playerId ?? "", message);
            }

            chatBuffer = [];
            chatIsOpen = false;
          }

          // handle backspace
          if (chatIsOpen && keyName === "backspace") backspaceOn = true;

          // push to chatBuffer or bufferedDown
          (chatIsOpen && validChatCharacters.has(keyName)) ?
            chatBuffer.push(event.key) :
            bufferedDown.push({ key: keyName, mouse });
        }
      }
    });

    const handleInputForEntity = (entity: Entity<Controlled | Controller | Actions>, world: World) => {
      // copy the input buffer
      let buffer = bufferedDown.copy();

      // check for actions
      const { controller, actions } = entity.components;

      // handle joystick input
      if (currentJoystickPosition.power > 0.1 && controller.controllerMap.joystick) {
        const joystickAction = controller.controllerMap.joystick();
        if (joystickAction) world.actionBuffer.push(world.tick + 1, entity.id, joystickAction);
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
              const invocation = controllerInput({ mouse, entity });
              if (invocation && actions.actionMap[invocation.action ?? ""]) {
                world.actionBuffer.push(world.tick + 1, entity.id, invocation);
              }
            }

            // remove all keys from the buffer
            inputKeys.forEach((key) => buffer.remove(key));
          }
        } else if (buffer.contains(input)) {

          // check for single key pressed
          const controllerInput = controller.controllerMap.keyboard[input];
          if (controllerInput != null) {
            const invocation = controllerInput({ mouse, entity });
            if (invocation && actions.actionMap[invocation.action ?? ""]) {
              world.actionBuffer.push(world.tick + 1, entity.id, invocation);
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
      skipOnRollback: true,
      onTick: (entities: Entity<Controlled | Controller | Actions>[]) => {
        // update mouse position, the camera might have moved
        if (renderer) mouse = renderer.camera.toWorldCoords(mouseEvent);
  
        // handle inputs for controlled entities
        entities.forEach((entity) => {
          if (entity.components.controlled.data.entityId === world.client?.playerId) handleInputForEntity(entity, world);
        });
  
        // handle buffered backspace
        if (chatIsOpen && backspaceOn && world.tick % 2 === 0) chatBuffer.pop();
      }
    }
  }
});
