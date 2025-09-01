import { Character, Client, Component, Entity, InvokedAction, World, XY } from "@piggo-gg/core"

export type InputState = {
  mouse: XY
  aim: XY
  tick?: number
  entity: Entity
  world: World
  client: Client
  character?: Character
  hold: number
  target?: string
}

export type KeyHandler = (_: InputState) => null | InvokedAction<string, {}>
export type JoystickHandler = (_: { character: Character, world: World }) => null | InvokedAction<string, {}>

// "" is always allowed to clear the input buffer
export type InputMap = {
  press: Record<string, KeyHandler>
  release: Record<string, KeyHandler>
  joystick: JoystickHandler
}

export type Input = Component<"input"> & {
  inputMap: InputMap
}

export const Input = (inputMap: Partial<InputMap> = {}): Input => ({
  type: "input",
  inputMap: {
    press: {},
    release: {},
    joystick: () => null,
    ...inputMap
  }
})
