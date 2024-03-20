import { Component } from "@piggo-gg/core";

export type NetworkedProps = {
  isNetworked: boolean
}

export class Networked extends Component<"networked"> {
  type: "networked" = "networked";
  isNetworked: boolean;

  constructor(props: NetworkedProps) {
    super();
    this.isNetworked = props.isNetworked;
  }
}
