import { InvokedAction, Component, Entity, Position, World, XY } from "@piggo-gg/core";

export type InputState = {
  mouse: XY
  entity: Entity
  world: World
}

export type KeyHandler = (_: InputState) => null | InvokedAction<string, {}>
export type JoystickHandler = (_: { entity: Entity<Position>, world: World }) => null | InvokedAction<string, {}>

// "" is always allowed to clear the input buffer
export type InputMap<P extends {}> = {
  press?: Record<string, KeyHandler>
  release?: Record<string, KeyHandler>
  joystick?: JoystickHandler
}

// the Input component maps inputs to Actions
export class Input<P extends {} = {}> extends Component<"input"> {
  type: "input" = "input";
  inputMap: InputMap<P>;

  constructor(inputMap: InputMap<P>) {
    super();
    this.inputMap = inputMap;
  }
}
