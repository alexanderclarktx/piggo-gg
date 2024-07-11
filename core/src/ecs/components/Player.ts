import { Component } from "@piggo-gg/core";

export type Player = Component<"player"> & {
  data: { name: string }
}

export const Player = ({ name }: { name: string }): Player => ({
  type: "player",
  data: { name }
})
