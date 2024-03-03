import { Component } from "@piggo-gg/core";

// "" is always allowed to clear the input buffer
export type ControllerMap<T extends string = string> = Record<string, T | null>

// the Controller component maps inputs to Actions
export class Controller<T extends string = string> extends Component<"controller"> {
  type: "controller" = "controller";
  controllerMap: ControllerMap<T>;

  constructor(controllerMap: ControllerMap<T>) {
    super();
    this.controllerMap = controllerMap;
  }
}
