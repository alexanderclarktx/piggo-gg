import {
  Actions, Character, ClientSystemBuilder, Entity, Input,
  InvokedAction, World, XY, cos, isTypingEvent, round, sign, sin
} from "@piggo-gg/core"

// handles keyboard/mouse/joystick inputs
export const InputSystem = ClientSystemBuilder({
  id: "InputSystem",
  init: (world) => {
    const renderer = world.renderer
    let { mouse } = world.client!.controls

    const localAim = () => ({ ...world.client!.controls.localAim })

    const validChatCharacters: Set<string> = new Set("abcdefghijklmnopqrstuvwxyz1234567890!@#$%^&*()_+-=[]{}\\|:'\",./<>?`~ ")
    const charactersPreventDefault = new Set(["'", "/", " ", "escape", "tab", "enter", "capslock"])

    let backspace = 0
    let mouseScreen: XY = { x: 0, y: 0 }

    window.addEventListener("wheel", (event) => {
      
      const amount = event.deltaY
      if (amount > 0.5) {
        world.client!.bufferScroll += amount
        world.client?.bufferDown.push({ key: "scrolldown", mouse, aim: localAim(), tick: world.tick, hold: 0 })
      } else {
        world.client!.bufferScroll += amount
        world.client?.bufferDown.push({ key: "scrollup", mouse, aim: localAim(), tick: world.tick, hold: 0 })
      }
    })

    window.addEventListener("pointermove", (event) => {
      if (world.client?.controls.left.active || world.client?.controls.right.active) return

      mouseScreen = { x: event.offsetX, y: event.offsetY }
      if (renderer) mouse = renderer.camera.toWorldCoords(mouseScreen)
      mouseScreen = { x: event.offsetX, y: event.offsetY }

      if (world.three && document.pointerLockElement) {
        world.client?.controls.moveLocal({
          x: event.movementX * 0.001,
          y: event.movementY * 0.001
        })
      }
    })

    document.addEventListener("pointerdown", (event) => {
      if (world.client?.busy) return
      if (world.tick <= world.client!.clickThisFrame.value) return

      mouseScreen = { x: event.offsetX, y: event.offsetY }
      if (renderer) mouse = renderer.camera.toWorldCoords(mouseScreen)
      mouseScreen = { x: event.offsetX, y: event.offsetY }

      // @ts-expect-error
      const target = event.target?.tagName
      if (!["CANVAS", "BODY"].includes(target)) return

      const key = event.button === 0 ? "mb1" : "mb2"

      world.client?.bufferDown.push({ key, mouse, aim: localAim(), tick: world.tick, hold: 0 })
    })

    document.addEventListener("pointerup", (event) => {
      const key = event.button === 0 ? "mb1" : "mb2"

      if (key === "mb1") {
        const pc = world.client?.character()
        if (pc) {
          pc.components.input.inputMap.release[key]?.({
            // @ts-expect-error
            mouse, localAim: localAim(), entity: pc, world, tick: world.tick, hold: 0, target: event.target?.localName ?? ""
          })
          world.client?.bufferDown.remove(key)
          return
        }
      }

      world.client!.bufferDown.remove(key)
      world.client!.bufferUp.push({ key, mouse, aim: localAim(), tick: world.tick, hold: 0 })
    })

    document.addEventListener("keyup", (event: KeyboardEvent) => {
      if (document.hasFocus()) {
        const key = event.key.toLowerCase()

        if (charactersPreventDefault.has(key)) event.preventDefault()

        // handle released backspace
        if (world.client?.chat.isOpen && key === "backspace") backspace = 0

        const down = world.client?.bufferDown.get(key)
        if (!down) return

        if (key === "escape") {
          const pc = world.client?.character()
          if (pc) {
            pc.components.input.inputMap.release[key]?.({
              mouse, aim: localAim(), entity: pc, world, tick: world.tick, hold: down.hold
            })
            return
          }
        }

        // add to bufferUp
        world.client!.bufferUp.push({
          key, mouse, aim: localAim(), tick: world.tick, hold: down.hold
        })

        // remove from bufferedDown
        world.client!.bufferDown.remove(key)
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

        const { isOpen, inputBuffer } = world.client!.chat

        if (isTypingEvent(event)) return

        // add to buffer
        if (!world.client!.bufferDown.get(keyName)) {

          // toggle chat
          if (keyName === "enter" && !isOpen) world.client!.chat.isOpen = true
          else if (isOpen && (keyName === "enter" || keyName === "escape")) {

            // push the message to messages
            if (inputBuffer.length > 0) {
              const message = inputBuffer
              world.messages.push(world.tick + 1, world.client?.playerId() ?? "", message)
            }

            world.client!.chat.inputBuffer = ""
            world.client!.chat.isOpen = false
          }

          // handle backspace
          if (world.client?.chat.isOpen && keyName === "backspace") {
            world.client!.chat.inputBuffer = world.client!.chat.inputBuffer.slice(0, -1)
            backspace = world.tick + 3
          }

          // push to chatBuffer or bufferedDown
          if (world.client?.chat.isOpen && validChatCharacters.has(keyName)) {
            world.client!.chat.inputBuffer += keyName
          } else {
            world.client!.bufferDown.push({ key: keyName, mouse, aim: localAim(), tick: world.tick, hold: 0 })
          }
        }
      }
    })

    const handleInputForCharacter = (character: Character, world: World) => {
      // copy the input buffer
      let buffer = world.client!.bufferDown.copy()
      let bufferUp = world.client!.bufferUp.copy()

      // check for actions
      const { input, actions, position, inventory } = character.components

      const { x, y } = position.data

      // update position.pointing
      if (world.renderer) {
        const angle = Math.atan2(mouse.y - y, mouse.x - x)
        const pointing = round((angle + Math.PI) / (Math.PI / 4)) % 8

        let pointingDelta: XY

        if (world.renderer?.camera.focus) {
          const { width, height } = world.renderer?.wh()
          pointingDelta = {
            x: round(mouseScreen.x - (width / 2), 2),
            y: round(mouseScreen.y - (height / 2), 2)
          }
        } else {
          pointingDelta = {
            x: round(mouse.x - x, 2),
            y: round(mouse.y - (y - position.data.z), 2)
          }
        }

        if (actions.actionMap["point"]) {
          world.actions.push(world.tick + 1, character.id, {
            actionId: "point", playerId: world.client?.playerId(), params: { pointing, pointingDelta, aim: position.data.aim }
          })
        }
      } else if (world.three) {
        if (actions.actionMap["point"]) {
          world.actions.push(world.tick + 1, character.id, {
            actionId: "point", playerId: world.client?.playerId(), params: {
              pointing: 0, pointingDelta: 0, aim: localAim()
            }
          })
        }
      }

      // handle joystick input
      if ((world.client?.controls.left.power ?? 0) > 0.01) {
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
                aim: localAim(),
                entity: character,
                character,
                world,
                hold: keyMouse?.hold ?? 0
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
              aim: localAim(),
              entity: character,
              character,
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

      // handle key releases
      for (const keyUp in input.inputMap.release) {
        const keyMouse = bufferUp.get(keyUp)

        if (keyMouse) {
          const controllerInput = input.inputMap.release[keyUp]
          if (controllerInput != null) {
            const invocation = controllerInput({
              mouse,
              aim: localAim(),
              entity: character,
              tick: world.tick,
              world,
              hold: keyMouse.hold
            })
            if (invocation && actions.actionMap[invocation.actionId]) {
              invocation.playerId = world.client?.playerId()
              world.actions.push(world.tick + 1, character.id, invocation)
            }
          }

          bufferUp.remove(keyUp)
        }
      }

      // handle character inventory
      const activeItem = inventory?.activeItem(world)
      if (activeItem) {
        for (const keyPress of ["mb1", "mb2"]) {
          const keyMouse = buffer.get(keyPress)

          if (keyMouse && activeItem.components.input?.inputMap.press[keyPress]) {
            const invocation = activeItem.components.input?.inputMap.press[keyPress]?.({
              aim: localAim(),
              character,
              entity: activeItem,
              hold: keyMouse.hold,
              mouse: { ...mouse },
              tick: keyMouse.tick,
              world
            })
            if (invocation && activeItem.components.actions.actionMap[invocation.actionId]) {
              world.actions.push(world.tick + 1, activeItem.id, invocation)
            }
          }
        }
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
              aim: localAim(),
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
              aim: localAim(),
              entity,
              world,
              hold: 0
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

    let last = 0

    return {
      id: "InputSystem",
      query: ["input", "actions", "position"],
      priority: 4,
      skipOnRollback: true,
      onRender: () => {
        if (!world.client?.mobile) return

        const { power, angle, active } = world.client.controls.right
        if (!active) {
          last = 0
          return
        }

        const delta = last ? performance.now() - last : performance.now() - active
        last = performance.now()

        world.client?.controls.moveLocal({
          x: power * cos(angle) * delta / 400,
          y: power * sin(angle) * delta / 400
        })
      },
      onTick: (enitities: Entity<Input | Actions>[]) => {
        world.client!.bufferDown.updateHold(world.tick)

        // update mouse position, the camera might have moved
        if (renderer) mouse = renderer?.camera.toWorldCoords(mouseScreen)

        // clear buffer if the window is not focused
        if (!document.hasFocus()) {
          world.client!.bufferDown.clear()
          world.client!.bufferUp.clear()
          return
        }

        // handle character input
        const character = world.client?.character()
        if (character && !world.client?.busy) handleInputForCharacter(character, world)

        // handle buffered backspace
        if (world.client?.chat.isOpen && backspace && (world.tick > backspace) && (world.tick - backspace) % 2 === 0) {
          world.client!.chat.inputBuffer = world.client!.chat.inputBuffer.slice(0, -1)
        }

        // handle UI input (todo why networked ?)
        enitities.forEach((entity) => {
          const { networked } = entity.components
          if (!networked) handleInputForUIEntity(entity, world)
        })

        world.client!.bufferUp.clear()
        world.client!.bufferDown.remove("capslock") // capslock doesn't emit keyup event (TODO bug on windows, have to hit capslock twice)
        world.client!.bufferDown.remove("scrolldown")
        world.client!.bufferDown.remove("scrollup")
      }
    }
  }
})
