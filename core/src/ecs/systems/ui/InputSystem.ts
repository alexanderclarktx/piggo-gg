import {
  Actions, Character, ClientSystemBuilder, CurrentJoystickPosition, Entity,
  Input, InvokedAction, World, XY, XYdifferent, clickableClickedThisFrame, round
} from "@piggo-gg/core";

export type Mouse = XY & { hold: boolean };

export var chatBuffer: string[] = [];
export var chatIsOpen = false;
export var mouse: Mouse = { x: 0, y: 0, hold: false };

export type KeyMouse = { key: string, mouse: Mouse, tick: number };

const KeyBuffer = (b?: KeyMouse[]) => {
  let buffer: KeyMouse[] = b ? [...b] : [];

  return {
    get: (key: string) => buffer.find((b) => b.key === key),
    copy: () => KeyBuffer(buffer),
    clear: () => buffer = [],
    push: (km: KeyMouse) => { if (!buffer.find((b) => b.key === km.key)) return buffer.push(km) },
    remove: (key: string) => buffer = buffer.filter((b) => b.key !== key),
  }
}

// InputSystem handles keyboard/mouse/joystick inputs
export const InputSystem = ClientSystemBuilder({
  id: "InputSystem",
  init: (world) => {
    if (!world.renderer) return undefined;

    const renderer = world.renderer;

    const validChatCharacters: Set<string> = new Set("abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()_+-=[]{}\\|;:'\",./<>?`~ ");
    const charactersPreventDefault = new Set(["'", "/", " ", "escape", "tab", "enter", "capslock"]);

    const bufferedDown = KeyBuffer();
    const bufferedUp = KeyBuffer();

    let backspaceOn = false;
    let joystickOn = false;
    let mouseEvent: XY = { x: 0, y: 0 };

    renderer?.app.canvas.addEventListener("pointermove", (event) => {
      if (CurrentJoystickPosition.active && XYdifferent(mouseEvent, { x: event.offsetX, y: event.offsetY }, 100)) return;

      mouseEvent = { x: event.offsetX, y: event.offsetY };
      mouse = { hold: mouse.hold, ...renderer.camera.toWorldCoords(mouseEvent) }
    });

    renderer?.app.canvas.addEventListener("pointerdown", (event) => {
      if (!joystickOn && CurrentJoystickPosition.active) return;
      if (world.tick <= clickableClickedThisFrame.value) return;

      mouseEvent = { x: event.offsetX, y: event.offsetY };
      mouse = { hold: false, ...renderer.camera.toWorldCoords(mouseEvent) }

      if (CurrentJoystickPosition.active && !joystickOn) {
        joystickOn = true;
        return;
      }

      const key = event.button === 0 ? "mb1" : "mb2";

      bufferedDown.push({ key, mouse, tick: world.tick });
    });

    document.addEventListener("pointerup", (event) => {
      const key = event.button === 0 ? "mb1" : "mb2";

      if (key === "mb1" && joystickOn && !CurrentJoystickPosition.active) return;

      bufferedDown.remove(key);
    });

    document.addEventListener("keyup", (event: KeyboardEvent) => {
      if (document.hasFocus()) {
        const keyName = event.key.toLowerCase();

        if (charactersPreventDefault.has(keyName)) event.preventDefault();

        // handle released backspace
        if (chatIsOpen && keyName === "backspace") backspaceOn = false;

        // remove from bufferedDown and add to bufferedUp
        bufferedDown.remove(keyName);
        bufferedUp.push({ key: keyName, mouse, tick: world.tick });
      }
    });

    document.addEventListener("keypress", (event) => {
      if (document.hasFocus() && (charactersPreventDefault.has(event.key))) {
        event.preventDefault();
      }
    })

    document.addEventListener("keydown", (event) => {
      if (document.hasFocus()) {
        const keyName = event.key.toLowerCase();

        // ignore noisy capslock events
        if (keyName === "capslock" && !event.getModifierState("CapsLock")) return;

        // prevent defaults
        if (charactersPreventDefault.has(keyName)) event.preventDefault();

        // add to buffer
        if (!bufferedDown.get(keyName)) {

          // toggle chat
          if (keyName === "enter" && !chatIsOpen) chatIsOpen = true
          else if (chatIsOpen && (keyName === "enter" || keyName === "escape")) {

            // push the message to chatHistory
            if (chatBuffer.length > 0) {
              const message = chatBuffer.join("");
              world.chatHistory.push(world.tick + 1, world.client?.playerId() ?? "", message);
            }

            chatBuffer = [];
            chatIsOpen = false;
          }

          // handle backspace
          if (chatIsOpen && keyName === "backspace") backspaceOn = true;

          // push to chatBuffer or bufferedDown
          (chatIsOpen && validChatCharacters.has(keyName)) ?
            chatBuffer.push(keyName) :
            bufferedDown.push({ key: keyName, mouse, tick: world.tick });
        }
      }
    });

    const handleInputForCharacter = (character: Character, world: World) => {
      // copy the input buffer
      let buffer = bufferedDown.copy();

      // check for actions
      const { input, actions, position, inventory } = character.components;

      // update Position.pointing based on mouse
      const angle = Math.atan2(mouse.y - position.data.y, mouse.x - position.data.x);
      const pointing = round((angle + Math.PI) / (Math.PI / 4)) % 8;

      world.actionBuffer.push(world.tick + 1, character.id,
        { action: "point", playerId: world.client?.playerId(), params: { pointing } }
      );

      // handle joystick input
      if (CurrentJoystickPosition.power > 0.1 && input.inputMap.joystick) {
        const joystickAction = input.inputMap.joystick({ character, world });
        if (joystickAction) world.actionBuffer.push(world.tick + 1, character.id, joystickAction);
      }

      // handle standalone and composite (a,b) input controls
      for (const keyPress in input.inputMap.press) {
        const keyMouse = buffer.get(keyPress);
        if (keyPress.includes(",")) {
          const inputKeys = keyPress.split(",");

          // check for multiple keys pressed at once
          if (inputKeys.every((key) => buffer.get(key))) {

            // run the callback
            const controllerInput = input.inputMap.press[keyPress];
            if (controllerInput != null) {
              const invocation = controllerInput({ mouse: { ...mouse }, entity: character, world });
              if (invocation && actions.actionMap[invocation.action ?? ""]) {
                world.actionBuffer.push(world.tick + 1, character.id, invocation);
              }
            }

            // remove each key from the buffer
            inputKeys.forEach((key) => buffer.remove(key));
          }
        } else if (keyMouse) {

          // check for single key pressed
          const controllerInput = input.inputMap.press[keyPress];
          if (controllerInput != null) {
            const invocation = controllerInput({ mouse: { ...mouse }, entity: character, world, tick: keyMouse.tick });
            if (invocation && actions.actionMap[invocation.action ?? ""]) {
              world.actionBuffer.push(world.tick + 1, character.id, invocation);
            }
          }

          // remove the key from the buffer
          buffer.remove(keyPress);
        }
      }

      if (inventory && inventory.activeItem) {
        const mb1 = buffer.get("mb1")
        if (mb1) {
          const invocation: InvokedAction = {
            action: "mb1",
            playerId: world.client?.playerId(),
            entityId: inventory.activeItem.id,
            params: { mouse: mb1.mouse, world, tick: mb1.tick, character }
          }
          world.actionBuffer.push(world.tick + 1, inventory.activeItem.id, invocation)
        }
      }
    }

    const handleInputForUIEntity = (entity: Entity<Input | Actions>, world: World) => {
      // copy the input buffer
      let bufferDown = bufferedDown.copy();
      let bufferUp = bufferedUp.copy()

      // check for actions
      const { input, actions } = entity.components;

      for (const inputKey in input.inputMap.press) {
        const keyMouse = bufferDown.get(inputKey);
        if (keyMouse) {

          // ignore stale inputs
          if (keyMouse.tick + 1 != world.tick) continue;

          // find the callback
          const controllerInput = input.inputMap.press[inputKey];
          if (controllerInput != null) {
            const invocation = controllerInput({ mouse, entity, world, tick: keyMouse.tick });
            if (invocation && actions.actionMap[invocation.action ?? ""]) {
              world.actionBuffer.push(world.tick, entity.id, invocation);
            }
          }

          // remove the key from the buffer
          bufferDown.remove(inputKey);
        }
      }

      for (const keyUp in input.inputMap.release) {
        if (bufferUp.get(keyUp)) {
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
        if (renderer) mouse = { hold: mouse.hold, ...renderer.camera.toWorldCoords(mouseEvent) }

        // clear buffer if the window is not focused
        if (!document.hasFocus()) {
          bufferedDown.clear();
          bufferedUp.clear();
          return;
        }

        const character = world.client?.playerEntity.components.controlling.getControlledEntity(world);
        if (!character) return;

        if (world.tick > clickableClickedThisFrame.value) {
          handleInputForCharacter(character, world);
        }

        // handle buffered backspace
        if (chatIsOpen && backspaceOn && world.tick % 2 === 0) chatBuffer.pop();

        enitities.forEach((entity) => {
          const { networked } = entity.components;
          if (!networked) handleInputForUIEntity(entity, world);
        })

        bufferedUp.clear();
        bufferedDown.remove("capslock"); // capslock doesn't emit keyup event (TODO bug on windows, have to hit capslock twice)

        if (bufferedDown.get("mb2") || bufferedDown.get("mb1")) {
          mouse.hold = true;
        }

        joystickOn = CurrentJoystickPosition.active;
      }
    }
  }
});
