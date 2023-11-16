import { Component } from "@piggo-legends/core";

export type ControllingProps = { entityId: string };

export class Controlling implements Component<"controlling"> {
  type: "controlling";
  entityId: string;

  constructor(props: ControllingProps) {
    this.entityId = props.entityId;
  }
}

export class Controlled implements Component<"controlled">{
  type: "controlled";
  entityId: string;

  constructor(props: ControllingProps) {
    this.entityId = props.entityId;
  }
}
