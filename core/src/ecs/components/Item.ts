import { Actions, Component, Effects, Entity, Renderable, Position } from "@piggo-gg/core";

export type Item = Component<"item"> & {
  name: string
  dropped: boolean
  equipped: boolean
  stackable: boolean
}

export type ItemProps = {
  name: string
  dropped?: boolean
  equipped?: boolean
  stackable?: boolean
}

export const Item = ({ name, dropped = false, equipped = false, stackable = false }: ItemProps): Item => ({
  type: "item", name, dropped, equipped, stackable
})

export type ItemEntity = Entity<Position | Actions | Effects | Renderable | Item>
export const ItemEntity = Entity<Position | Actions | Effects | Renderable | Item>
