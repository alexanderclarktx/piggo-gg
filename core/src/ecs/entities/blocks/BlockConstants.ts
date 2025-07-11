import { XYZ } from "@piggo-gg/core"

export const BlockDimensions = { width: 18, height: 12 }

export type Block = XYZ & { type: number }

export type BlockPlan = Block[]

export const BlockTypeInt: Record<BlockType, number> = {
  stone: 0,
  grass: 1,
  moss: 2,
  moonrock: 3,
  asteroid: 4,
  saphire: 5,
  obsidian: 6,
  ruby: 7,
  white: 8,
  wood: 9,
  leaf: 10,
  birch: 11,
}

export const BlockTypeString: Record<number, BlockType> = {
  0: "stone",
  1: "grass",
  2: "moss",
  3: "moonrock",
  4: "asteroid",
  5: "saphire",
  6: "obsidian",
  7: "ruby",
  8: "white",
  9: "wood",
  10: "leaf",
  11: "birch",
}

export type BlockType =
  "white" | "stone" | "grass" |
  "moss" | "moonrock" | "asteroid" |
  "saphire" | "obsidian" | "ruby" |
  "wood" | "leaf" | "birch"

export const BlockColors: Record<BlockType, [number, number, number]> = {
  stone: [0x7b7b7b, 0x5E5E3E, 0x9b9b9b],
  grass: [0x08d000, 0x6E260E, 0x7B3F00],
  moss: [0x02bb60, 0x6E266E, 0x7B3F60],
  moonrock: [0xcbdaf2, 0x98b0d9, 0xdddddd],
  asteroid: [0x8b8b8b, 0x6E6E6E, 0xECF0F1],
  saphire: [0x00afff, 0x007fff, 0x00cfff],
  obsidian: [0x330055, 0x550077, 0xaa00aa],
  ruby: [0x660033, 0x880000, 0xff0000],
  white: [0xffffff, 0xffffff, 0xffffff],
  wood: [0x8B4513, 0xA0522D, 0xD2691E],
  leaf: [0x00ff00, 0x00ff00, 0x00ff00],
  birch: [0xF5F5DC, 0xFFF8DC, 0xFFE4C4]
}
