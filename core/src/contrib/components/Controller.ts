import { InvokedAction, Component } from "@piggo-gg/core";

// "" is always allowed to clear the input buffer
export type ControllerMap<A extends string, P extends {}> = {
  keyboard: Record<string, null | InvokedAction<A, P>>
  joystick?: () => null | InvokedAction<A, P>
}

// the Controller component maps inputs to Actions
export class Controller<A extends string = string, P extends {} = {}> extends Component<"controller"> {
  type: "controller" = "controller";
  controllerMap: ControllerMap<A, P>;

  constructor(controllerMap: ControllerMap<A, P>) {
    super();
    this.controllerMap = controllerMap;
  }
}
