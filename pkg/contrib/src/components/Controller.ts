import { Component } from "@piggo-legends/core";

export type ControllerMap = Record<string, string>;

// the Controller component maps inputs to Actions
export class Controller implements Component<"controller"> {
  type: "controller";

  active: boolean = false;
  map: ControllerMap;

  constructor(controllerMap: ControllerMap, active: boolean = false) {
    this.map = controllerMap;
    this.active = active;
  }
}
