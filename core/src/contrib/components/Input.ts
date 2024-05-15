import { InvokedAction, Component, Entity, Position, World } from "@piggo-gg/core";

export type InputState = {
  mouse: { x: number, y: number }
  entity: Entity<Position>
  world: World
}

// "" is always allowed to clear the input buffer
export type InputMap<P extends {}> = {
  keyboard: Record<string, (_: InputState) => null | InvokedAction<string, P>>
  joystick: (_: { entity: Entity<Position>, world: World }) => null | InvokedAction<string, P>
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
