import { Component, NetworkedComponentData } from "@piggo-gg/core";

export type DataProps = {
  data: NetworkedComponentData
}

export class Data extends Component<"data"> {
  type: "data" = "data";

  constructor(props: DataProps) {
    super();
    this.data = props.data
  }
}
