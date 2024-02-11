import { Component } from "@piggo-legends/core";

export type ControllingProps = { entityId: string };

export class Controlling extends Component<"controlling"> {
  // type: "controlling";
  entityId: string;

  constructor(props: ControllingProps) {
    super();
    this.entityId = props.entityId;
  }
}

export class Controlled extends Component<"controlled">{
  // type: "controlled";
  entityId: string;

  constructor(props: ControllingProps) {
    super();
    this.entityId = props.entityId;
  }
}
