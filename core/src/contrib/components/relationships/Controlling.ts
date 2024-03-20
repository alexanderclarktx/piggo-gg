import { Component } from "@piggo-gg/core";

export type ControllingProps = {
  entityId?: string
}

export class Controlling extends Component<"controlling"> {
  type: "controlling" = "controlling";

  override data = {
    entityId: ""
  }

  constructor(props: ControllingProps = {}) {
    super();
    this.data.entityId = props.entityId ?? "";
  }
}

export class Controlled extends Component<"controlled">{
  type: "controlled" = "controlled";
  override data = {
    entityId: ""
  }

  constructor(props: ControllingProps) {
    super();
    this.data.entityId = props.entityId ?? "";
  }
}
