import { InvokedAction, Component, Entity, Position } from "@piggo-gg/core";

export type ControllerInput = {
  mouse: { x: number, y: number }
  entity: Entity<Position>
}

// "" is always allowed to clear the input buffer
export type ControllerMap<P extends {}> = {
  keyboard: Record<string, (_: ControllerInput) => null | InvokedAction<string, P>>
  joystick: (_: { entity: Entity<Position> }) => null | InvokedAction<string, P>
}

// the Controller component maps inputs to Actions
export class Controller<P extends {} = {}> extends Component<"controller"> {
  type: "controller" = "controller";
  controllerMap: ControllerMap<P>;

  constructor(controllerMap: ControllerMap<P>) {
    super();
    this.controllerMap = controllerMap;
  }
}
