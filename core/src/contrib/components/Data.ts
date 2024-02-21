import { Component } from "@piggo-legends/core";

export type DataProps = {
  data: Record<string, string | number>
};

export class Data extends Component<"data"> {
  type: "data" = "data";

  constructor(props: DataProps) {
    super();
    this.data = props.data
  }
}
