import {
  Actions, Character, ClientSystemBuilder, CurrentJoystickPosition,
  Entity, Input, InvokedAction, World, XY, XYdiff, round
} from "@piggo-gg/core"

export var chatBuffer: string[] = []
export var chatIsOpen = false
export var mouse: XY = { x: 0, y: 0 }
export var mouseScreen: XY = { x: 0, y: 0 }

// InputSystem handles keyboard/mouse/joystick inputs
export const InputSystem = ClientSystemBuilder({
  id: "InputSystem",
  init: (world) => {
    const renderer = world.renderer

    const validChatCharacters: Set<string> = new Set("abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()_+-=[]{}\\|:'\",./<>?`~ ")
    const charactersPreventDefault = new Set(["'", "/", " ", "escape", "tab", "enter", "capslock"])

    let backspaceOn = false
    let joystickOn = false
    let mouseScreen: XY = { x: 0, y: 0 }

    renderer?.app.canvas.addEventListener("pointermove", (event) => {
      if (CurrentJoystickPosition.active && XYdiff(mouseScreen, { x: event.offsetX, y: event.offsetY }, 100)) return

      mouseScreen = { x: event.offsetX, y: event.offsetY }
      mouse = renderer.camera.toWorldCoords(mouseScreen)
      mouseScreen = { x: event.offsetX, y: event.offsetY }
    })

    renderer?.app.canvas.addEventListener("pointerdown", (event) => {
      if (!joystickOn && CurrentJoystickPosition.active) return
      if (world.tick <= world.client!.clickThisFrame.value) return

      mouseScreen = { x: event.offsetX, y: event.offsetY }
      mouse = renderer.camera.toWorldCoords(mouseScreen)
      mouseScreen = { x: event.offsetX, y: event.offsetY }

      if (CurrentJoystickPosition.active && !joystickOn) {
        joystickOn = true
        return
      }

      const key = event.button === 0 ? "mb1" : "mb2"

      world.client!.bufferDown.push({ key, mouse, tick: world.tick, hold: false })
    })

    document.addEventListener("pointerup", (event) => {
      const key = event.button === 0 ? "mb1" : "mb2"

      if (key === "mb1" && joystickOn && !CurrentJoystickPosition.active) return

      world.client!.bufferDown.remove(key)
      world.client!.bufferUp.push({ key, mouse, tick: world.tick, hold: false })
    })

    document.addEventListener("keyup", (event: KeyboardEvent) => {
      if (document.hasFocus()) {
        const keyName = event.key.toLowerCase()

        if (charactersPreventDefault.has(keyName)) event.preventDefault()

        // handle released backspace
        if (chatIsOpen && keyName === "backspace") backspaceOn = false

        // remove from bufferedDown and add to bufferedUp
        world.client!.bufferDown.remove(keyName)
        world.client!.bufferUp.push({ key: keyName, mouse, tick: world.tick, hold: false })
      }
    })

    document.addEventListener("keypress", (event) => {
      if (document.hasFocus() && (charactersPreventDefault.has(event.key))) {
        event.preventDefault()
      }
    })

    document.addEventListener("keydown", (event) => {
      if (document.hasFocus()) {
        const keyName = event.key.toLowerCase()

        // ignore noisy capslock events
        if (keyName === "capslock" && !event.getModifierState("CapsLock")) return

        // prevent defaults
        if (charactersPreventDefault.has(keyName)) event.preventDefault()

        // add to buffer
        if (!world.client!.bufferDown.get(keyName)) {

          // toggle chat
          if (keyName === "enter" && !chatIsOpen) chatIsOpen = true
          else if (chatIsOpen && (keyName === "enter" || keyName === "escape")) {

            // push the message to messages
            if (chatBuffer.length > 0) {
              const message = chatBuffer.join("")
              world.messages.push(world.tick + 1, world.client?.playerId() ?? "", message)
            }

            chatBuffer = []
            chatIsOpen = false
          }

          // handle backspace
          if (chatIsOpen && keyName === "backspace") backspaceOn = true

          // push to chatBuffer or bufferedDown
          if (chatIsOpen && validChatCharacters.has(keyName)) {
            chatBuffer.push(keyName)
          } else {
            world.client!.bufferDown.push({ key: keyName, mouse, tick: world.tick, hold: false })
          }
        }
      }
    })

    const handleInputForCharacter = (character: Character, world: World) => {
      // copy the input buffer
      let buffer = world.client!.bufferDown.copy()

      // check for actions
      const { input, actions, position, inventory } = character.components

      const rotated = world.flip({ x: position.data.x, y: position.data.y })

      // update Position.pointing based on mouse
      const angle = Math.atan2(mouse.y - rotated.y, mouse.x - rotated.x)
      const pointing = round((angle + Math.PI) / (Math.PI / 4)) % 8

      let pointingDelta: XY

      if (world.renderer?.camera.focus) {
        const { width, height } = world.renderer.wh()
        pointingDelta = {
          x: round(mouseScreen.x - (width / 2), 2) * world.flipped(),
          y: round(mouseScreen.y - (height / 2), 2) * world.flipped()
        }
      } else {
        pointingDelta = {
          x: round(mouse.x - rotated.x, 2) * world.flipped(),
          y: round(mouse.y - (rotated.y - position.data.z), 2) * world.flipped()
        }
      }

      if (actions.actionMap["point"]) {
        world.actions.push(world.tick + 1, character.id,
          { actionId: "point", playerId: world.client?.playerId(), params: { pointing, pointingDelta } }
        )
      }

      // handle joystick input
      if (CurrentJoystickPosition.power > 0.1 && input.inputMap.joystick) {
        const joystickAction = input.inputMap.joystick({ character, world })
        if (joystickAction) world.actions.push(world.tick + 1, character.id, joystickAction)
      }

      // handle standalone and composite (a,b) input controls
      for (const keyPress in input.inputMap.press) {
        const keyMouse = buffer.get(keyPress)
        if (keyPress.includes(",")) {
          const inputKeys = keyPress.split(",")

          // check for multiple keys pressed at once
          if (inputKeys.every((key) => buffer.get(key))) {

            // run the callback
            const controllerInput = input.inputMap.press[keyPress]
            if (controllerInput != null) {
              const invocation = controllerInput({
                mouse: { ...mouse },
                entity: character,
                world,
                hold: keyMouse?.hold || false
              })
              if (invocation && actions.actionMap[invocation.actionId]) {
                invocation.playerId = world.client?.playerId()
                world.actions.push(world.tick + 1, character.id, invocation)
              }
            }

            // remove each key from the buffer
            inputKeys.forEach((key) => buffer.remove(key))
          }
        } else if (keyMouse) {

          // check for single key pressed
          const controllerInput = input.inputMap.press[keyPress]
          if (controllerInput) {
            const invocation = controllerInput({
              mouse: { ...mouse },
              entity: character,
              world,
              tick: keyMouse.tick,
              hold: keyMouse.hold
            })
            if (invocation && actions.actionMap[invocation.actionId]) {
              invocation.playerId = world.client?.playerId()
              world.actions.push(world.tick + 1, character.id, invocation)
            }
          }

          // remove the key from the buffer
          buffer.remove(keyPress)
        }
      }

      // handle character inventory
      const activeItem = inventory?.activeItem(world)
      if (activeItem) {
        ["mb1", "mb2"].forEach((keyPress) => {

          const keyMouse = buffer.get(keyPress)

          if (keyMouse && activeItem.components.actions.actionMap[keyPress]) {
            const invocation: InvokedAction = {
              actionId: keyPress,
              playerId: world.client?.playerId(),
              entityId: activeItem.id,
              params: {
                mouse: { ...mouse },
                entity: activeItem.id,
                tick: keyMouse.tick,
                character: character.id,
                hold: keyMouse.hold
              }
            }
            if (invocation && activeItem.components.actions.actionMap[invocation.actionId]) {
              world.actions.push(world.tick + 1, activeItem.id, invocation)
            }
          }
        })
      }
    }

    const handleInputForUIEntity = (entity: Entity<Input | Actions>, world: World) => {
      // copy the input buffer
      let bufferDown = world.client!.bufferDown.copy()
      let bufferUp = world.client!.bufferUp.copy()

      // check for actions
      const { input, actions } = entity.components

      for (const inputKey in input.inputMap.press) {
        const keyMouse = bufferDown.get(inputKey)
        if (keyMouse) {

          // invoke the callback
          const controllerInput = input.inputMap.press[inputKey]
          if (controllerInput != null) {
            const invocation = controllerInput({
              mouse,
              entity,
              world,
              tick: keyMouse.tick,
              hold: keyMouse.hold
            })
            if (invocation && actions.actionMap[invocation.actionId]) {
              invocation.playerId = world.client?.playerId()
              if (invocation.offline) {
                world.actions.push(world.tick, entity.id, invocation)
              } else {
                world.actions.push(world.tick + 1, entity.id, invocation)
              }
            }
          }

          bufferDown.remove(inputKey)
        }
      }

      for (const keyUp in input.inputMap.release) {

        if (bufferUp.get(keyUp)) {
          const controllerInput = input.inputMap.release[keyUp]
          if (controllerInput != null) {
            const invocation = controllerInput({
              mouse,
              entity,
              world,
              hold: false
            })
            if (invocation && actions.actionMap[invocation.actionId]) {
              invocation.playerId = world.client?.playerId()
              world.actions.push(world.tick + 1, entity.id, invocation)
            }
          }

          bufferUp.remove(keyUp)
        }
      }
    }

    return {
      id: "InputSystem",
      query: ["input", "actions", "position"],
      priority: 4,
      skipOnRollback: true,
      onTick: (enitities: Entity<Input | Actions>[]) => {
        world.client!.bufferDown.updateHold(world.tick)

        // update mouse position, the camera might have moved
        if (renderer) mouse = renderer.camera.toWorldCoords(mouseScreen)

        // clear buffer if the window is not focused
        if (!document.hasFocus()) {
          world.client!.bufferDown.clear()
          world.client!.bufferUp.clear()
          return
        }

        // handle character input
        const character = world.client?.player.components.controlling.getCharacter(world)
        if (character && world.tick > world.client!.clickThisFrame.value) {
          handleInputForCharacter(character, world)
        }

        // handle buffered backspace
        if (chatIsOpen && backspaceOn && world.tick % 2 === 0) chatBuffer.pop()

        // handle UI input
        enitities.forEach((entity) => {
          const { networked } = entity.components
          if (!networked) handleInputForUIEntity(entity, world)
        })

        world.client!.bufferUp.clear()
        world.client!.bufferDown.remove("capslock") // capslock doesn't emit keyup event (TODO bug on windows, have to hit capslock twice)

        joystickOn = CurrentJoystickPosition.active
      }
    }
  }
})
