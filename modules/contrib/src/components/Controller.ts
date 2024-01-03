import { Component } from "@piggo-legends/core";

// "" is always allowed to clear the input buffer
export type ControllerMap<T extends string = string> = Record<string, T | "">

// the Controller component maps inputs to Actions
export class Controller<T extends string = string> implements Component<"controller"> {
  type: "controller";

  controllerMap: ControllerMap<T>;

  constructor(controllerMap: ControllerMap<T>) {
    this.controllerMap = controllerMap;
  }
}
