import { Component } from "@piggo-legends/core";

export type NetworkedProps = {
  isNetworked: boolean
}

export class Networked implements Component<"networked"> {
  type: "networked";
  isNetworked: boolean;

  constructor(props: NetworkedProps) {
    this.isNetworked = props.isNetworked;
  }
}
