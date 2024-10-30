import { Actions, Component, Effects, Entity, Name, Renderable, Position } from "@piggo-gg/core";

export type Item = Component<"equip"> & {
  dropped: boolean
  equipped: boolean
  stackable?: boolean
}

export type ItemProps = {
  dropped?: boolean
  equipped?: boolean
  stackable?: boolean
}

export const Item = ({ dropped = false, equipped = false, stackable = false }: ItemProps = {}): Item => ({
  type: "equip", dropped, equipped, stackable
})

export type ItemEntity = Entity<Name | Position | Actions | Effects | Renderable | Item>
export const ItemEntity = Entity<Name | Position | Actions | Effects | Renderable | Item>
