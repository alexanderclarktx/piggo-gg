import { Component } from "@piggo-gg/core";

export type Name = Component<"name"> & {
  data: { name: string }
}

export const Name = (name: string): Name => ({
  type: "name",
  data: { name }
})
