import { Character, Component, Entity, InvokedAction, Mouse, World } from "@piggo-gg/core"

export type InputState = {
  mouse: Mouse
  tick?: number
  entity: Entity
  world: World
  character?: Character
  // entity: string
  // character?: string
  hold: boolean
}

export type KeyHandler = (_: InputState) => null | InvokedAction<string, {}>
export type JoystickHandler = (_: { character: Character, world: World }) => null | InvokedAction<string, {}>

// "" is always allowed to clear the input buffer
export type InputMap = {
  press?: Record<string, KeyHandler>
  release?: Record<string, KeyHandler>
  joystick?: JoystickHandler
}

export type Input = Component<"input"> & {
  inputMap: InputMap
}

export const Input = (inputMap: InputMap): Input => ({
  type: "input",
  inputMap
})
