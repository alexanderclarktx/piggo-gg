import { Component } from "@piggo-gg/core";

export type Player = Component<"player"> & {
  name: string
}

export type PlayerProps = { name: string };

export const Player = (props: PlayerProps): Player => ({
  type: "player",
  name: props.name
})
