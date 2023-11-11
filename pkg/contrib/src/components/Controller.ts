import { Component } from "@piggo-legends/core";

// "" is always allowed; it clears the input buffer
export type ControllerMap<T extends string = string> = Record<string, T | "">

// the Controller component maps inputs to Actions
export class Controller<T extends string = string> implements Component<"controller"> {
  type: "controller";

  map: ControllerMap<T>;

  constructor(map: ControllerMap<T>) {
    this.map = map;
  }
}
