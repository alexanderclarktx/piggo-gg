import { Actions, ClientSystemBuilder, Input, Entity, Position, World, currentJoystickPosition, XY } from "@piggo-gg/core";

// TODO these are global dependencies
export var chatBuffer: string[] = [];
export var chatIsOpen = false;
export var mouse = { x: 0, y: 0 };

type KeyMouse = { key: string, mouse: XY };

const KeyBuffer = (b?: KeyMouse[]) => {
  let buffer: KeyMouse[] = b ? [...b] : [];

  return {
    contains: (key: string) => buffer.find((b) => b.key === key),
    copy: () => KeyBuffer(buffer),
    clear: () => buffer = [],
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
    let bufferedUp = KeyBuffer();
    let backspaceOn = false;
    let joystickOn = false;
    let mouseEvent = { x: 0, y: 0 };

    renderer?.app.canvas.addEventListener('mousemove', (event) => {
      mouseEvent = { x: event.offsetX, y: event.offsetY };
      mouse = renderer.camera.toWorldCoords({ x: event.offsetX, y: event.offsetY })
    });

    renderer?.app.canvas.addEventListener('pointerdown', (event) => {
      const key = event.button === 0 ? "mb1" : "mb2";

      mouseEvent = { x: event.offsetX, y: event.offsetY };
      mouse = renderer.camera.toWorldCoords({ x: event.offsetX, y: event.offsetY })

      if (!currentJoystickPosition.active && joystickOn) joystickOn = false;
      if (currentJoystickPosition.active && !joystickOn) {
        joystickOn = true;
        return;
      }

      bufferedDown.push({ key, mouse });
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
        bufferedUp.push({ key: keyName, mouse });
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

    const handleInputForCharacterEntity = (entity: Entity<Input | Actions | Position>, world: World) => {
      // copy the input buffer
      let buffer = bufferedDown.copy();

      // check for actions
      const { input, actions } = entity.components;

      // handle joystick input
      if (currentJoystickPosition.power > 0.1 && input.inputMap.joystick) {
        const joystickAction = input.inputMap.joystick({ entity, world });
        if (joystickAction) world.actionBuffer.push(world.tick + 1, entity.id, joystickAction);
      }

      // handle standalone and composite (a,b) input controls
      for (const keyPress in input.inputMap.press) {
        if (keyPress.includes(",")) {
          const inputKeys = keyPress.split(",");

          // check for multiple keys pressed at once
          if (inputKeys.every((key) => buffer.contains(key))) {

            // run the callback
            const controllerInput = input.inputMap.press[keyPress];
            if (controllerInput != null) {
              const invocation = controllerInput({ mouse, entity, world });
              if (invocation && actions.actionMap[invocation.action ?? ""]) {
                world.actionBuffer.push(world.tick + 1, entity.id, invocation);
              }
            }

            // remove all keys from the buffer
            inputKeys.forEach((key) => buffer.remove(key));
          }
        } else if (buffer.contains(keyPress)) {

          // check for single key pressed
          const controllerInput = input.inputMap.press[keyPress];
          if (controllerInput != null) {
            const invocation = controllerInput({ mouse, entity, world });
            if (invocation && actions.actionMap[invocation.action ?? ""]) {
              world.actionBuffer.push(world.tick + 1, entity.id, invocation);
            }
          }

          // remove the key from the buffer
          buffer.remove(keyPress);
        }
      }
    }

    const handleInputForUIEntity = (entity: Entity<Input | Actions>, world: World) => {
      // copy the input buffer
      let bufferDown = bufferedDown.copy();
      let bufferUp = bufferedUp.copy()

      // check for actions
      const { input, actions } = entity.components;

      for (const keyPress in input.inputMap.press) {
        if (bufferDown.contains(keyPress)) {
          const controllerInput = input.inputMap.press[keyPress];
          if (controllerInput != null) {
            const invocation = controllerInput({ mouse, entity, world });
            if (invocation && actions.actionMap[invocation.action ?? ""]) {
              world.actionBuffer.push(world.tick, entity.id, invocation);
            }
          }

          // remove the key from the buffer
          bufferDown.remove(keyPress);
        }
      }

      for (const keyUp in input.inputMap.release) {
        if (bufferUp.contains(keyUp)) {
          const controllerInput = input.inputMap.release[keyUp];
          if (controllerInput != null) {
            const invocation = controllerInput({ mouse, entity, world });
            if (invocation && actions.actionMap[invocation.action ?? ""]) {
              world.actionBuffer.push(world.tick, entity.id, invocation);
            }
          }

          // remove the key from the buffer
          bufferUp.remove(keyUp);
        }
      }
    }

    return {
      id: "InputSystem",
      query: ["input", "actions"],
      skipOnRollback: true,
      onTick: (enitities: Entity<Input | Actions>[]) => {
        // update mouse position, the camera might have moved
        if (renderer) mouse = renderer.camera.toWorldCoords(mouseEvent);

        const playerEntity = world.client?.playerEntity;
        if (!playerEntity) return;

        const controlledEntity = world.entities[playerEntity.components.controlling.data.entityId] as Entity<Input | Actions | Position>;
        if (!controlledEntity) return;

        handleInputForCharacterEntity(controlledEntity, world);

        // handle buffered backspace
        if (chatIsOpen && backspaceOn && world.tick % 2 === 0) chatBuffer.pop();

        enitities.forEach((entity) => {
          const { networked } = entity.components;

          if (!networked) {
            handleInputForUIEntity(entity, world);
          }
        })

        bufferedUp.clear();
      }
    }
  }
});
