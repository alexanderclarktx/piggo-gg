import { Component } from "@piggo-legends/core";

export type ControllerMap = Record<string, string>;

export type ControllerProps = {
  map: ControllerMap;
}

// the Controller component maps inputs to Actions
export class Controller implements Component<"controller"> {
  type: "controller";

  map: ControllerMap;

  constructor(props: ControllerProps) {
    this.map = props.map;
  }
}
