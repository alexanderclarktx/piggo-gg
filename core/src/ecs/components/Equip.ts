import { Component } from "@piggo-gg/core";

export type Equip = Component<"equip"> & {
  dropped: boolean
  equipped: boolean
}

export type EquipProps = {
  dropped?: boolean
  equipped?: boolean
}

export const Equip = ({ dropped = false, equipped = false }: EquipProps = {}): Equip => ({
  type: "equip",
  dropped,
  equipped
})
